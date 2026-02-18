import { task } from "@trigger.dev/sdk/v3";
import { aiGenerator } from "../trigger/workflow-nodes";
import prisma from "../lib/prisma";

// --------------------
// Types
// --------------------

interface NodeData {
  id: string;
  type: string;
  data: any;
}

interface EdgeData {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
}

interface ExecutionContext {
  [nodeId: string]: {
    text?: string;
    imageUrls?: string[];
    videoUrl?: string;
  };
}

// --------------------
// Topological Sort
// --------------------

function getTopologicalOrder(nodes: NodeData[], edges: EdgeData[]) {
  const inDegree = new Map<string, number>();
  const adj = new Map<string, string[]>();

  nodes.forEach((n) => {
    inDegree.set(n.id, 0);
    adj.set(n.id, []);
  });

  edges.forEach((edge) => {
    if (adj.has(edge.source) && adj.has(edge.target)) {
      adj.get(edge.source)!.push(edge.target);
      inDegree.set(edge.target, (inDegree.get(edge.target) || 0) + 1);
    }
  });

  const queue: string[] = [];
  inDegree.forEach((degree, id) => {
    if (degree === 0) queue.push(id);
  });

  const sorted: NodeData[] = [];

  while (queue.length > 0) {
    const currentId = queue.shift()!;
    const node = nodes.find((n) => n.id === currentId);
    if (node) sorted.push(node);

    const neighbors = adj.get(currentId) || [];
    for (const neighbor of neighbors) {
      inDegree.set(neighbor, (inDegree.get(neighbor) || 0) - 1);
      if (inDegree.get(neighbor) === 0) {
        queue.push(neighbor);
      }
    }
  }

  return sorted;
}

// --------------------
// Orchestrator
// --------------------

export const orchestrator = task({
  id: "workflow-orchestrator",

  run: async (payload: { runId: string }) => {
    const run = await prisma.workflowRun.findUnique({
      where: { id: payload.runId },
      include: { workflow: true },
    });

    if (!run) throw new Error("Run not found");

    // ✅ Safe JSON casting (strict-mode compatible)
    const nodes = Array.isArray(run.workflow.nodes)
      ? (run.workflow.nodes as unknown as NodeData[])
      : [];

    const edges = Array.isArray(run.workflow.edges)
      ? (run.workflow.edges as unknown as EdgeData[])
      : [];

    const executionPlan = getTopologicalOrder(nodes, edges);

    const context: ExecutionContext = {};

    for (const node of executionPlan) {
      console.log("Processing:", node.type);

      // --------------------
      // TEXT NODE
      // --------------------
      if (node.type === "textNode") {
        context[node.id] = { text: node.data.text };
        continue;
      }

      // --------------------
      // IMAGE NODE
      // --------------------
      if (node.type === "imageNode") {
        const url = node.data.file?.url || node.data.image;
        if (url) {
          context[node.id] = { imageUrls: [url] };
        }
        continue;
      }

      // --------------------
      // UPLOAD VIDEO NODE
      // --------------------
      if (node.type === "uploadVideo") {
        const url = node.data.file?.url || node.data.videoUrl;
        if (url) {
          context[node.id] = { videoUrl: url };
        }
        continue;
      }

      // --------------------
      // CROP IMAGE NODE
      // --------------------
      if (node.type === "cropImage") {
        const incomingEdges = edges.filter((e) => e.target === node.id);

        let imageUrl: string | undefined;

        for (const edge of incomingEdges) {
          const sourceData = context[edge.source];
          if (sourceData?.imageUrls?.length) {
            imageUrl = sourceData.imageUrls[0];
          }
        }

        if (!imageUrl) {
          throw new Error("CropImageNode missing image input");
        }

        // ⚠️ Replace later with real Trigger.dev crop task
        context[node.id] = {
          imageUrls: [imageUrl],
        };

        continue;
      }

      // --------------------
      // EXTRACT FRAME NODE
      // --------------------
      if (node.type === "extractFrame") {
        const incomingEdges = edges.filter((e) => e.target === node.id);

        let videoUrl: string | undefined;

        for (const edge of incomingEdges) {
          const sourceData = context[edge.source];
          if (sourceData?.videoUrl) {
            videoUrl = sourceData.videoUrl;
          }
        }

        if (!videoUrl) {
          throw new Error("ExtractFrameNode missing video input");
        }

        // ⚠️ Replace later with real Trigger.dev frame task
        context[node.id] = {
          imageUrls: [videoUrl],
        };

        continue;
      }

      // --------------------
      // LLM NODE
      // --------------------
      if (node.type === "llmNode") {
        const incomingEdges = edges.filter((e) => e.target === node.id);

        let aggregatedText = "";
        let aggregatedImages: string[] = [];

        for (const edge of incomingEdges) {
          const sourceData = context[edge.source];
          if (!sourceData) continue;

          if (sourceData.text) {
            aggregatedText += `\n${sourceData.text}`;
          }

          if (sourceData.imageUrls) {
            aggregatedImages.push(...sourceData.imageUrls);
          }
        }

        const nodeRun = await prisma.nodeRun.create({
          data: {
            workflowRunId: run.id,
            nodeId: node.id,
            nodeType: node.type,
            status: "RUNNING",
            input: {
              prompt: node.data.prompt,
              context: aggregatedText,
            },
            createdAt: new Date(),
          },
        });

        try {
          const result = await aiGenerator.triggerAndWait({
            prompt: node.data.prompt,
            systemPrompt: aggregatedText,
            imageUrls: aggregatedImages,
            model: node.data.model || "gemini-1.5-flash",
            temperature: node.data.temperature ?? 0.7,
          });

          if (!result.ok) {
            throw new Error(result.error ?? "LLM execution failed");
          }

          context[node.id] = {
            text: result.output.text,
          };

          await prisma.nodeRun.update({
            where: { id: nodeRun.id },
            data: {
              status: "SUCCESS",
              output: result.output,
              durationMs: 0,
            },
          });

        } catch (error: unknown) {
          const errorMessage =
            error instanceof Error ? error.message : String(error);

          await prisma.nodeRun.update({
            where: { id: nodeRun.id },
            data: {
              status: "FAILED",
              error: errorMessage,
            },
          });

          await prisma.workflowRun.update({
            where: { id: run.id },
            data: { status: "FAILED" },
          });

          throw new Error(String(errorMessage));
        }
      }
    }

    await prisma.workflowRun.update({
      where: { id: run.id },
      data: { status: "SUCCESS" },
    });

    return { success: true };
  },
});

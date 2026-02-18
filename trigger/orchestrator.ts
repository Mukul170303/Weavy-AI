import { task } from "@trigger.dev/sdk/v3";
import { aiGenerator } from "./workflow-nodes";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// --- Types ---
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

// Memory to store outputs of previous nodes
interface ExecutionContext {
    [nodeId: string]: {
        text?: string;
        imageUrls?: string[];
    };
}

// --- Algorithm: Topological Sort ---
function getTopologicalOrder(nodes: NodeData[], edges: EdgeData[]): NodeData[] {
    const inDegree = new Map<string, number>();
    const adj = new Map<string, string[]>();

    // Init
    nodes.forEach((n) => {
        inDegree.set(n.id, 0);
        adj.set(n.id, []);
    });

    // Build Graph
    edges.forEach((edge) => {
        if (adj.has(edge.source) && adj.has(edge.target)) {
            adj.get(edge.source)!.push(edge.target);
            inDegree.set(edge.target, (inDegree.get(edge.target) || 0) + 1);
        }
    });

    // Find Start Nodes (Degree 0)
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

export const orchestrator = task({
    id: "workflow-orchestrator",
    run: async (payload: { runId: string }) => {
        // 1. Load Workflow
        const run = await prisma.workflowRun.findUnique({
            where: { id: payload.runId },
            include: { workflow: true },
        });
        if (!run) throw new Error("Run not found");

        const graph = run.workflow.data as any;
        const nodes: NodeData[] = graph.nodes || [];
        const edges: EdgeData[] = graph.edges || [];

        // 2. Sort Execution Order
        const executionPlan = getTopologicalOrder(nodes, edges);

        console.log(`🚀 [Orchestrator] Starting Run: ${run.id}`);
        console.log(`📋 [Orchestrator] Plan: ${executionPlan.map((n) => n.type).join(" -> ")}`);

        // 3. Context (Memory)
        const context: ExecutionContext = {};

        // 4. Execution Loop
        for (const node of executionPlan) {
            console.log(`⚡ [Orchestrator] Processing: ${node.type} (${node.id})`);

            // --- A. PASSIVE NODES (Just Load Data) ---
            if (node.type === "textNode") {
                context[node.id] = { text: node.data.text };
                continue;
            }

            if (node.type === "imageNode") {
                // Handle both File Upload (file.url) and Demo Image (image)
                const url = node.data.file?.url || node.data.image;
                if (url) context[node.id] = { imageUrls: [url] };
                continue;
            }

            // --- B. ACTIVE NODES (Run Tasks) ---
            if (node.type === "llmNode") {
                // GATHER INPUTS from Context
                const incomingEdges = edges.filter((e) => e.target === node.id);

                let aggregatedText = "";
                let aggregatedImages: string[] = [];

                for (const edge of incomingEdges) {
                    const sourceData = context[edge.source];
                    if (!sourceData) continue;

                    // 1. Text Inputs (from TextNode OR previous LLMNode)
                    if (sourceData.text) {
                        // If connecting to "System Prompt" handle
                        if (edge.targetHandle === "system-prompt") {
                            aggregatedText = `[System Context]: ${sourceData.text}\n\n` + aggregatedText;
                        } else {
                            aggregatedText += `\n[Context from previous step]: ${sourceData.text}`;
                        }
                    }

                    // 2. Image Inputs
                    if (sourceData.imageUrls) {
                        aggregatedImages.push(...sourceData.imageUrls);
                    }
                }

                // DB Record: Running
                const executionRecord = await prisma.nodeExecution.create({
                    data: {
                        runId: run.id,
                        nodeId: node.id,
                        nodeType: node.type,
                        status: "RUNNING",
                        startedAt: new Date(),
                        inputData: { ...node.data, contextInputs: aggregatedText }
                    }
                });

                try {
                    // Trigger the Worker Task
                    const userPrompt = node.data.prompt || "Analyze this input.";

                    const result = await aiGenerator.triggerAndWait({
                        prompt: userPrompt,
                        systemPrompt: aggregatedText, // Pass previous outputs as system context
                        imageUrls: aggregatedImages,
                        model: node.data.model || "gemini-1.5-flash",
                        temperature: node.data.temperature
                    });

                    // Update Context for NEXT nodes
                    if (result.ok) {
                        // 👇 FIX IS HERE: Use 'result.output.text', not 'result.data.text'
                        context[node.id] = { text: result.output.text };
                    } else {
                        throw new Error(`Task failed: ${result.error}`);
                    }

                    // DB Record: Success
                    await prisma.nodeExecution.update({
                        where: { id: executionRecord.id },
                        data: {
                            status: "SUCCESS",
                            finishedAt: new Date(),
                            outputData: result.output as any // Use result.output here too
                        }
                    });

                } catch (error) {
                    console.error(`❌ Node ${node.id} Failed`);
                    await prisma.nodeExecution.update({
                        where: { id: executionRecord.id },
                        data: {
                            status: "FAILED",
                            finishedAt: new Date(),
                            error: String(error)
                        }
                    });
                    throw error; // Stop the flow
                }
            }
        }

        // 5. Complete Run
        await prisma.workflowRun.update({
            where: { id: run.id },
            data: { status: "COMPLETED", finishedAt: new Date() }
        });

        return { success: true };
    },
});
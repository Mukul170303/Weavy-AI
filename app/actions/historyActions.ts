"use server";

import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function getWorkflowHistoryAction(workflowId: string) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    if (!workflowId) {
      return { success: false, error: "Invalid Workflow ID" };
    }

    // ✅ WorkflowId is STRING (UUID) — NO parseInt
    const runs = await prisma.workflowRun.findMany({
      where: {
        workflowId: workflowId,
      },
      include: {
        nodeRuns: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 20,
    });

    // Format for frontend
    const formattedRuns = runs.map((run) => ({
      id: run.id,
      status: run.status,
      scope: run.scope,
      createdAt: run.createdAt.toISOString(),
      duration:
        run.durationMs != null
          ? `${(run.durationMs / 1000).toFixed(2)}s`
          : null,
      nodes: run.nodeRuns.map((node) => ({
        id: node.id,
        nodeId: node.nodeId,
        type: node.nodeType,
        status: node.status,
        input: node.input,
        output: node.output,
        error: node.error,
        duration:
          node.durationMs != null
            ? `${(node.durationMs / 1000).toFixed(2)}s`
            : null,
        createdAt: node.createdAt.toISOString(),
      })),
    }));

    return { success: true, runs: formattedRuns };
  } catch (error) {
    console.error("Fetch History Error:", error);
    return { success: false, error: "Failed to fetch history" };
  }
}

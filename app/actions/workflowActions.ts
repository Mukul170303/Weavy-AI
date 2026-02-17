"use server";

import prisma from "@/lib/prisma";
import { auth, currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { tasks } from "@trigger.dev/sdk/v3";
import type { SaveWorkflowParams } from "@/lib/types";


// ======================================================
// Ensure User Exists
// ======================================================

async function ensureUserExists(clerkId: string) {
  const dbUser = await prisma.user.findUnique({
    where: { clerkId },
  });

  if (!dbUser) {
    const clerkUser = await currentUser();
    if (!clerkUser) throw new Error("User not found in Clerk");

    await prisma.user.create({
      data: {
        clerkId,
        email: clerkUser.emailAddresses[0].emailAddress,
        name: clerkUser.firstName ?? "",
        imageUrl: clerkUser.imageUrl ?? null,
      },
    });
  }
}


// ======================================================
// SAVE WORKFLOW
// ======================================================

export async function saveWorkflowAction(
  params: SaveWorkflowParams
): Promise<
  | { success: true; id: string }
  | { success: false; error: string }
> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    await ensureUserExists(userId);

    const { id, name, nodes, edges } = params;

    if (id) {
      // UPDATE
      const workflow = await prisma.workflow.update({
        where: { id },
        data: {
          name,
          nodes: nodes as any,
          edges: edges as any,
        },
      });

      revalidatePath("/workflows");

      return { success: true, id: workflow.id };
    }

    // CREATE
    const workflow = await prisma.workflow.create({
      data: {
        name,
        nodes: nodes as any,
        edges: edges as any,
        user: {
          connect: { clerkId: userId },
        },
      },
    });

    revalidatePath("/workflows");

    return { success: true, id: workflow.id };

  } catch (error) {
    console.error("Save Error:", error);
    return { success: false, error: "Failed to save workflow." };
  }
}


// ======================================================
// LOAD WORKFLOW
// ======================================================

export async function loadWorkflowAction(
  id: string
): Promise<
  | { success: true; data: { nodes: any; edges: any }; name: string }
  | { success: false; error: string }
> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    const workflow = await prisma.workflow.findFirst({
      where: {
        id,
        user: {
          clerkId: userId,
        },
      },
    });

    if (!workflow) {
      return { success: false, error: "Workflow not found" };
    }

    return {
      success: true,
      data: {
        nodes: workflow.nodes,
        edges: workflow.edges,
      },
      name: workflow.name,
    };

  } catch (error) {
    console.error("Load Error:", error);
    return { success: false, error: "Failed to load workflow." };
  }
}


// ======================================================
// GET ALL WORKFLOWS
// ======================================================

export async function getAllWorkflowsAction(): Promise<
  | {
      success: true;
      workflows: {
        id: string;
        name: string;
        created_at: string;
        updated_at: string;
      }[];
    }
  | { success: false; error: string; workflows: [] }
> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: "Unauthorized", workflows: [] };
    }

    const workflows = await prisma.workflow.findMany({
      where: {
        user: {
          clerkId: userId,
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    const formatted = workflows.map((wf) => ({
      id: wf.id,
      name: wf.name,
      created_at: wf.createdAt.toISOString(),
      updated_at: wf.updatedAt.toISOString(),
    }));

    return { success: true, workflows: formatted };

  } catch (error) {
    console.error("Fetch Error:", error);
    return { success: false, error: "Failed to fetch workflows", workflows: [] };
  }
}


// ======================================================
// DELETE WORKFLOW
// ======================================================

export async function deleteWorkflowAction(
  id: string
): Promise<
  | { success: true }
  | { success: false; error: string }
> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    await prisma.workflow.deleteMany({
      where: {
        id,
        user: {
          clerkId: userId,
        },
      },
    });

    revalidatePath("/workflows");

    return { success: true };

  } catch (error) {
    console.error("Delete Error:", error);
    return { success: false, error: "Failed to delete workflow" };
  }
}


// ======================================================
// RUN WORKFLOW
// ======================================================

export async function runWorkflowAction(
  workflowId: string
): Promise<
  | { success: true; runId: string }
  | { success: false; error: string }
> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    const run = await prisma.workflowRun.create({
      data: {
        workflowId,
        status: "PENDING",
        scope: "FULL",
      },
    });

    await tasks.trigger("workflow-orchestrator", {
      runId: run.id,
    });

    return { success: true, runId: run.id };

  } catch (error) {
    console.error("Run Error:", error);
    return { success: false, error: "Failed to run workflow" };
  }
}

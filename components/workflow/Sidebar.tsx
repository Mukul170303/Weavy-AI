"use client";

import { useWorkflowStore } from "@/store/workflow-store";
import { v4 as uuidv4 } from "uuid";
import { useEffect, useState } from "react";
import { UserButton, useUser } from "@clerk/nextjs";

export default function Sidebar() {
  const { addNode, runWorkflow, resetWorkflow } = useWorkflowStore();
  const { user, isLoaded } = useUser();

  const [workflows, setWorkflows] = useState<any[]>([]);

  /* ---------------- Fetch Saved Workflows ---------------- */

  useEffect(() => {
    if (!user) return;

    const fetchWorkflows = async () => {
      const res = await fetch("/api/workflow/list");

      if (!res.ok) return;

      const data = await res.json();
      setWorkflows(data);
    };

    fetchWorkflows();
  }, [user]);

  /* ---------------- Add Node ---------------- */

  const handleAddTextNode = () => {
    addNode({
      id: uuidv4(),
      type: "textNode",
      position: {
        x: Math.random() * 400 + 100,
        y: Math.random() * 400 + 100,
      },
      data: {
        label: "New text...",
        status: "idle",
      },
    });
  };

  /* ---------------- Save Workflow ---------------- */

  const saveWorkflow = async () => {
    if (!user) {
      alert("Please login first");
      return;
    }

    const { nodes, edges } = useWorkflowStore.getState();

    await fetch("/api/workflow/save", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: "My Workflow",
        nodes,
        edges,
      }),
    });

    alert("Workflow Saved ✅");
  };

  /* ---------------- Load Workflow ---------------- */

  const loadWorkflow = async (id: string) => {
    if (!id) return;

    const res = await fetch(`/api/workflow/${id}`);

    if (!res.ok) {
      alert("Failed to load workflow");
      return;
    }

    const data = await res.json();

    useWorkflowStore.setState({
      nodes: data.nodes || [],
      edges: data.edges || [],
    });
  };

  /* ---------------- UI ---------------- */

  if (!isLoaded) return null;

  return (
    <div className="w-60 bg-zinc-900 text-white p-4 border-r border-zinc-800 flex flex-col justify-between">
      
      {/* Top Section */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Nodes</h2>

        <button
          onClick={handleAddTextNode}
          className="w-full bg-purple-600 hover:bg-purple-700 px-3 py-2 rounded-lg text-sm"
        >
          Add Text Node
        </button>

        <button
          onClick={runWorkflow}
          className="w-full mt-3 bg-green-600 hover:bg-green-700 px-3 py-2 rounded-lg text-sm"
        >
          Run Workflow
        </button>

        <button
          onClick={resetWorkflow}
          className="w-full mt-3 bg-yellow-600 hover:bg-yellow-700 px-3 py-2 rounded-lg text-sm"
        >
          Reset Workflow
        </button>

        <button
          onClick={saveWorkflow}
          className="w-full mt-3 bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded-lg text-sm"
        >
          Save Workflow
        </button>

        <select
          onChange={(e) => loadWorkflow(e.target.value)}
          className="w-full mt-3 bg-zinc-800 p-2 rounded text-sm"
        >
          <option value="">Load Workflow</option>
          {workflows.map((wf: any) => (
            <option key={wf.id} value={wf.id}>
              {wf.name}
            </option>
          ))}
        </select>
      </div>

      {/* Bottom Section - Clerk User */}
      <div className="mt-6 flex justify-center">
        <UserButton afterSignOutUrl="/" />
      </div>
    </div>
  );
}

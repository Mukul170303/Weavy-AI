"use client";

import Sidebar from "./Sidebar";
import WorkflowCanvas from "./WorkflowCanvas";

export default function WorkflowLayout() {
  return (
    <div className="flex h-screen bg-neutral-950 text-white overflow-hidden">
      {/* Left Sidebar */}
      <Sidebar />

      {/* Canvas */}
      <div className="flex-1 relative">
        <WorkflowCanvas />
      </div>

      {/* Right Sidebar (History Panel Placeholder) */}
      <div className="w-80 bg-zinc-900 border-l border-zinc-800 p-4">
        <h2 className="text-lg font-semibold mb-4">Workflow History</h2>
        <p className="text-sm text-zinc-400">
          No runs yet.
        </p>
      </div>
    </div>
  );
}

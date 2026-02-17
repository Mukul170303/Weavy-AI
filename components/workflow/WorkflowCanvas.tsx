"use client";

import {
  ReactFlow,
  Background,
  MiniMap,
  ReactFlowProvider,
  useReactFlow,
} from "@xyflow/react";

import "@xyflow/react/dist/style.css";

import { useWorkflowStore } from "@/store/workflow-store";
import TextNode from "@/components/workflow/nodes/TextNode";

export default function WorkflowCanvas() {
  return (
    <ReactFlowProvider>
      <CanvasContent />
    </ReactFlowProvider>
  );
}

function CanvasContent() {
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
  } = useWorkflowStore();

  const nodeTypes = {
    textNode: TextNode,
  };

  return (
    <div className="h-full w-full bg-neutral-950 relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
      >
        <CanvasControls />
        <Background />
        <MiniMap />
      </ReactFlow>
    </div>
  );
}

function CanvasControls() {
  const { zoomIn, zoomOut, fitView } = useReactFlow();

  return (
    <div className="absolute bottom-4 left-4 flex gap-2 z-50">
      <button onClick={() => zoomIn()} className="px-3 py-1 bg-neutral-800 text-white rounded">
        +
      </button>
      <button onClick={() => zoomOut()} className="px-3 py-1 bg-neutral-800 text-white rounded">
        -
      </button>
      <button onClick={() => fitView()} className="px-3 py-1 bg-neutral-800 text-white rounded">
        Fit
      </button>
    </div>
  );
}

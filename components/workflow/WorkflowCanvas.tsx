"use client"

import { useMemo } from "react"
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  applyNodeChanges,
  applyEdgeChanges,
  NodeChange,
  EdgeChange,
} from "reactflow"
import "reactflow/dist/style.css"

import { useWorkflowStore } from "@/store/workflow-store"
import TextNode from "@/components/nodes/TextNode"

export default function WorkflowCanvas() {
  const { nodes, edges, setNodes, setEdges, onConnect } =
    useWorkflowStore()

  const onNodesChange = (changes: NodeChange[]) => {
    setNodes(applyNodeChanges(changes, nodes))
  }

  const onEdgesChange = (changes: EdgeChange[]) => {
    setEdges(applyEdgeChanges(changes, edges))
  }

  const nodeTypes = useMemo(
    () => ({
      textNode: TextNode,
    }),
    []
  )

  return (
    <div className="h-full w-full bg-neutral-950">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
      >
        <Background />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  )
}

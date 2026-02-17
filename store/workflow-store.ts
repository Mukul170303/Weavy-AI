"use client"

import { create } from "zustand"
import {
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  Node,
  Edge,
  Connection,
  NodeChange,
  EdgeChange,
} from "reactflow"

type WorkflowState = {
  nodes: Node[]
  edges: Edge[]

  setNodes: (nodes: Node[]) => void
  setEdges: (edges: Edge[]) => void
  setWorkflow: (nodes: Node[], edges: Edge[]) => void

  onNodesChange: (changes: NodeChange[]) => void
  onEdgesChange: (changes: EdgeChange[]) => void
  onConnect: (connection: Connection) => void

  addNode: (node: Node) => void
  resetWorkflow: () => void
  runWorkflow: () => void
}

export const useWorkflowStore = create<WorkflowState>((set, get) => ({
  nodes: [],
  edges: [],

  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),

  setWorkflow: (nodes, edges) =>
    set({
      nodes: JSON.parse(JSON.stringify(nodes)),
      edges: JSON.parse(JSON.stringify(edges)),
    }),

  onNodesChange: (changes) =>
    set({
      nodes: applyNodeChanges(changes, get().nodes),
    }),

  onEdgesChange: (changes) =>
    set({
      edges: applyEdgeChanges(changes, get().edges),
    }),

  onConnect: (connection) =>
    set({
      edges: addEdge(connection, get().edges),
    }),

  addNode: (node) =>
    set({
      nodes: [...get().nodes, node],
    }),

  resetWorkflow: () =>
    set({
      nodes: get().nodes.map((node) => ({
        ...node,
        data: { ...node.data, status: "idle" },
      })),
    }),

  runWorkflow: () => {
    const { nodes, edges } = get()

    if (nodes.length === 0) return

    // Reset all nodes first
    let updatedNodes = nodes.map((node) => ({
      ...node,
      data: { ...node.data, status: "idle" },
    }))

    // Find nodes with no incoming edges
    const startCandidates = nodes.filter(
      (node) => !edges.some((edge) => edge.target === node.id)
    )

    if (startCandidates.length === 0) return

    // Only run the first connected component
    const startNode = startCandidates[0]

    const visited = new Set<string>()
    const queue: Node[] = [startNode]

    while (queue.length > 0) {
      const current = queue.shift()!
      visited.add(current.id)

      const index = updatedNodes.findIndex((n) => n.id === current.id)

      updatedNodes[index] = {
        ...updatedNodes[index],
        data: {
          ...updatedNodes[index].data,
          status: "running",
        },
      }

      const outgoingEdges = edges.filter(
        (edge) => edge.source === current.id
      )

      for (const edge of outgoingEdges) {
        if (!visited.has(edge.target)) {
          const nextNode = nodes.find((n) => n.id === edge.target)
          if (nextNode) queue.push(nextNode)
        }
      }
    }

    set({ nodes: updatedNodes })

    // Simulate completion
    setTimeout(() => {
      const finalNodes = get().nodes.map((node) =>
        visited.has(node.id)
          ? {
              ...node,
              data: { ...node.data, status: "success" },
            }
          : node
      )

      set({ nodes: finalNodes })
    }, 1500)
  },
}))

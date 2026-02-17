import { Node, Edge } from "reactflow";

export function buildExecutionLayers(nodes: Node[], edges: Edge[]) {
  const inDegree: Record<string, number> = {};
  const adjacency: Record<string, string[]> = {};

  // Initialize
  nodes.forEach((node) => {
    inDegree[node.id] = 0;
    adjacency[node.id] = [];
  });

  // Build graph
  edges.forEach((edge) => {
    adjacency[edge.source].push(edge.target);
    inDegree[edge.target]++;
  });

  const layers: string[][] = [];
  let queue = Object.keys(inDegree).filter((id) => inDegree[id] === 0);

  while (queue.length > 0) {
    layers.push(queue);

    const nextQueue: string[] = [];

    for (const nodeId of queue) {
      for (const neighbor of adjacency[nodeId]) {
        inDegree[neighbor]--;
        if (inDegree[neighbor] === 0) {
          nextQueue.push(neighbor);
        }
      }
    }

    queue = nextQueue;
  }

  const hasCycle = Object.values(inDegree).some((deg) => deg > 0);

  if (hasCycle) {
    throw new Error("Cycle detected in workflow");
  }

  return layers;
}

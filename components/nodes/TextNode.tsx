import { Handle, Position, NodeProps } from "reactflow"

type NodeStatus = "idle" | "running" | "success" | "failed"

interface TextNodeData {
  label: string
  status: NodeStatus
}

export default function TextNode({ data }: NodeProps<TextNodeData>) {
  const statusColors: Record<NodeStatus, string> = {
    idle: "bg-zinc-800",
    running: "bg-blue-600 animate-pulse",
    success: "bg-green-600",
    failed: "bg-red-600",
  }

  return (
    <div
      className={`${
        statusColors[data.status || "idle"]
      } text-white rounded-xl px-4 py-3 shadow-lg min-w-[180px] relative transition-all duration-300`}
    >
      <Handle type="target" position={Position.Left} />

      <div className="text-sm font-semibold mb-2">Text Node</div>

      <textarea
        className="w-full bg-zinc-700 text-white text-xs p-2 rounded resize-none outline-none"
        rows={3}
        value={data.label}
        readOnly
      />

      <Handle type="source" position={Position.Right} />
    </div>
  )
}

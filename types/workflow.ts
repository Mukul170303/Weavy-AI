import type { Node } from "@xyflow/react";

export type NodeStatus =
  | "idle"
  | "running"
  | "success"
  | "error";

export type NodeKind =
  | "text"
  | "upload_image"
  | "upload_video"
  | "llm"
  | "crop_image"
  | "extract_frame";

export interface BaseNodeData extends Record<string, unknown> {
  type: NodeKind;
  status: NodeStatus;
  output?: any;
}

export interface TextNodeData extends BaseNodeData {
  type: "text";
  text: string;
}

export interface LLMNodeData extends BaseNodeData {
  type: "llm";
  model: string;
  systemPrompt?: string;
  userMessage?: string;
}

export type AppNodeData =
  | TextNodeData
  | LLMNodeData;

export type AppNode = Node<AppNodeData, string>;

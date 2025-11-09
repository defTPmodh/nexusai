export type UserRole = 'employee' | 'manager' | 'admin';
export type LLMProvider = 'openai' | 'deepseek' | 'minimax' | 'google';
export type DocumentStatus = 'processing' | 'completed' | 'failed';
export type AgentExecutionStatus = 'running' | 'completed' | 'failed';
export type LLMRequestStatus = 'success' | 'error';
export type MessageRole = 'user' | 'assistant' | 'system';

export interface User {
  id: string;
  auth0_id: string;
  email: string;
  name: string | null;
  role: UserRole;
  department: string | null;
  created_at: string;
  updated_at: string;
}

export interface LLMModel {
  id: string;
  provider: LLMProvider;
  model_name: string;
  display_name: string;
  cost_per_1k_input_tokens: number;
  cost_per_1k_output_tokens: number;
  max_tokens: number | null;
  is_active: boolean;
  created_at: string;
}

export interface ModelPermission {
  id: string;
  model_id: string;
  role: UserRole;
  can_use: boolean;
  created_at: string;
}

export interface ChatSession {
  id: string;
  user_id: string;
  title: string | null;
  model_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  session_id: string;
  role: MessageRole;
  content: string;
  pii_detected: boolean;
  pii_types: string[] | null;
  created_at: string;
}

export interface Document {
  id: string;
  user_id: string;
  filename: string;
  file_size: number | null;
  mime_type: string | null;
  status: DocumentStatus;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

export interface DocumentChunk {
  id: string;
  document_id: string;
  chunk_index: number;
  content: string;
  embedding: number[] | null;
  metadata: Record<string, any> | null;
  created_at: string;
}

export interface Agent {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  workflow_config: WorkflowConfig;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface WorkflowConfig {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}

export interface WorkflowNode {
  id: string;
  type: 'llm' | 'rag' | 'api' | 'conditional' | 'start' | 'end';
  position: { x: number; y: number };
  data: Record<string, any>;
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
}

export interface AgentExecution {
  id: string;
  agent_id: string;
  user_id: string;
  input_data: Record<string, any>;
  output_data: Record<string, any> | null;
  execution_trace: Record<string, any> | null;
  status: AgentExecutionStatus;
  error_message: string | null;
  cost: number;
  tokens_used: number;
  execution_time_ms: number | null;
  created_at: string;
  completed_at: string | null;
}

export interface LLMRequest {
  id: string;
  user_id: string;
  model_id: string | null;
  session_id: string | null;
  agent_execution_id: string | null;
  prompt: string;
  response: string | null;
  input_tokens: number;
  output_tokens: number;
  cost: number;
  pii_detected: boolean;
  pii_types: string[] | null;
  latency_ms: number | null;
  status: LLMRequestStatus;
  error_message: string | null;
  created_at: string;
}

export interface PIIAllowlist {
  id: string;
  pattern: string;
  description: string | null;
  created_by: string | null;
  created_at: string;
}

export interface PIIMatch {
  type: string;
  value: string;
  startIndex: number;
  endIndex: number;
}

export interface UsageAnalytics {
  total_cost: number;
  total_requests: number;
  total_input_tokens: number;
  total_output_tokens: number;
  total_tokens: number;
  user_id: string | null;
  user_email: string | null;
  model_id: string | null;
  model_name: string | null;
  provider: string | null;
}


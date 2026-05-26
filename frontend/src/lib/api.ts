/**
 * CMP API Client — typed fetch wrapper for all backend endpoints.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...options?.headers },
    ...options,
  });
  if (!res.ok) throw new Error(`API error: ${res.status} ${res.statusText}`);
  return res.json();
}

// ─── Types ───

export interface PlannerOutput {
  intent: string;
  intent_confidence: number;
  features: Record<string, boolean>;
  memory_plan: { domains: string[]; depth: number; max_nodes: number; strategy: string };
  selected_models: { name: string; estimated_latency_ms: number; reason: string }[];
  total_estimated_latency_ms: number;
  latency_budget_ms: number;
  escalated_to_llm: boolean;
  explanation: string;
}

export interface ChatResponse {
  response: string;
  planner_output: PlannerOutput;
  memories_used: Record<string, unknown>[];
  models_invoked: string[];
  total_latency_ms: number;
  explanation: Record<string, unknown>;
}

export interface GraphData {
  nodes: Record<string, unknown>[];
  edges: Record<string, unknown>[];
  stats: Record<string, number>;
}

export interface MetricsData {
  total_memories: number;
  total_entities: number;
  total_relationships: number;
  avg_response_latency_ms: number;
  avg_retrieval_latency_ms: number;
  avg_planner_latency_ms: number;
  cache_hit_rate: number;
  requests_count: number;
}

export interface IdentityData {
  confidence: number;
  motivation: number;
  curiosity: number;
  risk_tolerance: number;
  consistency: number;
}

// ─── Endpoints ───

export const api = {
  chat: (message: string, user_id = "default") =>
    request<ChatResponse>("/chat", {
      method: "POST",
      body: JSON.stringify({ message, user_id }),
    }),

  getGraph: (user_id = "default") =>
    request<GraphData>(`/graph?user_id=${user_id}`),

  getMetrics: () => request<MetricsData>("/metrics"),

  getIdentity: (user_id = "default") =>
    request<IdentityData>(`/identity?user_id=${user_id}`),

  health: () => request<{ status: string }>("/health"),
};

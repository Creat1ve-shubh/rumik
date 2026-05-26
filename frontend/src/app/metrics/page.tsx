"use client";

import { useEffect, useState } from "react";
import { api, MetricsData } from "@/lib/api";

export default function MetricsPage() {
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    loadMetrics();
    const interval = setInterval(loadMetrics, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadMetrics = async () => {
    try {
      setMetrics(await api.getMetrics());
      setError("");
    } catch {
      setError("Backend not reachable");
    }
  };

  const cards = metrics
    ? [
        { label: "Memories", value: metrics.total_memories, icon: "🧠" },
        { label: "Entities", value: metrics.total_entities, icon: "📦" },
        { label: "Relationships", value: metrics.total_relationships, icon: "🔗" },
        { label: "Avg Response", value: `${metrics.avg_response_latency_ms}ms`, icon: "⚡" },
        { label: "Avg Retrieval", value: `${metrics.avg_retrieval_latency_ms}ms`, icon: "🔍" },
        { label: "Avg Planner", value: `${metrics.avg_planner_latency_ms}ms`, icon: "🧭" },
        { label: "Cache Hit Rate", value: `${(metrics.cache_hit_rate * 100).toFixed(0)}%`, icon: "💾" },
        { label: "Requests", value: metrics.requests_count, icon: "📈" },
      ]
    : [];

  return (
    <div className="h-screen flex flex-col">
      <header className="px-6 py-4 border-b border-[var(--cmp-border)]">
        <h2 className="text-lg font-semibold">Performance Metrics</h2>
        <p className="text-xs text-[var(--cmp-text-muted)]">Real-time system health · auto-refreshes every 5s</p>
      </header>
      <div className="flex-1 overflow-y-auto p-6">
        {error && <div className="glass rounded-xl p-6 text-[var(--cmp-danger)] text-sm mb-6">{error}</div>}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map((c) => (
            <div key={c.label} className="glass rounded-xl p-5 hover:border-[var(--cmp-accent)] transition-colors">
              <div className="flex items-center justify-between mb-3">
                <span className="text-2xl">{c.icon}</span>
                <span className="text-[10px] text-[var(--cmp-text-muted)] uppercase tracking-wider">{c.label}</span>
              </div>
              <div className="text-2xl font-bold gradient-text">{c.value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

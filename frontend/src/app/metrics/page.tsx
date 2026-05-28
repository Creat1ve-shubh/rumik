"use client";

import { useEffect, useState } from "react";
import { api, MetricsData } from "@/lib/api";
import { motion } from "framer-motion";
import { Activity, Brain, Link2, Zap, Search, Compass, Database, BarChart3 } from "lucide-react";

const CARD_CONFIG: Record<string, { icon: typeof Activity; gradient: string }> = {
  Memories: { icon: Brain, gradient: "from-[#d4854a]/20 to-[#d4854a]/5" },
  Entities: { icon: Database, gradient: "from-[#a78bfa]/20 to-[#a78bfa]/5" },
  Relationships: { icon: Link2, gradient: "from-[#34d399]/20 to-[#34d399]/5" },
  "Avg Response": { icon: Zap, gradient: "from-[#fbbf24]/20 to-[#fbbf24]/5" },
  "Avg Retrieval": { icon: Search, gradient: "from-[#22d3ee]/20 to-[#22d3ee]/5" },
  "Avg Planner": { icon: Compass, gradient: "from-[#f87171]/20 to-[#f87171]/5" },
  "Cache Hit Rate": { icon: Database, gradient: "from-[#34d399]/20 to-[#34d399]/5" },
  Requests: { icon: BarChart3, gradient: "from-[#a78bfa]/20 to-[#a78bfa]/5" },
};

const ACCENT_COLORS: Record<string, string> = {
  Memories: "#d4854a",
  Entities: "#a78bfa",
  Relationships: "#34d399",
  "Avg Response": "#fbbf24",
  "Avg Retrieval": "#22d3ee",
  "Avg Planner": "#f87171",
  "Cache Hit Rate": "#34d399",
  Requests: "#a78bfa",
};

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
        { label: "Memories", value: metrics.total_memories },
        { label: "Entities", value: metrics.total_entities },
        { label: "Relationships", value: metrics.total_relationships },
        { label: "Avg Response", value: `${metrics.avg_response_latency_ms}ms` },
        { label: "Avg Retrieval", value: `${metrics.avg_retrieval_latency_ms}ms` },
        { label: "Avg Planner", value: `${metrics.avg_planner_latency_ms}ms` },
        { label: "Cache Hit Rate", value: `${(metrics.cache_hit_rate * 100).toFixed(0)}%` },
        { label: "Requests", value: metrics.requests_count },
      ]
    : [];

  return (
    <div className="h-full flex flex-col relative" style={{ background: "var(--bg-chat)" }}>
      <div className="absolute inset-x-0 top-0 h-[250px] warm-glow z-0" />

      {/* Header */}
      <header className="relative z-10 px-8 py-6 border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 rounded-lg bg-[var(--accent-warm)]/15 flex items-center justify-center">
            <Activity className="w-4 h-4 text-[var(--accent-warm)]" />
          </div>
          <h2 className="text-xl font-semibold text-white tracking-tight">Performance Metrics</h2>
        </div>
        <p className="text-sm text-[var(--text-secondary)] ml-11">
          Real-time system health · auto-refreshes every 5s
        </p>
        <div className="ml-11 mt-2 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[var(--success)] pulse-glow" />
          <span className="text-[11px] text-[var(--text-muted)]">Live</span>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto relative z-10 p-8">
        {error && (
          <div
            className="rounded-xl p-5 text-sm text-[var(--danger)] mb-6"
            style={{ background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)" }}
          >
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map((c, i) => {
            const config = CARD_CONFIG[c.label];
            const accent = ACCENT_COLORS[c.label];
            const Icon = config?.icon || Activity;
            return (
              <motion.div
                key={c.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.3 }}
                className="rounded-xl p-5 group hover:scale-[1.02] transition-all duration-200 cursor-default"
                style={{ background: "rgba(18,18,26,0.5)", border: "1px solid var(--border-subtle)" }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`w-9 h-9 rounded-xl bg-gradient-to-br ${config?.gradient || ""} flex items-center justify-center`}
                    style={{ border: `1px solid ${accent}22` }}
                  >
                    <Icon className="w-4 h-4" style={{ color: accent }} />
                  </div>
                  <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider font-medium">
                    {c.label}
                  </span>
                </div>
                <div className="text-2xl font-bold text-white">{c.value}</div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

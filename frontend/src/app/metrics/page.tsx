"use client";

import { useEffect, useState } from "react";
import { api, MetricsData } from "@/lib/api";
import { motion } from "framer-motion";
import { Activity, Brain, Link2, Zap, Search, Compass, Database, BarChart3 } from "lucide-react";

const CARD_CONFIG: { label: string; key: string; icon: any; color: string }[] = [
  { label: "Memories", key: "total_memories", icon: Brain, color: "#E17A47" },
  { label: "Entities", key: "total_entities", icon: Database, color: "#a78bfa" },
  { label: "Relationships", key: "total_relationships", icon: Link2, color: "#34d399" },
  { label: "Avg Response", key: "avg_response_latency_ms", icon: Zap, color: "#fbbf24" },
  { label: "Avg Retrieval", key: "avg_retrieval_latency_ms", icon: Search, color: "#22d3ee" },
  { label: "Avg Planner", key: "avg_planner_latency_ms", icon: Compass, color: "#f87171" },
  { label: "Cache Hit Rate", key: "cache_hit_rate", icon: Database, color: "#34d399" },
  { label: "Requests", key: "requests_count", icon: BarChart3, color: "#a78bfa" },
];

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

  const formatValue = (key: string, raw: any) => {
    if (key === "cache_hit_rate") return `${(Number(raw) * 100).toFixed(0)}%`;
    if (key.includes("latency")) return `${raw}ms`;
    return raw;
  };

  return (
    <div className="h-full flex flex-col relative overflow-hidden">
      <div className="ambient-gradient" />

      <div className="flex-1 overflow-y-auto relative z-10" style={{ background: "var(--bg-chat-container)" }}>
        <div className="max-w-5xl mx-auto px-8 py-10">
          {/* Header */}
          <div className="flex items-center gap-3 mb-2">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: "rgba(225,122,71,0.12)", border: "1px solid rgba(225,122,71,0.15)" }}
            >
              <Activity className="w-[18px] h-[18px]" style={{ color: "var(--accent)" }} />
            </div>
            <h2 className="text-xl font-semibold text-[var(--text-primary)]">Performance Metrics</h2>
          </div>
          <div className="flex items-center gap-2 ml-12 mb-8">
            <p className="text-[0.875rem] text-[var(--text-secondary)]">Real-time system health · auto-refreshes every 5s</p>
            <span className="w-2 h-2 rounded-full pulse-glow" style={{ background: "var(--success)" }} />
          </div>

          {error && (
            <div
              className="rounded-xl p-5 text-[0.875rem] mb-6"
              style={{ background: "rgba(248,113,113,0.06)", border: "1px solid rgba(248,113,113,0.15)", color: "var(--danger)" }}
            >
              {error}
            </div>
          )}

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {CARD_CONFIG.map((card, i) => {
              const Icon = card.icon;
              const rawValue = metrics ? (metrics as any)[card.key] : "—";
              const value = metrics ? formatValue(card.key, rawValue) : "—";

              return (
                <motion.div
                  key={card.label}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04, duration: 0.3 }}
                  className="rounded-xl p-5"
                  style={{ background: "var(--bg-bubble-ai)", border: "1px solid rgba(255,255,255,0.04)" }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ background: `${card.color}15`, border: `1px solid ${card.color}20` }}
                    >
                      <Icon className="w-[18px] h-[18px]" style={{ color: card.color }} />
                    </div>
                    <span className="text-[0.75rem] text-[var(--text-muted)] uppercase tracking-wider font-medium">{card.label}</span>
                  </div>
                  <div className="text-2xl font-bold text-[var(--text-primary)]">{value}</div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

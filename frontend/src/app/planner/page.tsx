"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Play, ChevronRight } from "lucide-react";

const EXAMPLES = [
  { query: "Who is Rahul?", expected: "FACTUAL", color: "#d4854a" },
  { query: "Why am I losing motivation?", expected: "REFLECTION", color: "#a78bfa" },
  { query: "I feel overwhelmed with work", expected: "EMOTIONAL", color: "#f87171" },
  { query: "How do I know Priya?", expected: "RELATIONSHIP", color: "#34d399" },
  { query: "What are my goals for this year?", expected: "GOAL", color: "#fbbf24" },
  { query: "Summarize my week", expected: "SUMMARY", color: "#22d3ee" },
];

export default function PlannerPage() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);

  const test = async (q: string) => {
    setQuery(q);
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: q }),
      });
      setResult(await res.json());
    } catch {
      setResult({ error: "Backend not reachable" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col relative" style={{ background: "var(--bg-chat)" }}>
      {/* Warm glow */}
      <div className="absolute inset-x-0 top-0 h-[250px] warm-glow z-0" />

      {/* Header */}
      <header className="relative z-10 px-8 py-6 border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 rounded-lg bg-[var(--accent-warm)]/15 flex items-center justify-center">
            <Zap className="w-4 h-4 text-[var(--accent-warm)]" />
          </div>
          <h2 className="text-xl font-semibold text-white tracking-tight">Planner Inspector</h2>
        </div>
        <p className="text-sm text-[var(--text-secondary)] ml-11">
          Test the 4-layer cognitive query planner in real-time
        </p>
      </header>

      <div className="flex-1 overflow-y-auto relative z-10 p-8 space-y-8">
        {/* Input Bar */}
        <div className="flex gap-3 max-w-3xl">
          <div
            className="flex-1 flex items-center rounded-xl px-4 py-3 transition-all focus-within:border-[var(--accent-warm)]/30"
            style={{ background: "var(--bg-input)", border: "1px solid var(--border-input)" }}
          >
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && test(query)}
              placeholder="Enter a query to analyze..."
              className="flex-1 bg-transparent outline-none text-[14px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
            />
          </div>
          <button
            onClick={() => test(query)}
            disabled={loading || !query.trim()}
            className="px-6 py-3 rounded-xl bg-[var(--accent-warm)] text-white text-sm font-semibold flex items-center gap-2 hover:brightness-110 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <Play className="w-4 h-4" />
            Analyze
          </button>
        </div>

        {/* Examples */}
        <div>
          <h3 className="section-label mb-4">Example Queries</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {EXAMPLES.map((eq) => (
              <motion.button
                key={eq.query}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => test(eq.query)}
                className="rounded-xl p-4 text-left transition-all group"
                style={{
                  background: "rgba(18, 18, 26, 0.5)",
                  border: "1px solid var(--border-subtle)",
                }}
              >
                <p className="text-[14px] text-[var(--text-primary)] group-hover:text-white transition-colors mb-2">
                  &ldquo;{eq.query}&rdquo;
                </p>
                <div className="flex items-center gap-2">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ background: eq.color }}
                  />
                  <span className="text-[11px] font-medium" style={{ color: eq.color }}>
                    {eq.expected}
                  </span>
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center gap-3 text-[var(--text-secondary)] text-sm">
            <div className="w-5 h-5 border-2 border-[var(--accent-warm)]/30 border-t-[var(--accent-warm)] rounded-full animate-spin" />
            Analyzing cognitive layers...
          </div>
        )}

        {/* Results */}
        <AnimatePresence>
          {result && !("error" in result) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="rounded-xl overflow-hidden"
              style={{ background: "rgba(18, 18, 26, 0.6)", border: "1px solid var(--border-subtle)" }}
            >
              <div className="px-6 py-4 border-b border-[var(--border-subtle)] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ChevronRight className="w-4 h-4 text-[var(--accent-warm)]" />
                  <span className="text-sm font-semibold text-white">Planner Output</span>
                </div>
                <span className="text-[11px] font-mono text-[var(--text-muted)]">
                  {(result as any)?.total_latency_ms}ms
                </span>
              </div>
              <div className="p-6">
                <pre className="text-[12px] font-mono text-[var(--text-secondary)] overflow-x-auto whitespace-pre-wrap leading-relaxed">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {result && "error" in result && (
          <div
            className="rounded-xl p-5 text-sm text-[var(--danger)]"
            style={{ background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)" }}
          >
            {String(result.error)}
          </div>
        )}
      </div>
    </div>
  );
}

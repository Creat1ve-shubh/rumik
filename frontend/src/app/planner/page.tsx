"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Play } from "lucide-react";

const EXAMPLES = [
  { query: "Who is Rahul?", expected: "FACTUAL", color: "#E17A47" },
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
    <div className="h-full flex flex-col relative overflow-hidden">
      <div className="ambient-gradient" />

      <div className="flex-1 overflow-y-auto relative z-10" style={{ background: "var(--bg-chat-container)" }}>
        <div className="max-w-4xl mx-auto px-8 py-10">
          {/* Header */}
          <div className="flex items-center gap-3 mb-2">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: "rgba(225,122,71,0.12)", border: "1px solid rgba(225,122,71,0.15)" }}
            >
              <Zap className="w-[18px] h-[18px]" style={{ color: "var(--accent)" }} />
            </div>
            <h2 className="text-xl font-semibold text-[var(--text-primary)]">Planner Inspector</h2>
          </div>
          <p className="text-[0.875rem] text-[var(--text-secondary)] mb-8 ml-12">
            Test the 4-layer cognitive query planner in real-time
          </p>

          {/* Input */}
          <div className="flex gap-3 mb-10">
            <div
              className="flex-1 rounded-xl px-4 py-3"
              style={{ background: "var(--bg-input)", border: "1px solid rgba(255,255,255,0.06)" }}
            >
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && test(query)}
                placeholder="Enter a query to analyze..."
                className="w-full bg-transparent outline-none text-[0.875rem] text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
              />
            </div>
            <button
              onClick={() => test(query)}
              disabled={loading || !query.trim()}
              className="px-5 py-3 rounded-xl text-[0.875rem] font-semibold text-white flex items-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95"
              style={{ background: "var(--accent)" }}
            >
              <Play className="w-4 h-4" />
              Analyze
            </button>
          </div>

          {/* Examples */}
          <p className="section-label mb-4">Example Queries</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-10">
            {EXAMPLES.map((eq) => (
              <motion.button
                key={eq.query}
                whileHover={{ scale: 1.015 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => test(eq.query)}
                className="rounded-xl p-5 text-left transition-all"
                style={{ background: "var(--bg-bubble-ai)", border: "1px solid rgba(255,255,255,0.04)" }}
              >
                <p className="text-[0.875rem] text-[var(--text-primary)] mb-3">&ldquo;{eq.query}&rdquo;</p>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ background: eq.color }} />
                  <span className="text-[0.75rem] font-medium" style={{ color: eq.color }}>{eq.expected}</span>
                </div>
              </motion.button>
            ))}
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex items-center gap-3 text-[var(--text-secondary)] text-[0.875rem] mb-6">
              <div className="spinner" />
              Analyzing cognitive layers...
            </div>
          )}

          {/* Results */}
          <AnimatePresence>
            {result && !("error" in result) && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="rounded-xl overflow-hidden"
                style={{ background: "var(--bg-bubble-ai)", border: "1px solid rgba(255,255,255,0.04)" }}
              >
                <div
                  className="px-6 py-4 flex items-center justify-between"
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                >
                  <span className="text-[0.875rem] font-semibold text-[var(--text-primary)]">Planner Output</span>
                  <span className="text-[0.75rem] font-mono text-[var(--text-muted)]">{(result as any)?.total_latency_ms}ms</span>
                </div>
                <div className="p-6">
                  <pre className="text-[0.75rem] font-mono text-[var(--text-secondary)] overflow-x-auto whitespace-pre-wrap leading-relaxed">
                    {JSON.stringify(result, null, 2)}
                  </pre>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {result && "error" in result && (
            <div
              className="rounded-xl p-5 text-[0.875rem]"
              style={{ background: "rgba(248,113,113,0.06)", border: "1px solid rgba(248,113,113,0.15)", color: "var(--danger)" }}
            >
              {String(result.error)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

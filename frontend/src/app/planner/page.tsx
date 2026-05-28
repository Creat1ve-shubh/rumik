"use client";

import { useState } from "react";
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
    <div className="h-full w-full flex flex-col relative" style={{ background: "var(--bg-chat-container)" }}>
      {/* ── Ambient Gradient Background ── */}
      <div className="ambient-gradient" />

      <div className="flex-1 overflow-y-auto relative z-10 px-6 sm:px-12 lg:px-24 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-3">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{ background: "rgba(225,122,71,0.1)", border: "1px solid rgba(225,122,71,0.2)" }}
            >
              <Zap className="w-6 h-6" style={{ color: "var(--accent)" }} />
            </div>
            <div>
              <h2 className="text-[var(--fs-h1)] font-semibold text-[var(--text-primary)] tracking-tight">
                Planner Inspector
              </h2>
              <p className="text-[var(--fs-body)] text-[var(--text-secondary)] mt-1">
                Test the 4-layer cognitive query planner in real-time
              </p>
            </div>
          </div>

          <div className="h-px w-full bg-[rgba(255,255,255,0.05)] my-8" />

          {/* Input */}
          <div className="flex gap-4 mb-12">
            <div className="flex-1 glass-input rounded-[var(--radius-component)] px-5 py-4">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && test(query)}
                placeholder="Enter a query to analyze..."
                className="w-full bg-transparent outline-none text-[var(--fs-body)] text-[var(--text-primary)] input-placeholder"
              />
            </div>
            <button
              onClick={() => test(query)}
              disabled={loading || !query.trim()}
              className="px-6 py-4 rounded-[var(--radius-component)] text-[var(--fs-body)] font-medium text-white flex items-center gap-2 transition-all"
              style={{ background: "var(--accent)", opacity: (loading || !query.trim()) ? 0.5 : 1 }}
            >
              <Play className="w-5 h-5 fill-current" />
              Analyze
            </button>
          </div>

          {/* Examples */}
          <p className="section-label mb-4">Example Queries</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
            {EXAMPLES.map((eq) => (
              <button
                key={eq.query}
                onClick={() => test(eq.query)}
                className="rounded-[var(--radius-component)] p-5 text-left transition-all hover:bg-[rgba(255,255,255,0.02)]"
                style={{ background: "var(--bg-bubble-ai)", border: "1px solid rgba(255,255,255,0.04)" }}
              >
                <p className="text-[var(--fs-body)] text-[var(--text-primary)] mb-4 leading-snug">
                  &ldquo;{eq.query}&rdquo;
                </p>
                <div className="flex items-center gap-2 mt-auto">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: eq.color }} />
                  <span className="text-[var(--fs-sm)] font-medium" style={{ color: eq.color }}>
                    {eq.expected}
                  </span>
                </div>
              </button>
            ))}
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex items-center gap-3 text-[var(--text-secondary)] text-[var(--fs-body)] mb-8">
              <div className="spinner" />
              Analyzing cognitive layers...
            </div>
          )}

          {/* Results */}
          {result && !("error" in result) && (
            <div
              className="rounded-[var(--radius-component)] overflow-hidden"
              style={{ background: "var(--bg-bubble-ai)", border: "1px solid rgba(255,255,255,0.04)" }}
            >
              <div
                className="px-6 py-4 flex items-center justify-between"
                style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
              >
                <span className="text-[var(--fs-body)] font-medium text-[var(--text-primary)]">
                  Planner Output
                </span>
                <span className="text-[var(--fs-sm)] font-mono text-[var(--accent)]">
                  {(result as any)?.total_latency_ms}ms
                </span>
              </div>
              <div className="p-6">
                <pre className="text-[var(--fs-sm)] font-mono text-[var(--text-secondary)] overflow-x-auto whitespace-pre-wrap leading-relaxed">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {result && "error" in result && (
            <div
              className="rounded-[var(--radius-component)] p-6 text-[var(--fs-body)]"
              style={{ background: "rgba(248,113,113,0.05)", border: "1px solid rgba(248,113,113,0.1)", color: "var(--danger)" }}
            >
              {String(result.error)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

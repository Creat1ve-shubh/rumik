"use client";

import { useState } from "react";

const EXAMPLES = [
  { query: "Who is Rahul?", expected: "FACTUAL" },
  { query: "Why am I losing motivation?", expected: "REFLECTION" },
  { query: "I feel overwhelmed with work", expected: "EMOTIONAL" },
  { query: "How do I know Priya?", expected: "RELATIONSHIP" },
  { query: "What are my goals for this year?", expected: "GOAL" },
  { query: "Summarize my week", expected: "SUMMARY" },
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
    <div className="h-screen flex flex-col">
      <header className="px-6 py-4 border-b border-[var(--cmp-border)]">
        <h2 className="text-lg font-semibold">Planner Inspector</h2>
        <p className="text-xs text-[var(--cmp-text-muted)]">Test the 4-layer cognitive query planner</p>
      </header>
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="flex gap-3">
          <input value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => e.key === "Enter" && test(query)} placeholder="Enter a query..." className="flex-1 bg-[var(--cmp-surface-2)] border border-[var(--cmp-border)] rounded-xl px-4 py-3 text-sm text-[var(--cmp-text)] placeholder:text-[var(--cmp-text-muted)] focus:outline-none focus:border-[var(--cmp-accent)] transition-colors" />
          <button onClick={() => test(query)} disabled={loading} className="px-5 py-3 rounded-xl bg-[var(--cmp-accent)] text-white text-sm font-medium hover:brightness-110 disabled:opacity-40 transition-all">Analyze</button>
        </div>
        <div>
          <h3 className="text-xs font-semibold text-[var(--cmp-text-muted)] uppercase tracking-wider mb-3">Examples</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {EXAMPLES.map((eq) => (
              <button key={eq.query} onClick={() => test(eq.query)} className="glass rounded-xl p-3 text-left hover:border-[var(--cmp-accent)] transition-colors group">
                <p className="text-sm group-hover:text-[var(--cmp-accent)] transition-colors">&ldquo;{eq.query}&rdquo;</p>
                <span className="text-[10px] text-[var(--cmp-text-muted)] mt-1">Expected: {eq.expected}</span>
              </button>
            ))}
          </div>
        </div>
        {result && !("error" in result) && (
          <div className="glass rounded-xl p-6">
            <h3 className="text-sm font-semibold text-[var(--cmp-accent)] mb-4">Planner Output</h3>
            <pre className="text-xs font-mono text-[var(--cmp-text-muted)] overflow-x-auto whitespace-pre-wrap">{JSON.stringify(result, null, 2)}</pre>
          </div>
        )}
        {result && "error" in result && (
          <div className="glass rounded-xl p-6 border-[var(--cmp-danger)] text-[var(--cmp-danger)] text-sm">{String(result.error)}</div>
        )}
      </div>
    </div>
  );
}

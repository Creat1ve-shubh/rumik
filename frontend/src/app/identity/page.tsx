"use client";

import { useEffect, useState } from "react";
import { api, IdentityData } from "@/lib/api";

const TRAIT_META: Record<string, { icon: string; color: string }> = {
  confidence: { icon: "💪", color: "var(--cmp-accent)" },
  motivation: { icon: "🔥", color: "var(--cmp-warning)" },
  curiosity: { icon: "🔬", color: "var(--cmp-cyan)" },
  risk_tolerance: { icon: "🎯", color: "var(--cmp-danger)" },
  consistency: { icon: "📐", color: "var(--cmp-success)" },
};

export default function IdentityPage() {
  const [identity, setIdentity] = useState<IdentityData | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .getIdentity()
      .then(setIdentity)
      .catch(() => setError("Backend not reachable"));
  }, []);

  return (
    <div className="h-screen flex flex-col">
      <header className="px-6 py-4 border-b border-[var(--cmp-border)]">
        <h2 className="text-lg font-semibold">Identity Timeline</h2>
        <p className="text-xs text-[var(--cmp-text-muted)]">Longitudinal personality evolution · Phase 6</p>
      </header>
      <div className="flex-1 overflow-y-auto p-6">
        {error && <div className="glass rounded-xl p-6 text-[var(--cmp-danger)] text-sm mb-6">{error}</div>}
        {identity && (
          <div className="space-y-4 max-w-xl">
            {Object.entries(identity).map(([trait, value]) => {
              const meta = TRAIT_META[trait];
              if (!meta) return null;
              const pct = (Number(value) * 100).toFixed(0);
              return (
                <div key={trait} className="glass rounded-xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{meta.icon}</span>
                      <span className="text-sm font-medium capitalize">{trait.replace("_", " ")}</span>
                    </div>
                    <span className="text-sm font-mono" style={{ color: meta.color }}>{pct}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-[var(--cmp-surface-2)] overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: meta.color }} />
                  </div>
                </div>
              );
            })}
            <div className="glass rounded-xl p-5 border-dashed opacity-60">
              <p className="text-xs text-[var(--cmp-text-muted)] text-center">
                🔮 Timeline visualization will be added in Phase 6 — tracks how these traits evolve over conversations.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

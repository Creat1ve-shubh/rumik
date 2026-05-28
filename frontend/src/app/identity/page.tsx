"use client";

import { useEffect, useState } from "react";
import { api, IdentityData } from "@/lib/api";
import { motion } from "framer-motion";
import { Fingerprint } from "lucide-react";

const TRAIT_META: Record<string, { label: string; color: string; bg: string }> = {
  confidence: { label: "Confidence", color: "#d4854a", bg: "rgba(212,133,74,0.15)" },
  motivation: { label: "Motivation", color: "#fbbf24", bg: "rgba(251,191,36,0.15)" },
  curiosity: { label: "Curiosity", color: "#22d3ee", bg: "rgba(34,211,238,0.15)" },
  risk_tolerance: { label: "Risk Tolerance", color: "#f87171", bg: "rgba(248,113,113,0.15)" },
  consistency: { label: "Consistency", color: "#34d399", bg: "rgba(52,211,153,0.15)" },
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
    <div className="h-full flex flex-col relative" style={{ background: "var(--bg-chat)" }}>
      <div className="absolute inset-x-0 top-0 h-[250px] warm-glow z-0" />

      {/* Header */}
      <header className="relative z-10 px-8 py-6 border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 rounded-lg bg-[var(--accent-warm)]/15 flex items-center justify-center">
            <Fingerprint className="w-4 h-4 text-[var(--accent-warm)]" />
          </div>
          <h2 className="text-xl font-semibold text-white tracking-tight">Identity Timeline</h2>
        </div>
        <p className="text-sm text-[var(--text-secondary)] ml-11">
          Longitudinal personality evolution · Phase 6
        </p>
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

        {identity && (
          <div className="space-y-4 max-w-2xl">
            {Object.entries(identity).map(([trait, value], i) => {
              const meta = TRAIT_META[trait];
              if (!meta) return null;
              const pct = Number(value) * 100;
              return (
                <motion.div
                  key={trait}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08, duration: 0.4 }}
                  className="rounded-xl p-5"
                  style={{ background: "rgba(18,18,26,0.5)", border: "1px solid var(--border-subtle)" }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center"
                        style={{ background: meta.bg, border: `1px solid ${meta.color}22` }}
                      >
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ background: meta.color }}
                        />
                      </div>
                      <span className="text-[14px] font-medium text-white">{meta.label}</span>
                    </div>
                    <span className="text-[14px] font-mono font-semibold" style={{ color: meta.color }}>
                      {pct.toFixed(0)}%
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.04)" }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 1, delay: i * 0.08 + 0.3, ease: "easeOut" }}
                      className="h-full rounded-full"
                      style={{ background: `linear-gradient(90deg, ${meta.color}88, ${meta.color})` }}
                    />
                  </div>
                </motion.div>
              );
            })}

            {/* Phase 6 placeholder */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="rounded-xl p-5 border-dashed"
              style={{ background: "rgba(18,18,26,0.3)", border: "1px dashed var(--border-subtle)" }}
            >
              <p className="text-[12px] text-[var(--text-muted)] text-center">
                Timeline visualization will be added in Phase 6 — tracks how these traits evolve over conversations.
              </p>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}

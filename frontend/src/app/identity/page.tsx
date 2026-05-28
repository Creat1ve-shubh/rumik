"use client";

import { useEffect, useState } from "react";
import { api, IdentityData } from "@/lib/api";
import { motion } from "framer-motion";
import { Fingerprint } from "lucide-react";

const TRAIT_META: Record<string, { label: string; color: string }> = {
  confidence: { label: "Confidence", color: "#E17A47" },
  motivation: { label: "Motivation", color: "#fbbf24" },
  curiosity: { label: "Curiosity", color: "#22d3ee" },
  risk_tolerance: { label: "Risk Tolerance", color: "#f87171" },
  consistency: { label: "Consistency", color: "#34d399" },
};

export default function IdentityPage() {
  const [identity, setIdentity] = useState<IdentityData | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.getIdentity().then(setIdentity).catch(() => setError("Backend not reachable"));
  }, []);

  return (
    <div className="h-full flex flex-col relative overflow-hidden">
      <div className="ambient-gradient" />

      <div className="flex-1 overflow-y-auto relative z-10" style={{ background: "var(--bg-chat-container)" }}>
        <div className="max-w-3xl mx-auto px-8 py-10">
          {/* Header */}
          <div className="flex items-center gap-3 mb-2">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: "rgba(225,122,71,0.12)", border: "1px solid rgba(225,122,71,0.15)" }}
            >
              <Fingerprint className="w-[18px] h-[18px]" style={{ color: "var(--accent)" }} />
            </div>
            <h2 className="text-xl font-semibold text-[var(--text-primary)]">Identity Timeline</h2>
          </div>
          <p className="text-[0.875rem] text-[var(--text-secondary)] mb-8 ml-12">
            Longitudinal personality evolution · Phase 6
          </p>

          {error && (
            <div
              className="rounded-xl p-5 text-[0.875rem] mb-6"
              style={{ background: "rgba(248,113,113,0.06)", border: "1px solid rgba(248,113,113,0.15)", color: "var(--danger)" }}
            >
              {error}
            </div>
          )}

          {identity && (
            <div className="space-y-4">
              {Object.entries(identity).map(([trait, value], i) => {
                const meta = TRAIT_META[trait];
                if (!meta) return null;
                const pct = Number(value) * 100;

                return (
                  <motion.div
                    key={trait}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.07, duration: 0.35 }}
                    className="rounded-xl p-5"
                    style={{ background: "var(--bg-bubble-ai)", border: "1px solid rgba(255,255,255,0.04)" }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center"
                          style={{ background: `${meta.color}15`, border: `1px solid ${meta.color}20` }}
                        >
                          <div className="w-3 h-3 rounded-full" style={{ background: meta.color }} />
                        </div>
                        <span className="text-[0.875rem] font-medium text-[var(--text-primary)]">{meta.label}</span>
                      </div>
                      <span className="text-[0.875rem] font-mono font-semibold" style={{ color: meta.color }}>
                        {pct.toFixed(0)}%
                      </span>
                    </div>

                    {/* Progress bar */}
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.04)" }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8, delay: i * 0.07 + 0.2, ease: "easeOut" }}
                        className="h-full rounded-full"
                        style={{ background: `linear-gradient(90deg, ${meta.color}66, ${meta.color})` }}
                      />
                    </div>
                  </motion.div>
                );
              })}

              {/* Phase 6 placeholder */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="rounded-xl p-5"
                style={{ background: "rgba(28,26,26,0.3)", border: "1px dashed rgba(255,255,255,0.06)" }}
              >
                <p className="text-[0.75rem] text-[var(--text-muted)] text-center">
                  Timeline visualization will be added in Phase 6 — tracks how these traits evolve over conversations.
                </p>
              </motion.div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

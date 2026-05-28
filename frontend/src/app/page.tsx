"use client";

import { useState, useRef, useEffect } from "react";
import { api, ChatResponse } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Mic, Paperclip, SlidersHorizontal, X, ArrowUp } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
  metadata?: ChatResponse;
  timestamp: Date;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [tags, setTags] = useState<string[]>(["retro", "warm light"]);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    setInput("");
    const userMsg: Message = { role: "user", content: text, timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await api.chat(text);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: res.response, metadata: res, timestamp: new Date() },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Connection to backend failed. Ensure FastAPI is running on port 8000.", timestamp: new Date() },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const removeTag = (tag: string) => setTags(tags.filter((t) => t !== tag));

  const formatTime = (d: Date) =>
    d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="h-full flex flex-col relative overflow-hidden">
      {/* ── Ambient Gradient Background ── */}
      <div className="ambient-gradient" />

      {/* ── Chat Content ── */}
      <div
        className="flex-1 overflow-y-auto relative z-10"
        style={{ background: "var(--bg-chat-container)" }}
      >
        <div className="max-w-3xl mx-auto px-8 py-10">
          {/* Empty state */}
          {messages.length === 0 && !loading && (
            <div className="flex items-center justify-center min-h-[60vh]">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center"
              >
                <div
                  className="w-16 h-16 mx-auto mb-6 rounded-2xl flex items-center justify-center"
                  style={{ background: "rgba(225,122,71,0.12)", border: "1px solid rgba(225,122,71,0.15)" }}
                >
                  <span className="text-2xl font-bold" style={{ color: "var(--accent)" }}>R</span>
                </div>
                <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-2">
                  Cognitive Memory Protocol
                </h2>
                <p className="text-[0.875rem] text-[var(--text-secondary)] leading-relaxed max-w-md">
                  Start a conversation. Every message builds your memory graph —
                  entities, relationships, and emotions are extracted in real-time.
                </p>
              </motion.div>
            </div>
          )}

          {/* Messages */}
          <div className="space-y-8">
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {/* AI Avatar */}
                {msg.role === "assistant" && (
                  <div
                    className="w-8 h-8 shrink-0 rounded-full flex items-center justify-center mt-1"
                    style={{ background: "var(--bg-bubble-ai)", border: "1px solid rgba(255,255,255,0.06)" }}
                  >
                    <span className="text-[11px] font-bold" style={{ color: "var(--accent)" }}>R</span>
                  </div>
                )}

                <div className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"} max-w-[75%]`}>
                  {/* Bubble */}
                  <div
                    className="px-5 py-3.5 text-[0.875rem] leading-[1.6]"
                    style={{
                      background: msg.role === "user" ? "var(--bg-bubble-user)" : "var(--bg-bubble-ai)",
                      borderRadius: msg.role === "user"
                        ? "var(--radius-bubble) 4px var(--radius-bubble) var(--radius-bubble)"
                        : "4px var(--radius-bubble) var(--radius-bubble) var(--radius-bubble)",
                      color: "var(--text-primary)",
                    }}
                  >
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                  </div>

                  {/* Timestamp */}
                  <span className="text-[0.75rem] text-[var(--text-muted)] mt-1.5 px-1">
                    {msg.role === "user" ? "You" : "Rumik"} · {formatTime(msg.timestamp)}
                  </span>

                  {/* Planner telemetry (AI only) */}
                  {msg.role === "assistant" && msg.metadata && (
                    <div
                      className="mt-3 w-full rounded-xl p-4 space-y-2 text-[0.75rem]"
                      style={{ background: "rgba(28,26,26,0.7)", border: "1px solid rgba(255,255,255,0.04)" }}
                    >
                      <div className="flex items-center justify-between">
                        <span className="section-label">Pipeline</span>
                        <span className="font-mono text-[0.75rem]" style={{ color: "var(--accent)" }}>
                          {msg.metadata.total_latency_ms}ms
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        <span
                          className="px-2 py-1 rounded-md text-[0.75rem]"
                          style={{ background: "var(--bg-bubble-user)", color: "var(--text-secondary)" }}
                        >
                          {msg.metadata.planner_output.intent}
                          <span className="text-[var(--text-muted)] ml-1">
                            {(msg.metadata.planner_output.intent_confidence * 100).toFixed(0)}%
                          </span>
                        </span>
                        {msg.metadata.models_invoked.map((m) => (
                          <span
                            key={m}
                            className="px-2 py-1 rounded-md text-[0.75rem] font-medium"
                            style={{ background: "rgba(225,122,71,0.1)", color: "var(--accent)" }}
                          >
                            {m}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* User Avatar */}
                {msg.role === "user" && (
                  <div className="w-8 h-8 shrink-0 rounded-full bg-gradient-to-br from-[#E17A47] to-[#a85a30] flex items-center justify-center mt-1 overflow-hidden">
                    <span className="text-[11px] font-bold text-white">U</span>
                  </div>
                )}
              </motion.div>
            ))}

            {/* Typing Indicator */}
            <AnimatePresence>
              {loading && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex gap-3"
                >
                  <div
                    className="w-8 h-8 shrink-0 rounded-full flex items-center justify-center"
                    style={{ background: "var(--bg-bubble-ai)", border: "1px solid rgba(255,255,255,0.06)" }}
                  >
                    <span className="text-[11px] font-bold" style={{ color: "var(--accent)" }}>R</span>
                  </div>
                  <div
                    className="flex items-center gap-3 px-5 py-3.5"
                    style={{
                      background: "var(--bg-bubble-ai)",
                      borderRadius: "4px var(--radius-bubble) var(--radius-bubble) var(--radius-bubble)",
                    }}
                  >
                    <div className="spinner" />
                    <span className="text-[0.875rem] text-[var(--text-secondary)]">Processing memory, please wait</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div ref={bottomRef} />
          </div>
        </div>
      </div>

      {/* ── Prompt Input (Fixed Bottom) ── */}
      <div className="relative z-10 px-8 pb-5 pt-3" style={{ background: "transparent" }}>
        <div className="max-w-3xl mx-auto">
          {/* Input Container */}
          <div
            className="rounded-2xl px-5 py-3"
            style={{
              background: "var(--bg-input)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            {/* Input Row */}
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Describe what needs to be created"
              className="w-full bg-transparent border-none outline-none text-[0.875rem] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] py-1.5"
            />

            {/* Action Bar */}
            <div className="flex items-center justify-between mt-2.5 pt-2" style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
              <div className="flex items-center gap-2">
                {/* Utility Icons */}
                <button className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors">
                  <Paperclip className="w-4 h-4" />
                </button>
                <button className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors">
                  <SlidersHorizontal className="w-4 h-4" />
                </button>

                {/* Tags / Chips */}
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-[0.75rem] text-[var(--text-secondary)] cursor-default"
                    style={{ background: "var(--bg-bubble-user)" }}
                  >
                    {tag}
                    <button
                      onClick={() => removeTag(tag)}
                      className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-1.5">
                <button className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors">
                  <Mic className="w-4 h-4" />
                </button>
                <button
                  onClick={sendMessage}
                  disabled={loading || !input.trim()}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white disabled:opacity-20 disabled:cursor-not-allowed transition-all active:scale-95"
                  style={{ background: input.trim() ? "var(--accent)" : "var(--bg-bubble-user)" }}
                >
                  <ArrowUp className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Footer */}
          <p className="text-center text-[0.75rem] text-[var(--text-muted)] mt-3 leading-relaxed">
            Content creation is limited by our safety rules and Terms & Conditions. For full details, please review our policy.{" "}
            <span className="underline cursor-pointer hover:text-[var(--text-secondary)] transition-colors">Learn more</span>
          </p>
        </div>
      </div>
    </div>
  );
}

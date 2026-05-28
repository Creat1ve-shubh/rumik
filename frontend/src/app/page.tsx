"use client";

import { useState, useRef, useEffect } from "react";
import { api, ChatResponse } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Mic, Paperclip, SlidersHorizontal, X, Bot, User } from "lucide-react";

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
  const [tags, setTags] = useState<string[]>([]);
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
      const assistantMsg: Message = {
        role: "assistant",
        content: res.response,
        metadata: res,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Connection to the CMP backend failed. Ensure the FastAPI server is running on port 8000.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const removeTag = (tag: string) => setTags(tags.filter((t) => t !== tag));

  const formatTime = (d: Date) =>
    d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="h-full flex flex-col relative" style={{ background: "var(--bg-chat)" }}>
      {/* ─── Warm Glow at Top ─── */}
      <div className="absolute inset-x-0 top-0 h-[300px] warm-glow z-0" />

      {/* ─── Messages ─── */}
      <div className="flex-1 overflow-y-auto relative z-10 px-6 sm:px-12 lg:px-20 py-8">
        {/* Empty State */}
        {messages.length === 0 && !loading && (
          <div className="flex items-center justify-center h-full">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center max-w-sm"
            >
              <div className="w-14 h-14 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-[#d4854a]/20 to-[#d4854a]/5 border border-[var(--border-subtle)] flex items-center justify-center">
                <Bot className="w-7 h-7 text-[var(--accent-warm)]" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Cognitive Memory Protocol
              </h3>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                Start a conversation. Every message builds your memory graph —
                entities, relationships, beliefs, and emotions are extracted in real-time.
              </p>
            </motion.div>
          </div>
        )}

        {/* Messages */}
        <div className="space-y-6 max-w-3xl mx-auto">
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.05 }}
              className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
            >
              {/* Avatar */}
              <div className="w-8 h-8 shrink-0 rounded-full overflow-hidden mt-1">
                {msg.role === "user" ? (
                  <div className="w-full h-full bg-gradient-to-br from-[#d4854a] to-[#925a2e] flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                ) : (
                  <div className="w-full h-full bg-[#1e1e2a] border border-[var(--border-subtle)] flex items-center justify-center">
                    <span className="text-xs font-bold text-[var(--accent-warm)]">R</span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className={`flex flex-col max-w-[80%] ${msg.role === "user" ? "items-end" : "items-start"}`}>
                <div
                  className={`px-5 py-3.5 text-[14px] leading-[1.65] rounded-2xl ${
                    msg.role === "user"
                      ? "bg-[var(--bg-bubble-user)] text-[var(--text-primary)] rounded-tr-md"
                      : "bg-[var(--bg-bubble-bot)] text-[var(--text-primary)] rounded-tl-md border border-[var(--border-subtle)]"
                  }`}
                >
                  <div className="whitespace-pre-wrap">{msg.content}</div>
                </div>

                {/* Timestamp */}
                <span className="text-[11px] text-[var(--text-muted)] mt-1.5 px-2">
                  {formatTime(msg.timestamp)}
                </span>

                {/* Planner Telemetry (bot only) */}
                {msg.role === "assistant" && msg.metadata && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    transition={{ delay: 0.2, duration: 0.3 }}
                    className="mt-3 w-full"
                  >
                    <div className="rounded-xl bg-[rgba(18,18,26,0.5)] border border-[var(--border-subtle)] p-4 space-y-3 text-xs backdrop-blur-sm">
                      <div className="flex items-center justify-between">
                        <span className="section-label">Cognitive Pipeline</span>
                        <span className="font-mono text-[var(--accent-warm)] text-[10px]">
                          {msg.metadata.total_latency_ms}ms
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        <span className="px-2 py-1 rounded-md bg-white/[0.04] text-[var(--text-secondary)] border border-[var(--border-subtle)]">
                          Intent: <span className="text-white font-medium">{msg.metadata.planner_output.intent}</span>
                        </span>
                        <span className="px-2 py-1 rounded-md bg-white/[0.04] text-[var(--text-secondary)] border border-[var(--border-subtle)]">
                          Confidence: <span className="text-white font-medium">{(msg.metadata.planner_output.intent_confidence * 100).toFixed(0)}%</span>
                        </span>
                        {msg.metadata.models_invoked.map((m) => (
                          <span
                            key={m}
                            className="px-2 py-1 rounded-md bg-[var(--accent-warm)]/10 text-[var(--accent-warm)] border border-[var(--accent-warm)]/20 font-medium"
                          >
                            {m}
                          </span>
                        ))}
                      </div>

                      {msg.metadata.planner_output.escalated_to_llm && (
                        <div className="flex items-center gap-1.5 text-[var(--warning)] pt-1">
                          <span className="text-[10px]">⚠</span>
                          <span className="text-[10px]">Low confidence — escalated to LLM</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          ))}

          {/* Typing Indicator */}
          <AnimatePresence>
            {loading && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex gap-3"
              >
                <div className="w-8 h-8 shrink-0 rounded-full bg-[#1e1e2a] border border-[var(--border-subtle)] flex items-center justify-center">
                  <span className="text-xs font-bold text-[var(--accent-warm)]">R</span>
                </div>
                <div className="flex items-center gap-2 px-5 py-3.5 rounded-2xl rounded-tl-md bg-[var(--bg-bubble-bot)] border border-[var(--border-subtle)]">
                  <span className="text-[13px] text-[var(--text-secondary)]">Processing memory</span>
                  <span className="flex gap-1 ml-1">
                    <span className="typing-dot" style={{ animationDelay: "0s" }} />
                    <span className="typing-dot" style={{ animationDelay: "0.2s" }} />
                    <span className="typing-dot" style={{ animationDelay: "0.4s" }} />
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div ref={bottomRef} />
        </div>
      </div>

      {/* ─── Input Area ─── */}
      <div className="relative z-10 px-6 sm:px-12 lg:px-20 pb-5 pt-2">
        <div className="max-w-3xl mx-auto">
          {/* Input Field */}
          <div
            className="flex items-center gap-2 rounded-2xl px-4 py-2 transition-all duration-200 focus-within:border-[var(--accent-warm)]/30"
            style={{
              background: "var(--bg-input)",
              border: "1px solid var(--border-input)",
            }}
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Describe what needs to be created"
              className="flex-1 bg-transparent border-none outline-none text-[14px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] py-2"
            />
            <div className="flex items-center gap-1">
              <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/[0.06] transition-colors text-[var(--text-muted)]">
                <Mic className="w-4 h-4" />
              </button>
              <button
                onClick={sendMessage}
                disabled={loading || !input.trim()}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-[var(--accent-warm)] text-white hover:brightness-110 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Tags Row */}
          <div className="flex items-center gap-2 mt-2.5 px-1">
            <button className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/[0.06] transition-colors text-[var(--text-muted)]">
              <Paperclip className="w-3.5 h-3.5" />
            </button>
            <button className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/[0.06] transition-colors text-[var(--text-muted)]">
              <SlidersHorizontal className="w-3.5 h-3.5" />
            </button>

            {tags.map((tag) => (
              <span
                key={tag}
                className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/[0.06] text-[11px] text-[var(--text-secondary)] border border-[var(--border-subtle)]"
              >
                {tag}
                <button onClick={() => removeTag(tag)} className="hover:text-white transition-colors">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>

          {/* Footer */}
          <p className="text-center text-[10px] text-[var(--text-muted)] mt-3">
            Content creation is limited by our safety rules and Terms & Conditions. For full details, please review our policy.{" "}
            <span className="underline cursor-pointer hover:text-[var(--text-secondary)] transition-colors">
              Learn more
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

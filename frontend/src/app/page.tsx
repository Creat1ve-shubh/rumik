"use client";

import { useState, useRef, useEffect } from "react";
import { api, ChatResponse } from "@/lib/api";

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
  const [showPlanner, setShowPlanner] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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
        { role: "assistant", content: "⚠ Backend not reachable. Start the FastAPI server.", timestamp: new Date() },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <header className="px-6 py-4 border-b border-[var(--cmp-border)] flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Conversation</h2>
          <p className="text-xs text-[var(--cmp-text-muted)]">
            Memories are extracted and stored in real-time
          </p>
        </div>
        <button
          onClick={() => setShowPlanner(!showPlanner)}
          className="text-xs px-3 py-1.5 rounded-lg border border-[var(--cmp-border)] text-[var(--cmp-text-muted)] hover:text-[var(--cmp-text)] hover:border-[var(--cmp-accent)] transition-colors"
        >
          {showPlanner ? "Hide" : "Show"} Planner
        </button>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-md">
              <div className="text-5xl mb-4">🧠</div>
              <h3 className="text-xl font-semibold gradient-text mb-2">
                Cognitive Memory Protocol
              </h3>
              <p className="text-sm text-[var(--cmp-text-muted)]">
                Start a conversation. Every message builds your memory graph — entities,
                relationships, beliefs, and emotions are extracted and stored persistently.
              </p>
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[70%] ${msg.role === "user" ? "" : "w-full"}`}>
              {/* Message bubble */}
              <div
                className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-[var(--cmp-accent)] text-white"
                    : "glass"
                }`}
              >
                <pre className="whitespace-pre-wrap font-[inherit]">{msg.content}</pre>
              </div>

              {/* Planner panel */}
              {msg.metadata && showPlanner && (
                <div className="mt-2 rounded-xl border border-[var(--cmp-border)] bg-[var(--cmp-surface)] p-4 space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[var(--cmp-accent)]">
                      Planner Analysis
                    </span>
                    <span className="text-[var(--cmp-text-muted)]">
                      {msg.metadata.total_latency_ms}ms
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-[var(--cmp-text-muted)]">Intent</span>
                      <p className="font-mono mt-0.5">
                        {msg.metadata.planner_output.intent}
                        <span className="text-[var(--cmp-text-muted)] ml-1">
                          ({(msg.metadata.planner_output.intent_confidence * 100).toFixed(0)}%)
                        </span>
                      </p>
                    </div>
                    <div>
                      <span className="text-[var(--cmp-text-muted)]">Domains</span>
                      <div className="flex flex-wrap gap-1 mt-0.5">
                        {msg.metadata.planner_output.memory_plan.domains.map((d) => (
                          <span key={d} className="px-1.5 py-0.5 rounded bg-[var(--cmp-surface-2)] text-[10px]">
                            {d}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <span className="text-[var(--cmp-text-muted)]">Models</span>
                    <div className="flex flex-wrap gap-1 mt-0.5">
                      {msg.metadata.models_invoked.map((m) => (
                        <span key={m} className="px-1.5 py-0.5 rounded bg-[var(--cmp-accent)]/10 text-[var(--cmp-accent)] text-[10px]">
                          {m}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[var(--cmp-border)]/50 mt-2">
                    <span className="text-[var(--cmp-text-muted)] font-semibold text-[10px] uppercase tracking-wider">Explainability: Models</span>
                    <div className="flex flex-col gap-1 mt-1">
                      {msg.metadata.explanation?.model_routing?.reasons?.map((m: any, idx: number) => (
                        <div key={idx} className="flex justify-between items-center text-[10px]">
                          <span className="text-[var(--cmp-accent)]">{m.model}</span>
                          <span className="text-[var(--cmp-text-muted)] truncate max-w-[150px] text-right" title={m.reason}>{m.reason}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[var(--cmp-border)]/50 mt-2">
                    <span className="text-[var(--cmp-text-muted)] font-semibold text-[10px] uppercase tracking-wider">Explainability: Memory</span>
                    <div className="flex flex-col gap-1 mt-1">
                      {msg.metadata.explanation?.memory_retrieval?.memories?.map((mem: any, idx: number) => (
                        <div key={idx} className="text-[10px]">
                          <div className="truncate text-[var(--cmp-text)]">"{mem.content_preview}"</div>
                          <div className="text-[var(--cmp-text-muted)] flex justify-between">
                            <span>Score: {mem.final_score.toFixed(2)}</span>
                            <span>{mem.reason}</span>
                          </div>
                        </div>
                      ))}
                      {!msg.metadata.explanation?.memory_retrieval?.memories?.length && (
                        <div className="text-[10px] text-[var(--cmp-text-muted)]">No memories retrieved</div>
                      )}
                    </div>
                  </div>

                  {msg.metadata.planner_output.escalated_to_llm && (
                    <div className="text-[var(--cmp-warning)] flex items-center gap-1 mt-2 pt-2 border-t border-[var(--cmp-border)]/50">
                      ⚠ Low confidence — escalated to LLM
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="glass rounded-2xl px-4 py-3 text-sm">
              <span className="inline-flex gap-1">
                <span className="w-2 h-2 rounded-full bg-[var(--cmp-accent)] animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 rounded-full bg-[var(--cmp-accent)] animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 rounded-full bg-[var(--cmp-accent)] animate-bounce" style={{ animationDelay: "300ms" }} />
              </span>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-6 py-4 border-t border-[var(--cmp-border)]">
        <div className="flex gap-3 items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Tell me something about yourself..."
            className="flex-1 bg-[var(--cmp-surface-2)] border border-[var(--cmp-border)] rounded-xl px-4 py-3 text-sm text-[var(--cmp-text)] placeholder:text-[var(--cmp-text-muted)] focus:outline-none focus:border-[var(--cmp-accent)] focus:ring-1 focus:ring-[var(--cmp-accent)]/30 transition-colors"
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="px-5 py-3 rounded-xl bg-[var(--cmp-accent)] text-white text-sm font-medium hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

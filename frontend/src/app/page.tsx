"use client";

import { useState, useRef, useEffect } from "react";
import { api, ChatResponse } from "@/lib/api";
import { Send, Mic, Paperclip, SlidersHorizontal, X, ArrowUp } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
  metadata?: ChatResponse;
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
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setLoading(true);

    try {
      const res = await api.chat(text);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: res.response, metadata: res },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Connection to backend failed. Please check the server." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const removeTag = (tag: string) => setTags(tags.filter((t) => t !== tag));

  return (
    <div className="h-full w-full flex flex-col relative" style={{ background: "var(--bg-chat-container)" }}>
      {/* ── Ambient Gradient Background ── */}
      <div className="ambient-gradient" />

      {/* ── Chat Area ── */}
      <div className="flex-1 overflow-y-auto relative z-10 px-6 sm:px-12 lg:px-24 py-12 pb-40">
        <div className="max-w-3xl mx-auto flex flex-col gap-8">
          
          {/* Messages */}
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-4 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              {/* AI Avatar */}
              {msg.role === "assistant" && (
                <div className="w-10 h-10 shrink-0 rounded-full bg-[var(--bg-bubble-ai)] flex items-center justify-center text-[var(--accent)] font-bold text-sm">
                  V
                </div>
              )}

              {/* Bubble Content */}
              <div
                className="px-6 py-4 max-w-[80%]"
                style={{
                  background: msg.role === "user" ? "var(--bg-bubble-user)" : "var(--bg-bubble-ai)",
                  borderRadius: msg.role === "user"
                    ? "var(--radius-bubble) 4px var(--radius-bubble) var(--radius-bubble)"
                    : "4px var(--radius-bubble) var(--radius-bubble) var(--radius-bubble)",
                }}
              >
                <div className="text-[var(--fs-body)] leading-relaxed whitespace-pre-wrap text-[var(--text-primary)]">
                  {msg.content}
                </div>

                {/* AI Planner Output Telemetry */}
                {msg.role === "assistant" && msg.metadata && (
                  <div className="mt-4 pt-4 border-t border-white/5 space-y-2">
                    <p className="text-[var(--fs-sm)] font-medium text-[var(--text-muted)] uppercase tracking-wide">
                      Cognitive Planner · {msg.metadata.total_latency_ms}ms
                    </p>
                    <div className="flex gap-2">
                      <span className="px-2 py-1 bg-[var(--bg-bubble-user)] rounded text-[var(--fs-sm)] text-[var(--text-secondary)]">
                        {msg.metadata.planner_output.intent}
                      </span>
                      {msg.metadata.models_invoked.map(m => (
                        <span key={m} className="px-2 py-1 bg-[rgba(225,122,71,0.1)] text-[var(--accent)] rounded text-[var(--fs-sm)]">
                          {m}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* User Avatar - Removed to match the reference mockup style which has no user avatar on the right, only the V on the left */}
            </div>
          ))}

          {/* Loading Indicator */}
          {loading && (
            <div className="flex gap-4">
              <div className="w-10 h-10 shrink-0 rounded-full bg-[var(--bg-bubble-ai)] flex items-center justify-center text-[var(--accent)] font-bold text-sm">
                V
              </div>
              <div className="flex items-center gap-3 text-[var(--fs-body)] text-[var(--text-secondary)]">
                <div className="spinner" />
                <span>Generating response, please wait...</span>
              </div>
            </div>
          )}
          
          <div ref={bottomRef} />
        </div>
      </div>

      {/* ── Fixed Prompt Input ── */}
      <div className="absolute bottom-6 left-0 right-0 z-20 px-6 sm:px-12 lg:px-24">
        <div className="max-w-3xl mx-auto">
          <div className="glass-input rounded-[var(--radius-component)] px-5 py-4">
            
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="Describe what needs to be created"
              className="w-full bg-transparent border-none outline-none text-[var(--fs-body)] text-[var(--text-primary)] input-placeholder resize-none mb-3"
              rows={1}
              style={{ minHeight: "24px", maxHeight: "120px" }}
            />

            <div className="flex items-center justify-between">
              {/* Left Utilities & Chips */}
              <div className="flex items-center gap-2">
                <button className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--text-muted)] hover:bg-[rgba(255,255,255,0.05)] hover:text-[var(--text-primary)] transition-colors">
                  <Paperclip className="w-4 h-4" />
                </button>
                <button className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--text-muted)] hover:bg-[rgba(255,255,255,0.05)] hover:text-[var(--text-primary)] transition-colors">
                  <SlidersHorizontal className="w-4 h-4" />
                </button>

                {tags.map((tag) => (
                  <div
                    key={tag}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--bg-bubble-user)] text-[var(--fs-sm)] text-[var(--text-secondary)]"
                  >
                    <span>{tag}</span>
                    <button
                      onClick={() => removeTag(tag)}
                      className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Right Action Buttons */}
              <div className="flex items-center gap-2">
                <button className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--text-muted)] hover:bg-[rgba(255,255,255,0.05)] hover:text-[var(--text-primary)] transition-colors">
                  <Mic className="w-4 h-4" />
                </button>
                <button
                  onClick={sendMessage}
                  disabled={loading || !input.trim()}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white bg-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.2)] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ArrowUp className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>
          
          <p className="text-center text-[var(--fs-sm)] text-[var(--text-muted)] mt-4">
            Content creation is limited by our safety rules and Terms & Conditions. For full details, please review our policy. <span className="underline cursor-pointer hover:text-[var(--text-secondary)]">Learn more</span>
          </p>
        </div>
      </div>

    </div>
  );
}

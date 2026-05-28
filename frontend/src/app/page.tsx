"use client";

import { useState, useRef, useEffect } from "react";
import { api, ChatResponse } from "@/lib/api";
import { Plus, Send, Search, Menu, Bot, User } from "lucide-react";

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
        { role: "assistant", content: "⚠ Backend not reachable. Ensure the FastAPI server is running.", timestamp: new Date() },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-white/70 backdrop-blur-xl md:rounded-r-[32px]">
      {/* Header */}
      <header className="px-8 py-6 border-b border-gray-200/50 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-black tracking-tight">Chat with CMP Assistant</h2>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-2 bg-gray-100/80 px-3 py-1.5 rounded-xl">
            <Search className="w-4 h-4 text-gray-500" />
            <input 
              type="text" 
              placeholder="Search..." 
              className="bg-transparent text-sm w-32 outline-none placeholder:text-gray-400"
            />
          </div>
          <button className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 text-gray-600 transition-colors">
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-md opacity-50">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-2xl flex items-center justify-center">
                <Bot className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-black mb-2">
                Start a conversation
              </h3>
              <p className="text-sm text-gray-500">
                Memories, intent, and entities are extracted in real-time. Say hello!
              </p>
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
            
            {/* Avatar */}
            <div className="w-8 h-8 shrink-0 rounded-full flex items-center justify-center overflow-hidden border border-gray-200">
              {msg.role === "user" ? (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center"><User className="w-4 h-4 text-gray-500" /></div>
              ) : (
                <div className="w-full h-full bg-[#ebdff7] flex items-center justify-center"><Bot className="w-4 h-4 text-[#8a5bba]" /></div>
              )}
            </div>

            <div className={`flex flex-col max-w-[75%] ${msg.role === "user" ? "items-end" : "items-start"}`}>
              {/* Message bubble */}
              <div
                className={`px-5 py-3 text-[15px] leading-relaxed shadow-sm ${
                  msg.role === "user"
                    ? "bg-[var(--cmp-bubble-user)] text-black rounded-[24px] rounded-tr-sm"
                    : "bg-[var(--cmp-bubble-bot)] text-black rounded-[24px] rounded-tl-sm"
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.content}</div>
              </div>
              
              <div className="flex items-center gap-2 mt-1.5 px-1">
                <span className="text-[11px] font-medium text-gray-400">
                  {msg.role === "user" ? "You" : "CMP Assistant"}
                </span>
                <span className="text-[11px] text-gray-400">
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              {/* Minimal Planner panel for Assistant */}
              {msg.metadata && (
                <div className="mt-2 rounded-[20px] bg-white border border-gray-100 p-4 shadow-sm space-y-2 w-full text-xs">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                    <span className="font-bold text-gray-400 text-[10px] uppercase tracking-widest">Cognitive Pipeline</span>
                    <span className="text-gray-400 font-mono text-[10px]">{msg.metadata.total_latency_ms}ms</span>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 pt-1">
                    <div className="bg-gray-50 px-2 py-1 rounded-md">
                      <span className="text-gray-400 mr-1">Intent:</span>
                      <span className="font-semibold">{msg.metadata.planner_output.intent}</span>
                    </div>
                    {msg.metadata.models_invoked.map(m => (
                      <div key={m} className="bg-purple-50 px-2 py-1 rounded-md text-purple-700 font-medium">
                        {m}
                      </div>
                    ))}
                  </div>

                  {msg.metadata.explanation?.memory_retrieval && (
                    <div className="pt-1">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Memories</span>
                      <div className="mt-1 space-y-1">
                        {(msg.metadata.explanation as any)?.memory_retrieval?.memories?.slice(0,2).map((mem: any, idx: number) => (
                          <div key={idx} className="text-gray-500 truncate bg-gray-50 px-2 py-1 rounded-md">
                            "{mem.content_preview}"
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-3 flex-row">
            <div className="w-8 h-8 shrink-0 rounded-full bg-[#ebdff7] flex items-center justify-center border border-gray-200">
              <Bot className="w-4 h-4 text-[#8a5bba]" />
            </div>
            <div className="flex flex-col items-start">
              <div className="px-5 py-4 bg-[#ebdff7] rounded-[24px] rounded-tl-sm shadow-sm flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#8a5bba]/50 animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-1.5 h-1.5 rounded-full bg-[#8a5bba]/50 animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-1.5 h-1.5 rounded-full bg-[#8a5bba]/50 animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-8 py-6 shrink-0">
        <div className="flex items-center gap-3 bg-gray-50/80 border border-gray-200/60 p-2 pl-4 rounded-full shadow-sm focus-within:ring-2 focus-within:ring-purple-500/20 focus-within:border-purple-500/30 transition-all">
          <button className="w-8 h-8 shrink-0 flex items-center justify-center rounded-full hover:bg-gray-200/60 transition-colors text-gray-500">
            <Plus className="w-5 h-5" />
          </button>
          
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Message CMP Assistant..."
            className="flex-1 bg-transparent border-none outline-none px-2 text-[15px] text-black placeholder:text-gray-400"
          />
          
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="px-6 py-3 rounded-full bg-[#111111] text-white text-[14px] font-semibold hover:bg-black/80 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center gap-2"
          >
            <span>Send</span>
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

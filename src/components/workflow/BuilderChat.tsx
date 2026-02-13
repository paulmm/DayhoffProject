"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Send,
  Loader2,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from "lucide-react";
import type { WorkflowModule, WorkflowConnection } from "./WorkflowCanvas";

interface Message {
  id: string;
  role: "ai" | "user";
  text: string;
}

interface BuilderChatProps {
  name: string;
  description: string;
  modules: WorkflowModule[];
  connections: WorkflowConnection[];
}

export default function BuilderChat({
  name,
  description,
  modules,
  connections,
}: BuilderChatProps) {
  const [expanded, setExpanded] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const buildContext = useCallback(() => {
    return {
      name,
      description,
      modules: modules.map((m) => ({
        moduleId: m.moduleId,
        name: m.name,
        category: m.category,
      })),
      connections: connections.map((c) => {
        const fromMod = modules.find((m) => m.id === c.from);
        const toMod = modules.find((m) => m.id === c.to);
        return {
          fromName: fromMod?.name || "?",
          toName: toMod?.name || "?",
          dataType: c.dataType,
          learningAnnotation: c.learningAnnotation,
        };
      }),
    };
  }, [name, description, modules, connections]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || isStreaming) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      text: trimmed,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsStreaming(true);

    const streamId = `ai-${Date.now()}`;
    const aiMsg: Message = { id: streamId, role: "ai", text: "" };
    setMessages((prev) => [...prev, aiMsg]);

    // Auto-expand when first message is sent
    if (!expanded) setExpanded(true);

    try {
      abortRef.current = new AbortController();
      const res = await fetch("/api/workflows/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: trimmed,
          context: buildContext(),
          history: messages.slice(-10).map((m) => ({ role: m.role, text: m.text })),
        }),
        signal: abortRef.current.signal,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to get response");
      }

      const contentType = res.headers.get("content-type") || "";

      if (contentType.includes("application/json")) {
        const data = await res.json();
        setMessages((prev) =>
          prev.map((m) => (m.id === streamId ? { ...m, text: data.answer } : m))
        );
      } else {
        const reader = res.body?.getReader();
        const decoder = new TextDecoder();
        let accumulated = "";

        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            accumulated += decoder.decode(value, { stream: true });
            const current = accumulated;
            setMessages((prev) =>
              prev.map((m) => (m.id === streamId ? { ...m, text: current } : m))
            );
          }
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") return;
      const errorMsg = err instanceof Error ? err.message : "Something went wrong";
      setMessages((prev) =>
        prev.map((m) =>
          m.id === streamId
            ? { ...m, text: `Sorry, I couldn't process that. ${errorMsg}` }
            : m
        )
      );
    } finally {
      setIsStreaming(false);
      abortRef.current = null;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t border-white/10 bg-dayhoff-bg-secondary">
      {/* Expanded message area */}
      {expanded && messages.length > 0 && (
        <div
          ref={scrollRef}
          className="max-h-64 overflow-y-auto border-b border-white/5 px-4 py-3"
        >
          <div className="space-y-3">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-3 py-2 text-xs leading-relaxed ${
                    msg.role === "user"
                      ? "bg-dayhoff-purple/20 text-white"
                      : "bg-white/5 text-gray-300"
                  }`}
                >
                  {msg.text || (
                    <span className="flex items-center gap-1.5 text-gray-500">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Thinking...
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Input bar */}
      <div className="flex items-center gap-2 px-4 py-2.5">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 rounded-md px-2 py-1 text-gray-500 hover:bg-white/5 hover:text-white"
          title={expanded ? "Collapse chat" : "Expand chat"}
        >
          <MessageSquare className="h-3.5 w-3.5" />
          {expanded ? (
            <ChevronDown className="h-3 w-3" />
          ) : (
            <ChevronUp className="h-3 w-3" />
          )}
        </button>

        {messages.length === 0 && (
          <Sparkles className="h-3 w-3 shrink-0 text-dayhoff-purple" />
        )}

        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            modules.length === 0
              ? "Ask me what pipeline to build for your research goal..."
              : "Ask about your pipeline, suggest modules, or get help..."
          }
          disabled={isStreaming}
          className="flex-1 bg-transparent text-xs text-white placeholder-gray-500 focus:outline-none disabled:opacity-50"
        />

        <button
          onClick={handleSend}
          disabled={!input.trim() || isStreaming}
          className="flex h-7 w-7 items-center justify-center rounded-md bg-dayhoff-purple text-white transition-all hover:bg-dayhoff-purple/80 disabled:opacity-30"
        >
          {isStreaming ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <Send className="h-3 w-3" />
          )}
        </button>
      </div>
    </div>
  );
}

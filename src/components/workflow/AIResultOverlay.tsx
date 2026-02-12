"use client";

import { useState } from "react";
import type { ComposeResult } from "./AIWorkflowComposer";
import {
  Lightbulb,
  AlertTriangle,
  CheckCircle2,
  MessageCircle,
  Send,
  Loader2,
  X,
  Brain,
  ArrowRight,
} from "lucide-react";

interface Props {
  result: ComposeResult;
  onAccept: (result: ComposeResult) => void;
  onDismiss: () => void;
}

export default function AIResultOverlay({ result, onAccept, onDismiss }: Props) {
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  const handleChat = async () => {
    const msg = chatInput.trim();
    if (!msg || chatLoading) return;

    setChatMessages((prev) => [...prev, { role: "user", content: msg }]);
    setChatInput("");
    setChatLoading(true);

    try {
      const context = `The user is discussing a workflow design. Modules: ${result.workflow.modules.map((m) => m.name).join(" → ")}. Key insight: ${result.keyInsight}. The user wants to discuss design decisions.`;

      const res = await fetch("/api/modules/general/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: `${context}\n\nUser question: ${msg}` }),
      });

      if (res.ok) {
        const data = await res.json();
        setChatMessages((prev) => [...prev, { role: "assistant", content: data.answer }]);
      } else {
        setChatMessages((prev) => [
          ...prev,
          { role: "assistant", content: "I couldn't process that request. Try rephrasing your question." },
        ]);
      }
    } catch {
      setChatMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Connection error. Please try again." },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative mx-8 flex max-h-[85vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-dayhoff-bg-secondary shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-8 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-dayhoff-purple/20">
              <Brain className="h-5 w-5 text-dayhoff-purple" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">AI Workflow Design</h2>
              <p className="text-sm text-gray-400">{result.workflow.name}</p>
            </div>
          </div>
          <button
            onClick={onDismiss}
            className="rounded-lg p-2 text-gray-400 hover:bg-white/5 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-8 py-6">
          <div className="grid grid-cols-5 gap-8">
            {/* Left column — pipeline steps (3/5) */}
            <div className="col-span-3 space-y-4">
              <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Pipeline Design
              </div>

              {/* Pipeline visualization */}
              <div className="flex items-center gap-2 overflow-x-auto rounded-xl border border-white/10 bg-white/5 p-4">
                {result.workflow.modules.map((mod, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="shrink-0 rounded-lg border border-dayhoff-purple/30 bg-dayhoff-purple/10 px-3 py-2">
                      <div className="text-xs font-semibold text-white">{mod.name}</div>
                    </div>
                    {i < result.workflow.modules.length - 1 && (
                      <ArrowRight className="h-4 w-4 shrink-0 text-gray-600" />
                    )}
                  </div>
                ))}
              </div>

              {/* Step-by-step reasoning */}
              <div className="space-y-3">
                {result.workflow.modules.map((mod, i) => (
                  <div key={i} className="rounded-xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-center gap-3">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-dayhoff-purple/20 text-xs font-bold text-dayhoff-purple">
                        {i + 1}
                      </span>
                      <span className="text-sm font-semibold text-white">{mod.name}</span>
                    </div>
                    {mod.reasoning && (
                      <p className="mt-3 pl-10 text-sm leading-relaxed text-gray-400">
                        <span className="font-semibold text-dayhoff-purple">WHY: </span>
                        {mod.reasoning}
                      </p>
                    )}
                  </div>
                ))}
              </div>

            </div>

            {/* Right column — insights & meta (2/5) */}
            <div className="col-span-2 space-y-4">
              {/* Key Insight */}
              {result.keyInsight && (
                <div className="flex gap-3 rounded-xl border border-dayhoff-emerald/20 bg-dayhoff-emerald/5 p-4">
                  <Lightbulb className="mt-0.5 h-5 w-5 shrink-0 text-dayhoff-emerald" />
                  <div>
                    <div className="text-xs font-semibold text-dayhoff-emerald">Key Insight</div>
                    <p className="mt-1 text-sm leading-relaxed text-gray-300">
                      {result.keyInsight}
                    </p>
                  </div>
                </div>
              )}

              {/* Socratic question */}
              {result.socraticQuestion && (
                <div className="rounded-xl border border-dayhoff-purple/20 bg-dayhoff-purple/5 p-4">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-dayhoff-purple">
                    <MessageCircle className="h-3.5 w-3.5" />
                    Before you finalize... (Socratic Question)
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-gray-300">
                    {result.socraticQuestion}
                  </p>
                </div>
              )}

              {/* Warnings */}
              {result.warnings.length > 0 && (
                <div className="space-y-2">
                  {result.warnings.map((w, i) => (
                    <div
                      key={i}
                      className="flex gap-2 rounded-xl border border-dayhoff-amber/20 bg-dayhoff-amber/5 p-3"
                    >
                      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-dayhoff-amber" />
                      <p className="text-xs leading-relaxed text-gray-400">{w}</p>
                    </div>
                  ))}
                </div>
              )}

            </div>
          </div>

          {/* Design Rationale + Confidence — full width below grid */}
          {(result.reasoning || result.confidenceScore != null) && (
            <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-5">
              <div className="flex items-center justify-between">
                <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Design Rationale
                </div>
                <div className="flex items-center gap-3">
                  {result.source === "fallback" && (
                    <span className="rounded-full bg-dayhoff-amber/10 px-2.5 py-0.5 text-[10px] font-semibold text-dayhoff-amber">
                      Keyword-based (no API key)
                    </span>
                  )}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">Confidence</span>
                    <div className="h-2 w-24 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-dayhoff-emerald transition-all"
                        style={{ width: `${(result.confidenceScore || 0) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs font-bold text-white">
                      {Math.round((result.confidenceScore || 0) * 100)}%
                    </span>
                  </div>
                </div>
              </div>
              {result.reasoning && (
                <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-gray-300">
                  {result.reasoning}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between border-t border-white/10 px-8 py-4">
          <button
            onClick={() => setShowChat(!showChat)}
            className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/10"
          >
            <MessageCircle className="h-4 w-4" />
            {showChat ? "Hide Discussion" : "Modify & Discuss"}
          </button>
          <div className="flex items-center gap-3">
            <button
              onClick={onDismiss}
              className="rounded-lg border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-semibold text-gray-400 hover:bg-white/10 hover:text-white"
            >
              Start Over
            </button>
            <button
              onClick={() => onAccept(result)}
              className="flex items-center gap-2 rounded-lg bg-dayhoff-purple px-6 py-2.5 text-sm font-semibold text-white hover:bg-dayhoff-purple/80"
            >
              <CheckCircle2 className="h-4 w-4" />
              Accept Workflow
            </button>
          </div>
        </div>

        {/* Discussion chat — appended below footer */}
        {showChat && (
          <div className="border-t border-white/10 px-8 py-4">
            <div className="max-h-48 space-y-2 overflow-y-auto">
              {chatMessages.length === 0 && (
                <p className="text-xs text-gray-500">
                  Ask questions about why certain modules were chosen or suggest changes.
                </p>
              )}
              {chatMessages.map((msg, i) => (
                <div
                  key={i}
                  className={`rounded-lg p-2.5 text-xs leading-relaxed ${
                    msg.role === "user"
                      ? "ml-6 bg-dayhoff-purple/10 text-gray-200"
                      : "mr-4 bg-white/5 text-gray-300"
                  }`}
                >
                  {msg.content}
                </div>
              ))}
              {chatLoading && (
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Thinking...
                </div>
              )}
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleChat();
              }}
              className="mt-3 flex gap-2"
            >
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask about the design..."
                className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-dayhoff-purple focus:outline-none"
              />
              <button
                type="submit"
                disabled={chatLoading || !chatInput.trim()}
                className="rounded-lg bg-dayhoff-purple px-4 py-2 text-white disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

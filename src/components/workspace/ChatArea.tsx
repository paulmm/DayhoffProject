"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Send, Loader2 } from "lucide-react";
import {
  useWorkspaceState,
  useWorkspaceDispatch,
  type WorkspaceStep,
} from "@/hooks/useWorkspaceReducer";
import MessageBubble from "./chat/MessageBubble";
import PdbStep from "./steps/PdbStep";
import FrameworkStep from "./steps/FrameworkStep";
import HotspotsStep from "./steps/HotspotsStep";
import ConfigStep from "./steps/ConfigStep";
import PipelineStep from "./steps/PipelineStep";
import { WORKSPACE_MESSAGES } from "@/data/workspace-messages";

const STEP_PLACEHOLDERS: Record<WorkspaceStep, string> = {
  pdb: "Ask a question or enter a PDB ID (e.g., 6M0J)...",
  framework: "Ask about frameworks or type to continue...",
  hotspots: "Ask about hotspots, epitopes, or type a custom range...",
  config: "Ask about parameters or type to continue...",
  pipeline: "Ask about the pipeline, or negotiate changes...",
  results: "Ask about your results...",
};

function getComponentForMessage(component: string | undefined) {
  switch (component) {
    case "pdb-cards":
      return <PdbStep />;
    case "framework-cards":
      return <FrameworkStep />;
    case "hotspot-selection":
      return <HotspotsStep />;
    case "config-panel":
      return <ConfigStep />;
    case "pipeline-summary":
      return <PipelineStep />;
    default:
      return null;
  }
}

export default function ChatArea() {
  const state = useWorkspaceState();
  const dispatch = useWorkspaceDispatch();
  const { messages, currentStep } = state;
  const scrollRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const hasInitialized = useRef(false);
  const abortRef = useRef<AbortController | null>(null);

  // Auto-scroll on new messages or message updates
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Initialize with greeting message on mount
  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    dispatch({
      type: "ADD_MESSAGE",
      message: {
        role: "ai",
        text: WORKSPACE_MESSAGES.pdbGreeting,
        step: "pdb",
        component: "pdb-cards",
      },
    });
  }, [dispatch]);

  const buildContext = useCallback(() => {
    return {
      currentStep: state.currentStep,
      completedSteps: state.completedSteps,
      pdbId: state.pdbId,
      pdbLoaded: state.pdbLoaded,
      availableChains: state.availableChains,
      framework: state.framework,
      hotspotRegions: state.hotspotRegions.map((r) => ({
        name: r.name,
        chain: r.chain,
        range: r.range,
        selected: r.selected,
      })),
      candidateCount: state.candidateCount,
      cdrPreference: state.cdrPreference,
      experimentId: state.experimentId,
    };
  }, [state]);

  const buildHistory = useCallback(() => {
    // Send recent conversational messages (not system/component messages) for context
    return state.messages
      .filter((m) => m.text && m.text.length > 0)
      .slice(-10)
      .map((m) => ({ role: m.role, text: m.text }));
  }, [state.messages]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || isStreaming) return;

    // Add user message
    dispatch({
      type: "ADD_MESSAGE",
      message: {
        role: "user",
        text: trimmed,
        step: currentStep,
      },
    });

    setInput("");
    setIsStreaming(true);

    // Add a placeholder AI message that we'll stream into
    const streamMessageId = `msg-stream-${Date.now()}`;
    dispatch({
      type: "ADD_MESSAGE",
      message: {
        id: streamMessageId,
        role: "ai",
        text: "",
        step: currentStep,
      },
    });

    try {
      abortRef.current = new AbortController();

      const res = await fetch("/api/workspace/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: trimmed,
          context: buildContext(),
          history: buildHistory(),
        }),
        signal: abortRef.current.signal,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to get response");
      }

      const contentType = res.headers.get("content-type") || "";

      if (contentType.includes("application/json")) {
        // Non-streaming fallback response (no API key)
        const data = await res.json();
        dispatch({
          type: "UPDATE_MESSAGE",
          id: streamMessageId,
          text: data.answer,
        });
      } else {
        // Streaming response
        const reader = res.body?.getReader();
        const decoder = new TextDecoder();
        let accumulated = "";

        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            accumulated += decoder.decode(value, { stream: true });
            dispatch({
              type: "UPDATE_MESSAGE",
              id: streamMessageId,
              text: accumulated,
            });
          }
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") return;
      const errorMsg = err instanceof Error ? err.message : "Something went wrong";
      dispatch({
        type: "UPDATE_MESSAGE",
        id: streamMessageId,
        text: `I wasn't able to process that request. ${errorMsg}. You can continue with the guided steps, or try asking again.`,
      });
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

  // Track step boundaries for dividers
  let lastStep: WorkspaceStep | null = null;

  return (
    <div className="flex h-full flex-col">
      {/* Scrollable message area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-4xl space-y-6">
          {messages.map((msg, idx) => {
            const showDivider = lastStep !== null && msg.step !== lastStep;
            lastStep = msg.step;
            const isLatest = idx === messages.length - 1;

            return (
              <div key={msg.id}>
                {showDivider && (
                  <div className="flex items-center gap-3 py-4">
                    <div className="h-px flex-1 bg-white/10" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-gray-600">
                      {msg.step.replace("-", " ")}
                    </span>
                    <div className="h-px flex-1 bg-white/10" />
                  </div>
                )}
                <MessageBubble message={msg} isLatest={isLatest}>
                  {msg.component && getComponentForMessage(msg.component)}
                </MessageBubble>
              </div>
            );
          })}

          {/* Streaming indicator */}
          {isStreaming && messages[messages.length - 1]?.text === "" && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Thinking...
            </div>
          )}
        </div>
      </div>

      {/* Bottom input bar */}
      <div className="border-t border-white/10 bg-dayhoff-bg-primary p-4">
        <div className="mx-auto flex max-w-4xl items-center gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={STEP_PLACEHOLDERS[currentStep]}
            disabled={isStreaming}
            className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-gray-500 focus:border-dayhoff-purple focus:outline-none focus:ring-1 focus:ring-dayhoff-purple disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isStreaming}
            className="flex h-11 w-11 items-center justify-center rounded-xl bg-dayhoff-purple text-white transition-all hover:bg-dayhoff-purple/80 disabled:opacity-30"
          >
            {isStreaming ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

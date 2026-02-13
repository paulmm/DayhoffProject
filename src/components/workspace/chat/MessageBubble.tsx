"use client";

import { motion } from "framer-motion";
import { Bot, User } from "lucide-react";
import { useTypewriter } from "@/hooks/useTypewriter";
import type { ChatMessage } from "@/hooks/useWorkspaceReducer";

interface MessageBubbleProps {
  message: ChatMessage;
  isLatest: boolean;
  children?: React.ReactNode; // interactive component rendered below text
}

export default function MessageBubble({
  message,
  isLatest,
  children,
}: MessageBubbleProps) {
  const isAi = message.role === "ai";
  const isStreamed = message.id.startsWith("msg-stream-");

  // Only animate typing for the latest AI message; skip for streamed messages
  // (streaming provides its own progressive reveal)
  const { displayText, isTyping, skip } = useTypewriter(message.text, {
    enabled: isAi && isLatest && !isStreamed,
    speed: 18,
  });

  const renderText = (text: string) => {
    // Simple markdown bold support (**text**)
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={i} className="font-semibold text-white">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return <span key={i}>{part}</span>;
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex gap-3 ${isAi ? "" : "flex-row-reverse"}`}
    >
      {/* Avatar */}
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
          isAi
            ? "bg-dayhoff-purple/20 text-dayhoff-purple"
            : "bg-dayhoff-emerald/20 text-dayhoff-emerald"
        }`}
      >
        {isAi ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
      </div>

      {/* Bubble */}
      <div
        className={`max-w-[85%] space-y-3 ${
          isAi ? "" : "text-right"
        }`}
      >
        <div
          className={`inline-block rounded-xl px-4 py-3 text-sm leading-relaxed ${
            isAi
              ? "bg-white/5 text-gray-300"
              : "bg-dayhoff-purple/10 text-gray-200"
          }`}
        >
          <p>{renderText(isAi ? displayText : message.text)}</p>
          {isTyping && (
            <span className="ml-1 inline-block h-4 w-0.5 animate-pulse bg-dayhoff-purple" />
          )}
        </div>

        {/* Click to skip typing */}
        {isTyping && (
          <button
            onClick={skip}
            className="text-xs text-gray-600 hover:text-gray-400"
          >
            Click to skip
          </button>
        )}

        {/* Interactive component slot */}
        {children && (
          <div className="mt-2">{children}</div>
        )}
      </div>
    </motion.div>
  );
}

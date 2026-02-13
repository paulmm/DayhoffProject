"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface UseTypewriterOptions {
  speed?: number;
  enabled?: boolean;
  onComplete?: () => void;
}

interface UseTypewriterReturn {
  displayText: string;
  isTyping: boolean;
  isComplete: boolean;
  skip: () => void;
}

export function useTypewriter(
  text: string,
  options: UseTypewriterOptions = {}
): UseTypewriterReturn {
  const { speed = 20, enabled = true, onComplete } = options;
  const [displayText, setDisplayText] = useState(enabled ? "" : text);
  const [isComplete, setIsComplete] = useState(!enabled);
  const indexRef = useRef(0);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    if (!enabled) {
      setDisplayText(text);
      setIsComplete(true);
      return;
    }

    indexRef.current = 0;
    setDisplayText("");
    setIsComplete(false);

    const tick = () => {
      if (indexRef.current >= text.length) {
        setIsComplete(true);
        onCompleteRef.current?.();
        return;
      }

      const char = text[indexRef.current];
      // Advance 1-2 chars per tick
      const advance = char === "." || char === "," ? 1 : 2;
      const nextIndex = Math.min(indexRef.current + advance, text.length);
      indexRef.current = nextIndex;
      setDisplayText(text.slice(0, nextIndex));

      // Pause slightly longer on punctuation for natural pacing
      const delay = char === "." || char === "," ? speed * 3 : speed;
      timerRef.current = window.setTimeout(tick, delay);
    };

    const timerRef = { current: window.setTimeout(tick, speed) };

    return () => clearTimeout(timerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, speed, enabled]);

  const skip = useCallback(() => {
    indexRef.current = text.length;
    setDisplayText(text);
    setIsComplete(true);
    onCompleteRef.current?.();
  }, [text]);

  return {
    displayText,
    isTyping: enabled && !isComplete,
    isComplete,
    skip,
  };
}

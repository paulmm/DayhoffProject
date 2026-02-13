"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy } from "lucide-react";

const LEVEL_COLORS: Record<string, string> = {
  BEGINNER: "text-dayhoff-amber border-dayhoff-amber/40 bg-dayhoff-amber/10",
  INTERMEDIATE: "text-dayhoff-purple border-dayhoff-purple/40 bg-dayhoff-purple/10",
  ADVANCED: "text-dayhoff-emerald border-dayhoff-emerald/40 bg-dayhoff-emerald/10",
};

const LEVEL_LABELS: Record<string, string> = {
  BEGINNER: "Beginner",
  INTERMEDIATE: "Intermediate",
  ADVANCED: "Advanced",
};

interface SkillLevelUpToastProps {
  level: string | null;
  onDismiss: () => void;
}

export default function SkillLevelUpToast({ level, onDismiss }: SkillLevelUpToastProps) {
  useEffect(() => {
    if (!level) return;
    const timer = setTimeout(onDismiss, 5000);
    return () => clearTimeout(timer);
  }, [level, onDismiss]);

  return (
    <AnimatePresence>
      {level && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2"
        >
          <div
            className={`flex items-center gap-3 rounded-xl border px-6 py-4 shadow-2xl backdrop-blur-sm ${LEVEL_COLORS[level] ?? LEVEL_COLORS.BEGINNER}`}
          >
            <Trophy className="h-6 w-6" />
            <div>
              <div className="text-sm font-bold">Level Up!</div>
              <div className="text-xs opacity-80">
                You&apos;ve reached {LEVEL_LABELS[level] ?? level} level
              </div>
            </div>
            <button
              onClick={onDismiss}
              className="ml-4 rounded-lg px-2 py-1 text-xs opacity-60 hover:opacity-100"
            >
              Dismiss
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

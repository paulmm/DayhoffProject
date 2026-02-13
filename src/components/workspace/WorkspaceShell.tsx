"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft } from "lucide-react";
import {
  useWorkspaceState,
  useWorkspaceDispatch,
} from "@/hooks/useWorkspaceReducer";
import StepNavigation from "./StepNavigation";
import ChatArea from "./ChatArea";
import EvidencePanel from "./EvidencePanel";
import EpitopeZoomModal from "./EpitopeZoomModal";

export default function WorkspaceShell() {
  const { evidencePanelOpen, epitopeModalOpen } = useWorkspaceState();
  const dispatch = useWorkspaceDispatch();

  return (
    <div className="flex h-full">
      {/* Left sidebar: step navigation */}
      <div className="w-52 shrink-0 border-r border-white/10">
        <StepNavigation />
      </div>

      {/* Center: chat area */}
      <div className="flex min-w-0 flex-1 flex-col">
        <ChatArea />
      </div>

      {/* Right sidebar: evidence panel */}
      <AnimatePresence>
        {evidencePanelOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 400, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="shrink-0 overflow-hidden border-l border-white/10"
          >
            <EvidencePanel />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reopen button when panel is closed */}
      {!evidencePanelOpen && (
        <button
          onClick={() => dispatch({ type: "TOGGLE_EVIDENCE_PANEL" })}
          className="group flex shrink-0 items-center border-l border-white/10 px-1.5 text-gray-500 transition-colors hover:bg-white/5 hover:text-white"
          title="Open Evidence & Insights"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
      )}

      {/* Fullscreen epitope modal */}
      {epitopeModalOpen && <EpitopeZoomModal />}
    </div>
  );
}

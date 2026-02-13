"use client";

import { useState } from "react";
import { CheckCircle2, SlidersHorizontal } from "lucide-react";
import { motion } from "framer-motion";
import ChoiceCardGroup from "../chat/ChoiceCardGroup";
import {
  useWorkspaceState,
  useWorkspaceDispatch,
} from "@/hooks/useWorkspaceReducer";
import { WORKSPACE_MESSAGES } from "@/data/workspace-messages";

const CDR_CARDS = [
  {
    id: "standard",
    icon: SlidersHorizontal,
    title: "Standard (10-15 res)",
    description: "Standard CDR-H3 loop length. Covers most natural antibody repertoires.",
    badge: "Default",
  },
  {
    id: "extended",
    icon: SlidersHorizontal,
    title: "Extended CDR-H3 (16-24 res)",
    description:
      "Longer loops for reaching recessed epitopes. Common in broadly neutralizing antibodies.",
  },
  {
    id: "custom",
    icon: SlidersHorizontal,
    title: "Custom Ranges",
    description: "Specify exact loop lengths for each CDR region.",
  },
];

export default function ConfigStep() {
  const state = useWorkspaceState();
  const dispatch = useWorkspaceDispatch();
  const [confirmed, setConfirmed] = useState(false);

  const selectedHotspots = state.hotspotRegions.filter((r) => r.selected);
  const hasCompleted = state.completedSteps.includes("config");

  if (hasCompleted) return null;

  const handleCdrSelect = (id: string) => {
    dispatch({
      type: "SET_CDR_PREFERENCE",
      preference: id as "standard" | "extended" | "custom",
    });
  };

  const handleContinue = () => {
    if (!state.cdrPreference) return;
    setConfirmed(true);

    dispatch({
      type: "ADD_MESSAGE",
      message: {
        role: "user",
        text: `${state.candidateCount} candidates, ${state.cdrPreference} CDR loops.`,
        step: "config",
      },
    });

    dispatch({
      type: "ADD_MESSAGE",
      message: {
        role: "ai",
        text: WORKSPACE_MESSAGES.configTransition,
        step: "config",
      },
    });

    dispatch({ type: "COMPLETE_STEP", step: "config" });

    // Transition to pipeline
    dispatch({
      type: "ADD_MESSAGE",
      message: {
        role: "ai",
        text: WORKSPACE_MESSAGES.pipelineIntro,
        step: "pipeline",
        component: "pipeline-summary",
      },
    });
    dispatch({ type: "SET_STEP", step: "pipeline" });
  };

  return (
    <div className="space-y-5">
      {/* Locked hotspots summary */}
      {selectedHotspots.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {selectedHotspots.map((r) => (
            <motion.span
              key={r.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-1.5 rounded-full border border-dayhoff-emerald/30 bg-dayhoff-emerald/10 px-3 py-1 text-xs font-semibold text-dayhoff-emerald"
            >
              <CheckCircle2 className="h-3 w-3" />
              {r.name.split("(")[0].trim()}
            </motion.span>
          ))}
        </div>
      )}

      {/* Candidate count slider */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-300">
            Candidate Count
          </label>
          <span className="text-sm font-semibold text-dayhoff-purple">
            {state.candidateCount}
          </span>
        </div>
        <input
          type="range"
          min={50}
          max={1000}
          step={50}
          value={state.candidateCount}
          onChange={(e) =>
            dispatch({
              type: "SET_CANDIDATE_COUNT",
              count: parseInt(e.target.value),
            })
          }
          className="mt-3 w-full accent-dayhoff-purple"
        />
        <div className="mt-1 flex justify-between text-xs text-gray-500">
          <span>50</span>
          <span>1000</span>
        </div>
      </div>

      {/* CDR Loop preference */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-300">
          CDR Loop Length
        </label>
        <ChoiceCardGroup
          cards={CDR_CARDS}
          selected={state.cdrPreference}
          onSelect={handleCdrSelect}
        />
      </div>

      {/* Continue button */}
      <button
        onClick={handleContinue}
        disabled={!state.cdrPreference || confirmed}
        className="w-full rounded-lg bg-dayhoff-purple px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-dayhoff-purple/80 disabled:opacity-30"
      >
        Lock Configuration & Continue
      </button>
    </div>
  );
}

"use client";

import { motion } from "framer-motion";
import {
  FileText,
  Shield,
  Target,
  SlidersHorizontal,
  GitBranch,
  BarChart3,
  CheckCircle2,
} from "lucide-react";
import {
  useWorkspaceState,
  useWorkspaceDispatch,
  type WorkspaceStep,
} from "@/hooks/useWorkspaceReducer";

const STEPS: {
  id: WorkspaceStep;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: "pdb", label: "Target PDB", icon: FileText },
  { id: "framework", label: "Framework", icon: Shield },
  { id: "hotspots", label: "Hotspots", icon: Target },
  { id: "config", label: "Config", icon: SlidersHorizontal },
  { id: "pipeline", label: "Pipeline", icon: GitBranch },
  { id: "results", label: "Results", icon: BarChart3 },
];

function getStepSublabel(step: WorkspaceStep, state: ReturnType<typeof useWorkspaceState>): string | null {
  if (!state.completedSteps.includes(step)) return null;
  switch (step) {
    case "pdb":
      return state.pdbId || null;
    case "framework":
      return state.framework?.toUpperCase() || null;
    case "hotspots": {
      const selected = state.hotspotRegions.filter((r) => r.selected);
      return selected.length > 0 ? `${selected.length} region${selected.length > 1 ? "s" : ""}` : null;
    }
    case "config":
      return `${state.candidateCount} candidates`;
    default:
      return null;
  }
}

export default function StepNavigation() {
  const state = useWorkspaceState();
  const dispatch = useWorkspaceDispatch();
  const { currentStep, completedSteps } = state;

  const currentIndex = STEPS.findIndex((s) => s.id === currentStep);

  const handleStepClick = (step: WorkspaceStep, index: number) => {
    // Allow clicking completed steps or current step, not future
    if (completedSteps.includes(step) || step === currentStep) {
      dispatch({ type: "SET_STEP", step });
    }
  };

  return (
    <div className="flex h-full flex-col p-4">
      <div className="mb-6">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
          Design Flow
        </h2>
      </div>

      <nav className="flex-1 space-y-1">
        {STEPS.map((step, index) => {
          const isActive = step.id === currentStep;
          const isCompleted = completedSteps.includes(step.id);
          const isFuture = !isActive && !isCompleted;
          const Icon = step.icon;
          const sublabel = getStepSublabel(step.id, state);

          return (
            <div key={step.id}>
              {/* Connecting line */}
              {index > 0 && (
                <div className="ml-[19px] h-4 w-px bg-white/10" />
              )}

              <button
                onClick={() => handleStepClick(step.id, index)}
                disabled={isFuture}
                className={`relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-all ${
                  isActive
                    ? "border-l-2 border-dayhoff-purple bg-dayhoff-purple/5 text-white"
                    : isCompleted
                      ? "text-dayhoff-emerald hover:bg-white/5"
                      : "cursor-not-allowed text-gray-600"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="step-indicator"
                    className="absolute inset-0 rounded-lg border-l-2 border-dayhoff-purple bg-dayhoff-purple/5"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}

                <span className="relative z-10">
                  {isCompleted ? (
                    <CheckCircle2 className="h-5 w-5 text-dayhoff-emerald" />
                  ) : (
                    <Icon
                      className={`h-5 w-5 ${
                        isActive ? "text-dayhoff-purple" : "text-gray-600"
                      }`}
                    />
                  )}
                </span>

                <div className="relative z-10 min-w-0">
                  <div
                    className={`font-medium ${
                      isActive
                        ? "text-white"
                        : isCompleted
                          ? "text-dayhoff-emerald"
                          : "text-gray-600"
                    }`}
                  >
                    {step.label}
                  </div>
                  {sublabel && (
                    <div className="truncate text-xs text-gray-500">
                      {sublabel}
                    </div>
                  )}
                </div>
              </button>
            </div>
          );
        })}
      </nav>
    </div>
  );
}

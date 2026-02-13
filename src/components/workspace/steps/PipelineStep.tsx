"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Loader2,
  Rocket,
} from "lucide-react";
import { motion } from "framer-motion";
import { getModuleById } from "@/data/modules-catalog";
import {
  useWorkspaceState,
  useWorkspaceDispatch,
} from "@/hooks/useWorkspaceReducer";
import { WORKSPACE_MESSAGES } from "@/data/workspace-messages";

const PIPELINE_MODULES = ["rfdiffusion", "proteinmpnn", "esmfold"];

export default function PipelineStep() {
  const state = useWorkspaceState();
  const dispatch = useWorkspaceDispatch();
  const router = useRouter();
  const [whyExpanded, setWhyExpanded] = useState(false);

  const selectedHotspots = state.hotspotRegions.filter((r) => r.selected);
  const modules = PIPELINE_MODULES.map((id) => getModuleById(id)).filter(Boolean);

  const handleLaunch = async () => {
    dispatch({ type: "SET_LAUNCHING", launching: true });

    try {
      const res = await fetch("/api/experiments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `Antibody Design — 6M0J ${state.framework?.toUpperCase() || ""}`,
          goal: `De novo antibody design against SARS-CoV-2 RBD–ACE2 complex (6M0J) using ${state.framework?.toUpperCase()} framework targeting ${selectedHotspots.map((h) => h.name).join(", ")}`,
          parameters: {
            pdb_id: state.pdbId,
            framework: state.framework,
            hotspots: selectedHotspots.map((h) => `${h.chain}:${h.range}`),
            candidate_count: state.candidateCount,
            cdr_preference: state.cdrPreference,
          },
          config: {
            workflowId: "antibody-workspace",
            workflowName: "De Novo Antibody Design",
            moduleIds: PIPELINE_MODULES,
            timeEstimate: state.candidateCount <= 200 ? "2-4 hours" : state.candidateCount <= 500 ? "5-8 hours" : "10-16 hours",
            requiresGpu: true,
          },
        }),
      });

      if (res.ok) {
        const experiment = await res.json();
        dispatch({ type: "SET_EXPERIMENT_ID", id: experiment.id });

        dispatch({
          type: "ADD_MESSAGE",
          message: {
            role: "ai",
            text: WORKSPACE_MESSAGES.pipelineLaunched,
            step: "results",
          },
        });

        dispatch({ type: "COMPLETE_STEP", step: "pipeline" });
        dispatch({ type: "SET_STEP", step: "results" });

        sessionStorage.setItem(
          `experiment-${experiment.id}`,
          JSON.stringify(experiment)
        );
        router.push(`/experiments/${experiment.id}/running`);
      }
    } catch {
      dispatch({
        type: "ADD_MESSAGE",
        message: {
          role: "ai",
          text: "There was an issue launching the pipeline. Please try again.",
          step: "pipeline",
        },
      });
    } finally {
      dispatch({ type: "SET_LAUNCHING", launching: false });
    }
  };

  const timeEstimate =
    state.candidateCount <= 200
      ? "2-4 hours"
      : state.candidateCount <= 500
        ? "5-8 hours"
        : "10-16 hours";

  return (
    <div className="space-y-5">
      {/* Pipeline visualization */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {modules.map((mod, i) => (
            <div key={mod!.id} className="flex items-center gap-2">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.15 }}
                className="shrink-0 rounded-lg border border-dayhoff-purple/30 bg-dayhoff-purple/10 px-4 py-3"
              >
                <div className="text-sm font-semibold text-white">
                  {mod!.displayName}
                </div>
                <div className="mt-0.5 text-[10px] text-gray-400">
                  {mod!.inputFormats.join("/")} → {mod!.outputFormats.join("/")}
                </div>
              </motion.div>
              {i < modules.length - 1 && (
                <ArrowRight className="h-4 w-4 shrink-0 text-dayhoff-purple" />
              )}
            </div>
          ))}
          {/* Composite Scoring (display-only) */}
          <ArrowRight className="h-4 w-4 shrink-0 text-gray-600" />
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: modules.length * 0.15 }}
            className="shrink-0 rounded-lg border border-dashed border-white/20 bg-white/[0.02] px-4 py-3"
          >
            <div className="text-sm font-semibold text-gray-400">
              Composite Scoring
            </div>
            <div className="mt-0.5 text-[10px] text-gray-600">
              Ranking + Filtering
            </div>
          </motion.div>
        </div>

        {/* Explore link */}
        <a
          href="/workflows/builder?template=antibody-design"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-flex items-center gap-1 text-xs text-dayhoff-purple hover:underline"
        >
          Explore pipeline in sandbox
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>

      {/* Why this pipeline? */}
      <button
        onClick={() => setWhyExpanded(!whyExpanded)}
        className="flex items-center gap-1 text-xs font-semibold text-dayhoff-emerald hover:underline"
      >
        {whyExpanded ? (
          <ChevronDown className="h-3.5 w-3.5" />
        ) : (
          <ChevronRight className="h-3.5 w-3.5" />
        )}
        Why this pipeline?
      </button>
      {whyExpanded && (
        <div className="rounded-lg border border-dayhoff-emerald/20 bg-dayhoff-emerald/5 p-4 text-xs leading-relaxed text-gray-300">
          This pipeline follows the standard de novo antibody design workflow:
          <strong> RFdiffusion</strong> generates diverse antibody backbone structures conditioned
          on your selected epitope regions. <strong>ProteinMPNN</strong> then designs optimal
          amino acid sequences for each backbone. Finally, <strong>ESMFold</strong> validates
          that designed sequences fold into the intended structures. Candidates are ranked by a
          composite score combining predicted binding affinity, structural quality, and sequence
          naturalness.
        </div>
      )}

      {/* Experiment summary table */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
        <h4 className="text-sm font-semibold text-white">Experiment Summary</h4>
        <div className="mt-3 space-y-2 text-sm">
          {[
            { label: "Target", value: `${state.pdbId} — SARS-CoV-2 RBD–ACE2 Complex` },
            { label: "Framework", value: state.framework?.toUpperCase() || "—" },
            {
              label: "Hotspots",
              value:
                selectedHotspots.length > 0
                  ? selectedHotspots.map((h) => h.name.split("(")[0].trim()).join(", ")
                  : "—",
            },
            { label: "Candidates", value: String(state.candidateCount) },
            { label: "CDR", value: state.cdrPreference || "—" },
            { label: "Est. Time", value: timeEstimate },
          ].map((row) => (
            <div key={row.label} className="flex items-center justify-between">
              <span className="text-gray-400">{row.label}</span>
              <span className="text-white">{row.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Launch button */}
      <button
        onClick={handleLaunch}
        disabled={state.launching}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-dayhoff-purple px-6 py-3 text-base font-semibold text-white hover:bg-dayhoff-purple/80 disabled:opacity-50"
      >
        {state.launching ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <Rocket className="h-5 w-5" />
        )}
        Launch Pipeline
      </button>
    </div>
  );
}

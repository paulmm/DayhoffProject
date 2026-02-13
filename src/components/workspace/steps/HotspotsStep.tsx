"use client";

import { useState, useMemo } from "react";
import { Maximize2, ChevronDown, ChevronRight, Plus, Sparkles } from "lucide-react";
import MolstarViewerDynamic from "@/components/molstar/MolstarViewerDynamic";
import HotspotRegionCard from "../chat/HotspotRegionCard";
import {
  useWorkspaceState,
  useWorkspaceDispatch,
} from "@/hooks/useWorkspaceReducer";
import { WORKSPACE_MESSAGES } from "@/data/workspace-messages";
import type { HighlightRegion } from "@/hooks/useMolstarPlugin";

const CUSTOM_COLORS = ["#a855f7", "#06b6d4", "#10b981", "#f43f5e", "#6366f1"];
let customCounter = 0;

export default function HotspotsStep() {
  const state = useWorkspaceState();
  const dispatch = useWorkspaceDispatch();
  const [whyExpanded, setWhyExpanded] = useState(false);
  const [customRange, setCustomRange] = useState("");

  const selectedRegions = state.hotspotRegions.filter((r) => r.selected);
  const hasCompleted = state.completedSteps.includes("hotspots");

  // Build highlight regions for the Molstar viewer from selected hotspots
  const viewerRegions: HighlightRegion[] = useMemo(() => {
    return state.hotspotRegions
      .filter((r) => r.selected)
      .map((r) => {
        const [start, end] = r.range.split("-").map(Number);
        return {
          chain: r.chain,
          startResidue: start,
          endResidue: end,
          color: r.color,
          label: r.name,
        };
      });
  }, [state.hotspotRegions]);

  if (hasCompleted) return null;

  const handleToggle = (regionId: string) => {
    dispatch({ type: "TOGGLE_HOTSPOT", regionId });
  };

  const handleAddCustom = () => {
    const trimmed = customRange.trim();
    if (!trimmed) return;

    // Parse formats: "E:438-508", "A:19-83", "438-508" (defaults to chain A)
    const match = trimmed.match(/^([A-Z]):?(\d+)-(\d+)$/i) || trimmed.match(/^(\d+)-(\d+)$/);
    if (!match) return;

    let chain: string, start: string, end: string;
    if (match.length === 4) {
      chain = match[1].toUpperCase();
      start = match[2];
      end = match[3];
    } else {
      chain = "A";
      start = match[1];
      end = match[2];
    }

    customCounter += 1;
    const color = CUSTOM_COLORS[(customCounter - 1) % CUSTOM_COLORS.length];

    dispatch({
      type: "ADD_CUSTOM_HOTSPOT",
      region: {
        id: `custom-${customCounter}`,
        name: `Custom Region (${chain}:${start}-${end})`,
        chain,
        range: `${start}-${end}`,
        color,
        description: `User-defined residue range on chain ${chain}.`,
        selected: true,
      },
    });

    setCustomRange("");
  };

  const handleContinue = () => {
    if (selectedRegions.length === 0) return;

    dispatch({
      type: "ADD_MESSAGE",
      message: {
        role: "user",
        text: `Selected: ${selectedRegions.map((r) => r.name).join(", ")}`,
        step: "hotspots",
      },
    });

    dispatch({
      type: "ADD_MESSAGE",
      message: {
        role: "ai",
        text: WORKSPACE_MESSAGES.hotspotsSelected(
          selectedRegions.length,
          selectedRegions.map((r) => r.name)
        ),
        step: "hotspots",
      },
    });

    dispatch({ type: "COMPLETE_STEP", step: "hotspots" });

    // Transition to config
    dispatch({
      type: "ADD_MESSAGE",
      message: {
        role: "ai",
        text: WORKSPACE_MESSAGES.configIntro,
        step: "config",
        component: "config-panel",
      },
    });
    dispatch({ type: "SET_STEP", step: "config" });
  };

  return (
    <div className="space-y-4">
      {/* Inline Molstar viewer */}
      {state.pdbData && (
        <div className="relative rounded-xl border border-white/10 overflow-hidden">
          <MolstarViewerDynamic
            pdbData={state.pdbData}
            height="h-64"
            highlightRegions={viewerRegions}
          />
          <button
            onClick={() => dispatch({ type: "TOGGLE_EPITOPE_MODAL" })}
            className="absolute right-3 top-3 flex items-center gap-1.5 rounded-lg border border-white/20 bg-black/60 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm hover:bg-black/80"
          >
            <Maximize2 className="h-3.5 w-3.5" />
            Zoom
          </button>
        </div>
      )}

      {/* AI-suggested hotspot region cards */}
      <div className="space-y-2">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
          Suggested Regions
        </p>
        {state.hotspotRegions
          .filter((r) => !r.id.startsWith("custom-"))
          .map((region, idx) => (
            <HotspotRegionCard
              key={region.id}
              region={region}
              index={idx}
              onToggle={() => handleToggle(region.id)}
            />
          ))}
      </div>

      {/* Custom regions (if any) */}
      {state.hotspotRegions.some((r) => r.id.startsWith("custom-")) && (
        <div className="space-y-2">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
            Custom Regions
          </p>
          {state.hotspotRegions
            .filter((r) => r.id.startsWith("custom-"))
            .map((region, idx) => (
              <HotspotRegionCard
                key={region.id}
                region={region}
                index={idx}
                onToggle={() => handleToggle(region.id)}
              />
            ))}
        </div>
      )}

      {/* Custom residue range input */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-3">
        <label className="text-xs font-semibold text-gray-400">
          Add Custom Region
        </label>
        <div className="mt-2 flex gap-2">
          <input
            type="text"
            value={customRange}
            onChange={(e) => setCustomRange(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === "Enter" && handleAddCustom()}
            placeholder="e.g., E:450-490 or A:30-60"
            className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white placeholder-gray-500 focus:border-dayhoff-purple focus:outline-none"
          />
          <button
            onClick={handleAddCustom}
            disabled={!customRange.trim()}
            className="flex items-center gap-1 rounded-lg bg-dayhoff-purple px-3 py-2 text-xs font-semibold text-white hover:bg-dayhoff-purple/80 disabled:opacity-30"
          >
            <Plus className="h-3 w-3" />
            Add
          </button>
        </div>
        <p className="mt-1.5 text-[10px] text-gray-500">
          Format: Chain:Start-End (e.g., E:450-490). Click residues in the viewer or use Zoom for visual selection.
        </p>
      </div>

      {/* AI suggestion hint */}
      <div className="flex items-start gap-2 rounded-lg border border-dayhoff-purple/20 bg-dayhoff-purple/5 p-3">
        <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-dayhoff-purple" />
        <p className="text-xs leading-relaxed text-gray-400">
          Not sure which regions to target? Ask me in the chat below —
          e.g., <span className="text-dayhoff-purple">&quot;What are the best epitopes for broadly neutralizing antibodies?&quot;</span> or{" "}
          <span className="text-dayhoff-purple">&quot;Which residues are most conserved across variants?&quot;</span>
        </p>
      </div>

      {/* Why these hotspots? */}
      <button
        onClick={() => setWhyExpanded(!whyExpanded)}
        className="flex items-center gap-1 text-xs font-semibold text-dayhoff-emerald hover:underline"
      >
        {whyExpanded ? (
          <ChevronDown className="h-3.5 w-3.5" />
        ) : (
          <ChevronRight className="h-3.5 w-3.5" />
        )}
        Why these hotspots?
      </button>
      {whyExpanded && (
        <div className="rounded-lg border border-dayhoff-emerald/20 bg-dayhoff-emerald/5 p-4 text-xs leading-relaxed text-gray-300">
          These regions were identified by analyzing the solvent-accessible surface area,
          known neutralizing antibody binding sites from the PDB, and evolutionary conservation
          scores across SARS-CoV-2 variants. The Receptor Binding Motif is the primary ACE2
          contact interface and the most validated target for neutralizing antibodies, while the
          RBD core and ACE2 interface helix offer alternative design strategies.
        </div>
      )}

      {/* Continue button */}
      <button
        onClick={handleContinue}
        disabled={selectedRegions.length === 0}
        className="w-full rounded-lg bg-dayhoff-purple px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-dayhoff-purple/80 disabled:opacity-30"
      >
        Continue with {selectedRegions.length} region
        {selectedRegions.length !== 1 ? "s" : ""}
      </button>
    </div>
  );
}

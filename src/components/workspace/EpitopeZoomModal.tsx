"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { X, Plus, MousePointerClick } from "lucide-react";
import MolstarViewerDynamic from "@/components/molstar/MolstarViewerDynamic";
import HotspotRegionCard from "./chat/HotspotRegionCard";
import {
  useWorkspaceState,
  useWorkspaceDispatch,
} from "@/hooks/useWorkspaceReducer";
import type { HighlightRegion } from "@/hooks/useMolstarPlugin";
import type { ClickedResidue } from "@/hooks/useMolstarPlugin";

const CUSTOM_COLORS = ["#a855f7", "#06b6d4", "#10b981", "#f43f5e", "#6366f1"];
let modalCustomCounter = 100; // offset to avoid id collisions with HotspotsStep

export default function EpitopeZoomModal() {
  const state = useWorkspaceState();
  const dispatch = useWorkspaceDispatch();
  const [customRange, setCustomRange] = useState("");
  const [clickedResidues, setClickedResidues] = useState<ClickedResidue[]>([]);

  const selectedCount = state.hotspotRegions.filter((r) => r.selected).length;

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

  const handleClose = () => {
    dispatch({ type: "TOGGLE_EPITOPE_MODAL" });
  };

  const handleConfirm = () => {
    dispatch({ type: "TOGGLE_EPITOPE_MODAL" });
  };

  const handleAddCustomRange = () => {
    const trimmed = customRange.trim();
    if (!trimmed) return;

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

    modalCustomCounter += 1;
    const color = CUSTOM_COLORS[(modalCustomCounter - 1) % CUSTOM_COLORS.length];

    dispatch({
      type: "ADD_CUSTOM_HOTSPOT",
      region: {
        id: `custom-${modalCustomCounter}`,
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

  const handleResidueClick = (residue: ClickedResidue) => {
    // Collect clicked residues for building a range
    setClickedResidues((prev) => {
      const exists = prev.some((r) => r.chainId === residue.chainId && r.seqId === residue.seqId);
      if (exists) return prev.filter((r) => !(r.chainId === residue.chainId && r.seqId === residue.seqId));
      return [...prev, residue];
    });
  };

  const handleAddFromClicks = () => {
    if (clickedResidues.length === 0) return;

    // Group by chain and create ranges
    const byChain: Record<string, number[]> = {};
    for (const r of clickedResidues) {
      if (!byChain[r.chainId]) byChain[r.chainId] = [];
      byChain[r.chainId].push(r.seqId);
    }

    for (const [chain, residues] of Object.entries(byChain)) {
      residues.sort((a, b) => a - b);
      const start = residues[0];
      const end = residues[residues.length - 1];

      modalCustomCounter += 1;
      const color = CUSTOM_COLORS[(modalCustomCounter - 1) % CUSTOM_COLORS.length];

      dispatch({
        type: "ADD_CUSTOM_HOTSPOT",
        region: {
          id: `custom-${modalCustomCounter}`,
          name: `Custom Region (${chain}:${start}-${end})`,
          chain,
          range: `${start}-${end}`,
          color,
          description: `Visually selected residue range on chain ${chain} (${residues.length} residues).`,
          selected: true,
        },
      });
    }

    setClickedResidues([]);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="flex h-[90vh] w-[95vw] max-w-7xl flex-col rounded-2xl border border-white/10 bg-dayhoff-bg-primary"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <div>
            <h2 className="text-lg font-bold text-white">
              SARS-CoV-2 RBD–ACE2 Complex
            </h2>
            <div className="mt-0.5 flex items-center gap-3 text-xs text-gray-400">
              <span>PDB: {state.pdbId}</span>
              <span>{state.availableChains.length} chains</span>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="rounded-lg p-2 text-gray-400 hover:bg-white/5 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left: large Molstar viewer */}
          <div className="flex flex-[7] flex-col border-r border-white/10 p-4">
            <div className="relative min-h-0 flex-1">
              <MolstarViewerDynamic
                pdbData={state.pdbData}
                height="h-full"
                highlightRegions={viewerRegions}
                onResidueClick={handleResidueClick}
              />
            </div>
            {/* Clicked residues bar */}
            {clickedResidues.length > 0 && (
              <div className="mt-3 flex items-center justify-between rounded-lg border border-dayhoff-purple/30 bg-dayhoff-purple/5 px-4 py-2">
                <div className="flex items-center gap-2 text-xs text-gray-300">
                  <MousePointerClick className="h-3.5 w-3.5 text-dayhoff-purple" />
                  <span>
                    {clickedResidues.length} residue{clickedResidues.length !== 1 ? "s" : ""} selected:{" "}
                    <span className="font-semibold text-white">
                      {clickedResidues
                        .slice(0, 5)
                        .map((r) => `${r.chainId}:${r.compId}${r.seqId}`)
                        .join(", ")}
                      {clickedResidues.length > 5 ? ` +${clickedResidues.length - 5} more` : ""}
                    </span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setClickedResidues([])}
                    className="text-xs text-gray-500 hover:text-white"
                  >
                    Clear
                  </button>
                  <button
                    onClick={handleAddFromClicks}
                    className="flex items-center gap-1 rounded-md bg-dayhoff-purple px-3 py-1.5 text-xs font-semibold text-white hover:bg-dayhoff-purple/80"
                  >
                    <Plus className="h-3 w-3" />
                    Add as Region
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right: epitope selection panel */}
          <div className="flex w-80 shrink-0 flex-col overflow-y-auto p-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Epitope Selection
            </h3>

            {/* Suggested regions */}
            <div className="mt-4 space-y-2">
              {state.hotspotRegions
                .filter((r) => !r.id.startsWith("custom-"))
                .map((region, idx) => (
                  <HotspotRegionCard
                    key={region.id}
                    region={region}
                    index={idx}
                    onToggle={() =>
                      dispatch({ type: "TOGGLE_HOTSPOT", regionId: region.id })
                    }
                  />
                ))}
            </div>

            {/* Custom regions */}
            {state.hotspotRegions.some((r) => r.id.startsWith("custom-")) && (
              <div className="mt-4 space-y-2">
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
                      onToggle={() =>
                        dispatch({ type: "TOGGLE_HOTSPOT", regionId: region.id })
                      }
                    />
                  ))}
              </div>
            )}

            {/* Custom residue range input */}
            <div className="mt-4">
              <label className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                Add Custom Range
              </label>
              <div className="mt-1.5 flex gap-1.5">
                <input
                  type="text"
                  value={customRange}
                  onChange={(e) => setCustomRange(e.target.value.toUpperCase())}
                  onKeyDown={(e) => e.key === "Enter" && handleAddCustomRange()}
                  placeholder="e.g., E:450-490"
                  className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white placeholder-gray-500 focus:border-dayhoff-purple focus:outline-none"
                />
                <button
                  onClick={handleAddCustomRange}
                  disabled={!customRange.trim()}
                  className="rounded-lg bg-dayhoff-purple px-2.5 py-2 text-xs font-semibold text-white hover:bg-dayhoff-purple/80 disabled:opacity-30"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Visual selection hint */}
            <div className="mt-4 rounded-lg border border-white/5 bg-white/[0.02] p-3">
              <div className="flex items-center gap-1.5 text-[10px] font-semibold text-gray-500">
                <MousePointerClick className="h-3 w-3" />
                Visual Selection
              </div>
              <p className="mt-1 text-[10px] leading-relaxed text-gray-600">
                Click residues on the 3D structure to select them, then use &quot;Add as Region&quot; to create a custom hotspot from your selection.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-white/10 px-6 py-4">
          <button
            onClick={handleClose}
            className="rounded-lg border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/10"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="rounded-lg bg-dayhoff-purple px-5 py-2.5 text-sm font-semibold text-white hover:bg-dayhoff-purple/80"
          >
            Confirm ({selectedCount})
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

"use client";

import { motion } from "framer-motion";
import type { HotspotRegion } from "@/hooks/useWorkspaceReducer";

interface HotspotRegionCardProps {
  region: HotspotRegion;
  index: number;
  onToggle: () => void;
}

export default function HotspotRegionCard({
  region,
  index,
  onToggle,
}: HotspotRegionCardProps) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.3 }}
      onClick={onToggle}
      className={`flex w-full items-start gap-3 rounded-xl border p-4 text-left transition-all ${
        region.selected
          ? "border-dayhoff-purple/60 bg-dayhoff-purple/10"
          : "border-white/10 bg-white/5 hover:border-white/20"
      }`}
    >
      {/* Color dot */}
      <div
        className="mt-1 h-3 w-3 shrink-0 rounded-full"
        style={{ backgroundColor: region.color }}
      />

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-white">
            {region.name}
          </span>
        </div>
        <div className="mt-0.5 text-xs text-gray-500">
          Chain {region.chain}: {region.range}
        </div>
        <p className="mt-1.5 text-xs leading-relaxed text-gray-400">
          {region.description}
        </p>
      </div>

      {/* Toggle indicator */}
      <div
        className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-all ${
          region.selected
            ? "border-dayhoff-purple bg-dayhoff-purple text-white"
            : "border-white/20 bg-transparent"
        }`}
      >
        {region.selected && (
          <svg className="h-3 w-3" viewBox="0 0 12 12" fill="none">
            <path
              d="M2 6L5 9L10 3"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </div>
    </motion.button>
  );
}

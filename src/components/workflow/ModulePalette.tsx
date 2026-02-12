"use client";

import { useState } from "react";
import { MODULE_CATALOG, type ModuleMetadata } from "@/data/modules-catalog";
import { Search, Package, Plus } from "lucide-react";

const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: "bg-dayhoff-emerald/10 text-dayhoff-emerald border-dayhoff-emerald/20",
  intermediate: "bg-dayhoff-amber/10 text-dayhoff-amber border-dayhoff-amber/20",
  advanced: "bg-red-500/10 text-red-400 border-red-500/20",
};

const CATEGORY_COLORS: Record<string, string> = {
  protein: "border-purple-500/30 bg-purple-500/5",
  antibody: "border-pink-500/30 bg-pink-500/5",
  interaction: "border-blue-500/30 bg-blue-500/5",
  assessment: "border-emerald-500/30 bg-emerald-500/5",
};

const CATEGORY_ORDER = ["protein", "antibody", "interaction", "assessment"];

interface Props {
  onAddModule: (mod: ModuleMetadata) => void;
}

export default function ModulePalette({ onAddModule }: Props) {
  const [search, setSearch] = useState("");
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const filtered = MODULE_CATALOG.filter((m) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      m.displayName.toLowerCase().includes(q) ||
      m.description.toLowerCase().includes(q) ||
      m.tags.some((t) => t.includes(q)) ||
      m.category.includes(q)
    );
  });

  const grouped = CATEGORY_ORDER.reduce<Record<string, ModuleMetadata[]>>((acc, cat) => {
    const mods = filtered.filter((m) => m.category === cat);
    if (mods.length > 0) acc[cat] = mods;
    return acc;
  }, {});

  return (
    <div className="flex h-full w-64 flex-col border-r border-white/10 bg-dayhoff-bg-secondary">
      <div className="border-b border-white/10 p-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-white">
          <Package className="h-4 w-4 text-dayhoff-purple" />
          Module Palette
        </div>
        <div className="relative mt-3">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search modules..."
            className="w-full rounded-lg border border-white/10 bg-white/5 py-2 pl-9 pr-3 text-xs text-white placeholder-gray-500 focus:border-dayhoff-purple focus:outline-none focus:ring-1 focus:ring-dayhoff-purple"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        {Object.entries(grouped).map(([category, mods]) => (
          <div key={category} className="mb-4">
            <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-gray-500">
              {category}
            </div>
            <div className="space-y-1.5">
              {mods.map((mod) => (
                <div key={mod.id} className="relative">
                  <button
                    onClick={() => onAddModule(mod)}
                    onMouseEnter={() => setHoveredId(mod.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    className={`group flex w-full items-start gap-2 rounded-lg border p-2.5 text-left transition-all hover:border-dayhoff-purple/30 hover:bg-white/5 ${CATEGORY_COLORS[mod.category] || "border-white/10"}`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="truncate text-xs font-semibold text-white">
                          {mod.displayName}
                        </span>
                        <span
                          className={`shrink-0 rounded-full border px-1.5 py-0 text-[8px] font-semibold capitalize ${DIFFICULTY_COLORS[mod.learning.difficulty]}`}
                        >
                          {mod.learning.difficulty}
                        </span>
                      </div>
                      <div className="mt-0.5 text-[10px] text-gray-500">
                        {mod.inputFormats.join("/")} → {mod.outputFormats.join("/")}
                      </div>
                    </div>
                    <Plus className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gray-600 opacity-0 transition-opacity group-hover:opacity-100" />
                  </button>

                  {/* Hover tooltip */}
                  {hoveredId === mod.id && (
                    <div className="absolute left-full top-0 z-50 ml-2 w-72 rounded-xl border border-white/10 bg-dayhoff-bg-secondary p-4 shadow-xl">
                      <div className="text-sm font-semibold text-white">{mod.displayName}</div>
                      <p className="mt-2 text-xs leading-relaxed text-gray-400">
                        {mod.learning.conceptSummary}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-1">
                        {mod.computeRequirements.gpu && (
                          <span className="rounded-full bg-dayhoff-amber/10 px-2 py-0.5 text-[9px] font-semibold text-dayhoff-amber">
                            GPU Required
                          </span>
                        )}
                        <span className="rounded-full bg-white/5 px-2 py-0.5 text-[9px] text-gray-400">
                          {mod.computeRequirements.timeEstimate}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="py-8 text-center text-xs text-gray-500">No modules match your search</div>
        )}
      </div>
    </div>
  );
}

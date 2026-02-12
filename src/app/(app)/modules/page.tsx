"use client";

import { useState } from "react";
import Link from "next/link";
import { MODULE_CATALOG, type ModuleMetadata } from "@/data/modules-catalog";
import { Search, Cpu, Clock, ArrowRight } from "lucide-react";

const CATEGORIES = [
  { value: "all", label: "All" },
  { value: "protein", label: "Protein" },
  { value: "antibody", label: "Antibody" },
  { value: "interaction", label: "Interaction" },
  { value: "assessment", label: "Assessment" },
] as const;

const TYPES = [
  { value: "all", label: "All" },
  { value: "foundation", label: "Foundation" },
  { value: "specialized", label: "Specialized" },
  { value: "tool", label: "Tool" },
] as const;

const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: "bg-dayhoff-emerald/10 text-dayhoff-emerald border-dayhoff-emerald/20",
  intermediate: "bg-dayhoff-amber/10 text-dayhoff-amber border-dayhoff-amber/20",
  advanced: "bg-red-500/10 text-red-400 border-red-500/20",
};

const TYPE_COLORS: Record<string, string> = {
  foundation: "bg-dayhoff-purple/10 text-dayhoff-purple border-dayhoff-purple/20",
  specialized: "bg-dayhoff-pink/10 text-dayhoff-pink border-dayhoff-pink/20",
  tool: "bg-blue-500/10 text-blue-400 border-blue-500/20",
};

function ModuleCard({ module }: { module: ModuleMetadata }) {
  return (
    <Link
      href={`/modules/${module.id}`}
      className="group flex flex-col rounded-xl border border-white/10 bg-dayhoff-bg-secondary p-5 transition-all hover:border-dayhoff-purple/40 hover:bg-dayhoff-bg-secondary/80"
    >
      {/* Top badges */}
      <div className="flex items-center gap-2">
        <span
          className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase ${TYPE_COLORS[module.type]}`}
        >
          {module.type}
        </span>
        <span
          className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold capitalize ${DIFFICULTY_COLORS[module.learning.difficulty]}`}
        >
          {module.learning.difficulty}
        </span>
      </div>

      {/* Name & description */}
      <h3 className="mt-3 text-lg font-bold text-white group-hover:text-dayhoff-purple transition-colors">
        {module.displayName}
      </h3>
      <p className="mt-1 line-clamp-2 flex-1 text-sm text-gray-400">
        {module.description}
      </p>

      {/* Molecule types */}
      <div className="mt-3 flex flex-wrap gap-1.5">
        {module.moleculeTypes.map((mol) => (
          <span
            key={mol}
            className="rounded bg-white/5 px-2 py-0.5 text-xs text-gray-300"
          >
            {mol}
          </span>
        ))}
      </div>

      {/* I/O & compute */}
      <div className="mt-3 flex items-center gap-3 text-xs text-gray-500">
        <span>
          {module.inputFormats.join("/")} → {module.outputFormats.join("/")}
        </span>
        <span className="text-white/10">|</span>
        {module.computeRequirements.gpu && (
          <span className="flex items-center gap-1 text-dayhoff-amber">
            <Cpu className="h-3 w-3" />
            GPU
          </span>
        )}
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {module.computeRequirements.timeEstimate}
        </span>
      </div>

      {/* Learn arrow */}
      <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-dayhoff-purple opacity-0 transition-opacity group-hover:opacity-100">
        Learn more <ArrowRight className="h-3 w-3" />
      </div>
    </Link>
  );
}

export default function ModulesPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [type, setType] = useState("all");

  const filtered = MODULE_CATALOG.filter((m) => {
    if (category !== "all" && m.category !== category) return false;
    if (type !== "all" && m.type !== type) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        m.displayName.toLowerCase().includes(q) ||
        m.description.toLowerCase().includes(q) ||
        m.tags.some((t) => t.toLowerCase().includes(q)) ||
        m.moleculeTypes.some((t) => t.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 p-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Modules</h1>
        <p className="mt-1 text-sm text-gray-400">
          Explore bioinformatics tools — each module is a learning unit and a
          computational tool.
        </p>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search modules..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-sm text-white placeholder-gray-500 focus:border-dayhoff-purple focus:outline-none focus:ring-1 focus:ring-dayhoff-purple"
          />
        </div>

        <div className="flex gap-1 rounded-lg border border-white/10 bg-white/5 p-1">
          {CATEGORIES.map((c) => (
            <button
              key={c.value}
              onClick={() => setCategory(c.value)}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                category === c.value
                  ? "bg-dayhoff-purple text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        <div className="flex gap-1 rounded-lg border border-white/10 bg-white/5 p-1">
          {TYPES.map((t) => (
            <button
              key={t.value}
              onClick={() => setType(t.value)}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                type === t.value
                  ? "bg-dayhoff-purple text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      <p className="text-sm text-gray-500">
        {filtered.length} module{filtered.length !== 1 ? "s" : ""}
      </p>

      {/* Module Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((m) => (
          <ModuleCard key={m.id} module={m} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="py-12 text-center text-gray-500">
          No modules match your search.
        </div>
      )}
    </div>
  );
}

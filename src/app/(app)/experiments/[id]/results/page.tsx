"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import MolstarViewerDynamic from "@/components/molstar/MolstarViewerDynamic";
import {
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  Copy,
  Database,
  Download,
  Eye,
  FileArchive,
  FileText,
  Filter,
  FlaskConical,
  FolderPlus,
  Image,
  Loader2,
  Share2,
  Sparkles,
  Table,
} from "lucide-react";

// ─── Stoplight Helpers ──────────────────────────────────────────────

function rfDiffusionColor(score: number) {
  if (score >= 0.85) return "text-dayhoff-emerald";
  if (score >= 0.7) return "text-dayhoff-amber";
  return "text-red-400";
}

function pLDDTColor(score: number) {
  if (score >= 0.85) return "text-dayhoff-emerald";
  if (score >= 0.7) return "text-dayhoff-amber";
  return "text-red-400";
}

function bindingColor(score: number) {
  if (score <= -12) return "text-dayhoff-emerald";
  if (score <= -8) return "text-dayhoff-amber";
  return "text-red-400";
}

function humannessColor(score: number) {
  if (score >= 90) return "text-dayhoff-emerald";
  if (score >= 80) return "text-dayhoff-amber";
  return "text-red-400";
}

function dotBg(colorClass: string) {
  if (colorClass.includes("emerald")) return "bg-dayhoff-emerald";
  if (colorClass.includes("amber")) return "bg-dayhoff-amber";
  return "bg-red-400";
}

// ─── Types ──────────────────────────────────────────────────────────

interface ExperimentData {
  id: string;
  name: string;
  status: string;
  goal: string | null;
  config: {
    workflowId?: string;
    workflowName?: string;
    moduleIds?: string[];
    timeEstimate?: string;
    requiresGpu?: boolean;
  } | null;
  parameters: Record<string, unknown> | null;
  createdAt: string;
}

interface DesignResult {
  rank: number;
  name: string;
  cdrH3: number;
  cdrL3: number;
  cdrH1: number;
  rfDiffusionScore: number;
  pLDDT: number;
  bindingAffinity: number;
  humanness: number;
}

// ─── Demo Data ──────────────────────────────────────────────────────

function generateDemoDesigns(count: number): DesignResult[] {
  // Seeded pseudo-random for stable results across renders
  let seed = 42;
  function rand() {
    seed = (seed * 16807 + 0) % 2147483647;
    return (seed - 1) / 2147483646;
  }

  const designs: DesignResult[] = [];
  for (let i = 0; i < count; i++) {
    const rank = i + 1;
    const t = i / (count - 1); // 0 → 1
    // Linear decay — spreads green/amber/red evenly across all 50
    // Each metric deliberately varies independently so columns aren't all the same color per row
    const jitterRf = (rand() - 0.5) * 0.12;
    const jitterPl = (rand() - 0.5) * 0.12;
    const jitterBa = (rand() - 0.5) * 3.0;
    const jitterHu = (rand() - 0.5) * 8;
    designs.push({
      rank,
      name: `Ab_RBD_${String(rank).padStart(3, "0")}`,
      cdrH3: Math.round(12 + rand() * 6),
      cdrL3: Math.round(9 + rand() * 4),
      cdrH1: Math.round(10 + rand() * 3),
      // Rank 1 ~0.94, rank 10 ~0.82, rank 25 ~0.70, rank 40 ~0.58, rank 50 ~0.48
      rfDiffusionScore: parseFloat(Math.max(0.4, 0.94 - t * 0.50 + jitterRf).toFixed(3)),
      // Rank 1 ~0.93, rank 10 ~0.82, rank 25 ~0.68, rank 40 ~0.56, rank 50 ~0.45
      pLDDT: parseFloat(Math.max(0.35, 0.93 - t * 0.52 + jitterPl).toFixed(3)),
      // Rank 1 ~-14.5, rank 10 ~-11.5, rank 25 ~-8, rank 40 ~-5, rank 50 ~-3
      bindingAffinity: parseFloat(Math.min(-2, -14.5 + t * 12.0 + jitterBa).toFixed(1)),
      // Rank 1 ~95%, rank 10 ~87%, rank 25 ~78%, rank 40 ~69%, rank 50 ~62%
      humanness: parseFloat(Math.max(55, 95 - t * 36 + jitterHu).toFixed(1)),
    });
  }
  return designs;
}

const DEMO_RESULTS = generateDemoDesigns(50);

const SUMMARY_STATS = {
  bestDesign: { rank: 1, pLDDT: 0.92, pBind: 0.03 },
  successRate: { pct: 100, passed: 50, total: 50 },
  bindingAffinity: -14.8,
  humanness: 93,
  runtime: { time: "5s", credits: 150 },
};

type PresetKey = "all" | "top10" | "highAffinity" | "highHumanness" | "balanced";

const PRESETS: { key: PresetKey; label: string }[] = [
  { key: "all", label: "All Designs" },
  { key: "top10", label: "Top 10" },
  { key: "highAffinity", label: "High Affinity" },
  { key: "highHumanness", label: "High Humanness" },
  { key: "balanced", label: "Balanced" },
];

const TABS = ["Results", "Compare", "Wetlab", "Files", "Settings", "Logs"];

// ─── Files Tab Data ─────────────────────────────────────────────────

interface DemoFile {
  name: string;
  type: string;
  size: string;
  description: string;
}

const FINAL_OUTPUT_FILES: DemoFile[] = [
  { name: "denovo_designs.zip", type: "ARCHIVE", size: "12.8 MB", description: "All final antibody designs" },
  { name: "all_sequences.fasta", type: "FASTA", size: "62 KB", description: "All designed sequences in FASTA format" },
  { name: "consolidated_analysis.csv", type: "CSV", size: "384 KB", description: "Complete consolidated metrics from all modules (RFdiffusion, ProteinMPNN, AlphaFold2) \u00b7 50 designs \u00d7 47 metrics" },
  { name: "antibody_complexes.pdb", type: "PDB", size: "4.2 MB", description: "Antibody antigen complex structures" },
  { name: "summary_report.pdf", type: "PDF", size: "2.1 MB", description: "Executive summary with visualizations and top candidates" },
];

interface ModuleFiles {
  name: string;
  color: string;
  iconBg: string;
  files: DemoFile[];
}

const INTERMEDIATE_FILES: ModuleFiles[] = [
  {
    name: "RFdiffusion",
    color: "text-purple-400",
    iconBg: "bg-purple-500/20",
    files: [
      { name: "rfdiffusion_backbones.pdb", type: "PDB", size: "3.8 MB", description: "Generated backbone structures" },
      { name: "rfdiffusion_trajectories.npz", type: "DATA", size: "156 MB", description: "Diffusion trajectories" },
      { name: "rfdiffusion_scores.json", type: "JSON", size: "42 KB", description: "Diffusion confidence scores" },
      { name: "scaffold_metrics.csv", type: "CSV", size: "8 KB", description: "Scaffold quality metrics" },
    ],
  },
  {
    name: "ProteinMPNN",
    color: "text-blue-400",
    iconBg: "bg-blue-500/20",
    files: [
      { name: "proteinmpnn_sequences.fasta", type: "FASTA", size: "48 KB", description: "Designed sequences from ProteinMPNN" },
      { name: "sequence_scores.json", type: "JSON", size: "28 KB", description: "Sequence design scores" },
      { name: "humanization_report.txt", type: "TEXT", size: "12 KB", description: "Humanization analysis" },
      { name: "cdr_sequences.fasta", type: "FASTA", size: "16 KB", description: "CDR region sequences" },
    ],
  },
  {
    name: "AlphaFold2",
    color: "text-emerald-400",
    iconBg: "bg-emerald-500/20",
    files: [
      { name: "alphafold2_structures.pdb", type: "PDB", size: "4.6 MB", description: "AlphaFold2 predicted complex structures" },
      { name: "plddt_scores.csv", type: "CSV", size: "24 KB", description: "Per-residue pLDDT confidence scores" },
      { name: "pae_matrices.json", type: "JSON", size: "82 KB", description: "Predicted aligned error matrices" },
      { name: "structure_validation.json", type: "JSON", size: "36 KB", description: "Structure validation results" },
    ],
  },
];

const TOTAL_INTERMEDIATE_FILES = INTERMEDIATE_FILES.reduce((sum, m) => sum + m.files.length, 0);

function fileTypeIcon(type: string) {
  switch (type) {
    case "ARCHIVE":
      return <FileArchive className="h-4 w-4" />;
    case "CSV":
      return <Table className="h-4 w-4" />;
    case "PDB":
      return <Database className="h-4 w-4" />;
    case "IMAGE":
      return <Image className="h-4 w-4" />;
    case "DATA":
      return <Database className="h-4 w-4" />;
    default:
      return <FileText className="h-4 w-4" />;
  }
}

function fileTypeBg(type: string) {
  switch (type) {
    case "ARCHIVE":
      return "bg-emerald-500/20 text-emerald-400";
    case "FASTA":
      return "bg-amber-500/20 text-amber-400";
    case "CSV":
      return "bg-purple-500/20 text-purple-400";
    case "PDB":
      return "bg-teal-500/20 text-teal-400";
    case "PDF":
      return "bg-red-500/20 text-red-400";
    case "JSON":
      return "bg-blue-500/20 text-blue-400";
    case "TEXT":
      return "bg-gray-500/20 text-gray-400";
    case "IMAGE":
      return "bg-pink-500/20 text-pink-400";
    case "DATA":
      return "bg-indigo-500/20 text-indigo-400";
    default:
      return "bg-gray-500/20 text-gray-400";
  }
}

// ─── Component ──────────────────────────────────────────────────────

export default function ResultsPage() {
  const params = useParams();
  const experimentId = params.id as string;
  const [experiment, setExperiment] = useState<ExperimentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Results");
  const [activePreset, setActivePreset] = useState<PresetKey>("all");
  const [visibleCount, setVisibleCount] = useState(5);
  const [sortBy, setSortBy] = useState("rank");
  const [pLDDTMin, setPLDDTMin] = useState(0);
  const [bindingMax, setBindingMax] = useState(0);
  const [humannessMin, setHumannessMin] = useState(0);

  useEffect(() => {
    async function fetchExperiment() {
      try {
        const res = await fetch(`/api/experiments/${experimentId}`);
        if (res.ok) {
          const data = await res.json();
          setExperiment(data);
        }
      } catch {
        // Silently fail
      } finally {
        setLoading(false);
      }
    }
    fetchExperiment();
  }, [experimentId]);

  // ─── Filtering logic ────────────────────────────────────────────

  const getFilteredDesigns = (): DesignResult[] => {
    let filtered = [...DEMO_RESULTS];

    // Apply preset
    switch (activePreset) {
      case "top10":
        filtered = filtered.slice(0, 10);
        break;
      case "highAffinity":
        filtered = filtered.filter((d) => d.bindingAffinity <= -12);
        break;
      case "highHumanness":
        filtered = filtered.filter((d) => d.humanness >= 90);
        break;
      case "balanced":
        filtered = filtered.filter(
          (d) => d.bindingAffinity <= -10 && d.humanness >= 85 && d.pLDDT >= 0.8
        );
        break;
    }

    // Apply slider filters
    if (pLDDTMin > 0) filtered = filtered.filter((d) => d.pLDDT >= pLDDTMin / 100);
    if (bindingMax < 0) filtered = filtered.filter((d) => d.bindingAffinity <= bindingMax);
    if (humannessMin > 0) filtered = filtered.filter((d) => d.humanness >= humannessMin);

    // Sort
    switch (sortBy) {
      case "plddt":
        filtered.sort((a, b) => b.pLDDT - a.pLDDT);
        break;
      case "binding":
        filtered.sort((a, b) => a.bindingAffinity - b.bindingAffinity);
        break;
      case "humanness":
        filtered.sort((a, b) => b.humanness - a.humanness);
        break;
      default:
        filtered.sort((a, b) => a.rank - b.rank);
    }

    return filtered;
  };

  const filteredDesigns = getFilteredDesigns();
  const visibleDesigns = filteredDesigns.slice(0, visibleCount);
  const remaining = filteredDesigns.length - visibleCount;

  // ─── Render ─────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-dayhoff-purple" />
      </div>
    );
  }

  if (!experiment) {
    return (
      <div className="mx-auto max-w-6xl space-y-6 p-8">
        <Link
          href="/experiments"
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Experiments
        </Link>
        <div className="rounded-xl border border-white/10 bg-dayhoff-bg-secondary p-12 text-center">
          <FlaskConical className="mx-auto h-10 w-10 text-gray-600" />
          <p className="mt-3 text-sm text-gray-400">Experiment not found.</p>
        </div>
      </div>
    );
  }

  const completedAt = new Date(experiment.createdAt);
  completedAt.setHours(completedAt.getHours() + 2);

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-8">
      {/* Back link */}
      <Link
        href="/experiments"
        className="flex items-center gap-2 text-sm text-gray-400 hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Experiments
      </Link>

      {/* ─── Header Bar ────────────────────────────────────────────── */}
      <div className="rounded-xl border border-white/10 bg-dayhoff-bg-secondary p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-bold text-white">{experiment.name}</h1>
              <span className="rounded-full border border-dayhoff-emerald/30 bg-dayhoff-emerald/10 px-2.5 py-0.5 text-xs font-semibold text-dayhoff-emerald">
                Complete
              </span>
              <span className="flex items-center gap-1 rounded-full border border-dayhoff-purple/30 bg-dayhoff-purple/10 px-2.5 py-0.5 text-xs font-semibold text-dayhoff-purple">
                <Sparkles className="h-3 w-3" />
                AI Optimized
              </span>
            </div>

            {/* Workflow path */}
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <span className="rounded bg-white/5 px-2 py-0.5">RFdiffusion</span>
              <ArrowRight className="h-3 w-3 text-gray-600" />
              <span className="rounded bg-white/5 px-2 py-0.5">ProteinMPNN</span>
              <ArrowRight className="h-3 w-3 text-gray-600" />
              <span className="rounded bg-white/5 px-2 py-0.5">AlphaFold2</span>
            </div>

            <p className="text-xs text-gray-500">
              Completed{" "}
              {completedAt.toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-gray-300 hover:bg-white/10">
              <FolderPlus className="h-3.5 w-3.5" />
              Add to Project
            </button>
            <button className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-gray-300 hover:bg-white/10">
              <Share2 className="h-3.5 w-3.5" />
              Share Results
            </button>
            <button className="flex items-center gap-1.5 rounded-lg bg-dayhoff-purple px-3 py-2 text-xs font-semibold text-white hover:bg-dayhoff-purple/80">
              <Download className="h-3.5 w-3.5" />
              Download All
            </button>
          </div>
        </div>
      </div>

      {/* ─── Tab Row ───────────────────────────────────────────────── */}
      <div className="flex gap-1 border-b border-white/10">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors ${
              activeTab === tab
                ? "border-b-2 border-dayhoff-purple text-white"
                : "text-gray-500 hover:text-gray-300"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ─── Results Tab Content ───────────────────────────────────── */}
      {activeTab === "Results" && (
        <>
          {/* ─── Summary Cards ───────────────────────────────────── */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {/* Best Design */}
            <div className="rounded-xl border border-white/10 bg-dayhoff-bg-secondary p-4">
              <p className="text-[10px] font-medium uppercase tracking-wider text-gray-500">
                Best Design
              </p>
              <p className="mt-1 text-lg font-bold text-white">
                Rank #{SUMMARY_STATS.bestDesign.rank}
              </p>
              <p className="mt-0.5 text-xs text-gray-400">
                pLDDT {SUMMARY_STATS.bestDesign.pLDDT} &middot; p_bind{" "}
                {SUMMARY_STATS.bestDesign.pBind}
              </p>
            </div>

            {/* Success Rate */}
            <div className="rounded-xl border border-white/10 bg-dayhoff-bg-secondary p-4">
              <p className="text-[10px] font-medium uppercase tracking-wider text-gray-500">
                Success Rate
              </p>
              <p className="mt-1 text-lg font-bold text-dayhoff-emerald">
                {SUMMARY_STATS.successRate.pct}%
              </p>
              <p className="mt-0.5 text-xs text-gray-400">
                {SUMMARY_STATS.successRate.passed}/{SUMMARY_STATS.successRate.total} passed
              </p>
            </div>

            {/* Binding Affinity */}
            <div className="rounded-xl border border-white/10 bg-dayhoff-bg-secondary p-4">
              <p className="text-[10px] font-medium uppercase tracking-wider text-gray-500">
                Binding Affinity
              </p>
              <p className="mt-1 text-lg font-bold text-white">
                {SUMMARY_STATS.bindingAffinity} <span className="text-xs font-normal text-gray-500">kcal/mol</span>
              </p>
              <p className="mt-0.5 text-xs text-gray-400">Best design</p>
            </div>

            {/* Humanness */}
            <div className="rounded-xl border border-white/10 bg-dayhoff-bg-secondary p-4">
              <p className="text-[10px] font-medium uppercase tracking-wider text-gray-500">
                Humanness
              </p>
              <p className="mt-1 text-lg font-bold text-white">{SUMMARY_STATS.humanness}%</p>
              <p className="mt-0.5 text-xs text-gray-400">Average score</p>
            </div>

            {/* Runtime */}
            <div className="rounded-xl border border-white/10 bg-dayhoff-bg-secondary p-4">
              <p className="text-[10px] font-medium uppercase tracking-wider text-gray-500">
                Runtime
              </p>
              <p className="mt-1 text-lg font-bold text-white">{SUMMARY_STATS.runtime.time}</p>
              <p className="mt-0.5 text-xs text-gray-400">
                {SUMMARY_STATS.runtime.credits} credits
              </p>
            </div>
          </div>

          {/* ─── 3D Viewer + Design Info ─────────────────────────── */}
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <div className="rounded-xl border border-white/10 bg-dayhoff-bg-secondary p-4">
                <h3 className="text-sm font-semibold text-white">
                  De Novo Designed Antibody-Antigen Complex
                </h3>
                <p className="mt-0.5 text-xs text-gray-400">
                  Interactive 3D visualization of the top-ranked de novo design
                </p>
                <div className="mt-3 mb-3 flex flex-wrap items-center gap-2">
                  <span className="text-xs font-medium text-gray-400">Target: 7JZM</span>
                  <span className="rounded-full border border-dayhoff-purple/30 bg-dayhoff-purple/10 px-2 py-0.5 text-[10px] font-semibold text-dayhoff-purple">
                    Design #001
                  </span>
                  <span className="flex items-center gap-1 rounded-full border border-dayhoff-amber/30 bg-dayhoff-amber/10 px-2 py-0.5 text-[10px] font-semibold text-dayhoff-amber">
                    <Sparkles className="h-2.5 w-2.5" />
                    AI Optimized
                  </span>
                </div>
                <MolstarViewerDynamic pdbId="7JZM" height="h-96" resizable />
              </div>
            </div>

            {/* Design info sidebar */}
            <div className="space-y-3">
              <div className="rounded-xl border border-white/10 bg-dayhoff-bg-secondary p-4">
                <h3 className="text-sm font-semibold text-white">Design Details</h3>
                <dl className="mt-3 space-y-2">
                  <div className="flex justify-between text-xs">
                    <dt className="text-gray-500">Residues</dt>
                    <dd className="font-medium text-gray-300">68</dd>
                  </div>
                  <div className="flex justify-between text-xs">
                    <dt className="text-gray-500">Method</dt>
                    <dd className="font-medium text-gray-300">RFdiffusion</dd>
                  </div>
                  <div className="flex justify-between text-xs">
                    <dt className="text-gray-500">Target</dt>
                    <dd className="font-medium text-gray-300">SARS-CoV-2 RBD</dd>
                  </div>
                  <div className="flex justify-between text-xs">
                    <dt className="text-gray-500">Confidence</dt>
                    <dd className="font-medium text-dayhoff-emerald">0.92 pLDDT</dd>
                  </div>
                  <div className="flex justify-between text-xs">
                    <dt className="text-gray-500">Binding</dt>
                    <dd className="font-medium text-dayhoff-emerald">-14.8 kcal/mol</dd>
                  </div>
                  <div className="flex justify-between text-xs">
                    <dt className="text-gray-500">Humanness</dt>
                    <dd className="font-medium text-dayhoff-emerald">93%</dd>
                  </div>
                </dl>
              </div>

              <div className="rounded-xl border border-white/10 bg-dayhoff-bg-secondary p-4">
                <h3 className="text-sm font-semibold text-white">CDR Lengths</h3>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  <div className="rounded-lg bg-white/5 p-2 text-center">
                    <p className="text-[10px] text-gray-500">CDR-H1</p>
                    <p className="text-sm font-bold text-white">13</p>
                  </div>
                  <div className="rounded-lg bg-white/5 p-2 text-center">
                    <p className="text-[10px] text-gray-500">CDR-H3</p>
                    <p className="text-sm font-bold text-white">15</p>
                  </div>
                  <div className="rounded-lg bg-white/5 p-2 text-center">
                    <p className="text-[10px] text-gray-500">CDR-L3</p>
                    <p className="text-sm font-bold text-white">11</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ─── Filter & Sort Controls ──────────────────────────── */}
          <div className="rounded-xl border border-white/10 bg-dayhoff-bg-secondary p-4">
            <div className="flex flex-wrap items-center gap-2">
              {/* Preset buttons */}
              {PRESETS.map((p) => (
                <button
                  key={p.key}
                  onClick={() => {
                    setActivePreset(p.key);
                    setPLDDTMin(0);
                    setBindingMax(0);
                    setHumannessMin(0);
                    setVisibleCount(5);
                  }}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                    activePreset === p.key
                      ? "bg-dayhoff-purple text-white"
                      : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-gray-300"
                  }`}
                >
                  {p.label}
                </button>
              ))}

              <div className="mx-2 h-5 w-px bg-white/10" />

              {/* Sort dropdown */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none rounded-lg border border-white/10 bg-white/5 py-1.5 pl-3 pr-8 text-xs text-gray-300 outline-none focus:border-dayhoff-purple"
                >
                  <option value="rank">Sort: Rank</option>
                  <option value="plddt">Sort: pLDDT</option>
                  <option value="binding">Sort: Binding</option>
                  <option value="humanness">Sort: Humanness</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 text-gray-500" />
              </div>
            </div>

            {/* Slider filters */}
            <div className="mt-3 grid gap-4 sm:grid-cols-3">
              <div>
                <label className="flex items-center justify-between text-[10px] text-gray-500">
                  <span>Min pLDDT</span>
                  <span className="text-gray-400">{pLDDTMin > 0 ? `${pLDDTMin}%` : "Off"}</span>
                </label>
                <input
                  type="range"
                  min={0}
                  max={95}
                  step={5}
                  value={pLDDTMin}
                  onChange={(e) => {
                    setPLDDTMin(Number(e.target.value));
                    setVisibleCount(5);
                  }}
                  className="mt-1 w-full accent-dayhoff-purple"
                />
              </div>
              <div>
                <label className="flex items-center justify-between text-[10px] text-gray-500">
                  <span>Max Binding (kcal/mol)</span>
                  <span className="text-gray-400">{bindingMax < 0 ? bindingMax : "Off"}</span>
                </label>
                <input
                  type="range"
                  min={-15}
                  max={0}
                  step={1}
                  value={bindingMax}
                  onChange={(e) => {
                    setBindingMax(Number(e.target.value));
                    setVisibleCount(5);
                  }}
                  className="mt-1 w-full accent-dayhoff-purple"
                />
              </div>
              <div>
                <label className="flex items-center justify-between text-[10px] text-gray-500">
                  <span>Min Humanness</span>
                  <span className="text-gray-400">
                    {humannessMin > 0 ? `${humannessMin}%` : "Off"}
                  </span>
                </label>
                <input
                  type="range"
                  min={0}
                  max={95}
                  step={5}
                  value={humannessMin}
                  onChange={(e) => {
                    setHumannessMin(Number(e.target.value));
                    setVisibleCount(5);
                  }}
                  className="mt-1 w-full accent-dayhoff-purple"
                />
              </div>
            </div>
          </div>

          {/* ─── Filter Status Bar ──────────────────────────────── */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <Filter className="h-3.5 w-3.5" />
              <span>
                Showing <span className="font-semibold text-white">{Math.min(visibleCount, filteredDesigns.length)}</span> of{" "}
                <span className="font-semibold text-white">{filteredDesigns.length}</span> designs
                {filteredDesigns.length < 50 && (
                  <span className="text-gray-500"> (filtered from 50)</span>
                )}
              </span>
            </div>
            <div className="flex items-center gap-3 text-[10px] text-gray-500">
              <span className="flex items-center gap-1">
                <span className="inline-block h-2 w-2 rounded-full bg-dayhoff-emerald" /> Good
              </span>
              <span className="flex items-center gap-1">
                <span className="inline-block h-2 w-2 rounded-full bg-dayhoff-amber" /> Moderate
              </span>
              <span className="flex items-center gap-1">
                <span className="inline-block h-2 w-2 rounded-full bg-red-400" /> Poor
              </span>
            </div>
          </div>

          {/* ─── Results Table ───────────────────────────────────── */}
          <div className="overflow-x-auto rounded-xl border border-white/10 bg-dayhoff-bg-secondary">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-gray-500">
                  <th className="px-4 py-3 font-medium">
                    <input type="checkbox" className="rounded border-gray-600 accent-dayhoff-purple" />
                  </th>
                  <th className="px-4 py-3 font-medium">Rank</th>
                  <th className="px-4 py-3 font-medium">Design</th>
                  <th className="px-4 py-3 font-medium">
                    <div>RFdiffusion</div>
                    <div className="mt-0.5 text-[9px] font-normal normal-case tracking-normal text-gray-600">&ge;0.85 / &ge;0.70 / &lt;0.70</div>
                  </th>
                  <th className="px-4 py-3 font-medium">
                    <div>Confidence</div>
                    <div className="mt-0.5 text-[9px] font-normal normal-case tracking-normal text-gray-600">&ge;0.85 / &ge;0.70 / &lt;0.70</div>
                  </th>
                  <th className="px-4 py-3 font-medium">
                    <div>Binding</div>
                    <div className="mt-0.5 text-[9px] font-normal normal-case tracking-normal text-gray-600">&le;-12 / &le;-8 / &gt;-8</div>
                  </th>
                  <th className="px-4 py-3 font-medium">
                    <div>Humanness</div>
                    <div className="mt-0.5 text-[9px] font-normal normal-case tracking-normal text-gray-600">&ge;90% / &ge;80% / &lt;80%</div>
                  </th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {visibleDesigns.map((d) => (
                  <tr
                    key={d.rank}
                    className="border-b border-white/5 transition-colors hover:bg-white/[0.02]"
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        className="rounded border-gray-600 accent-dayhoff-purple"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-white/5 px-2 py-0.5 text-xs font-semibold text-white">
                        #{d.rank}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-white">{d.name}</p>
                        <p className="text-[10px] text-gray-500">
                          H3:{d.cdrH3} L3:{d.cdrL3} H1:{d.cdrH1}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1.5">
                        <span className={`inline-block h-2 w-2 shrink-0 rounded-full ${dotBg(rfDiffusionColor(d.rfDiffusionScore))}`} />
                        <span className={rfDiffusionColor(d.rfDiffusionScore)}>{d.rfDiffusionScore}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1.5">
                        <span className={`inline-block h-2 w-2 shrink-0 rounded-full ${dotBg(pLDDTColor(d.pLDDT))}`} />
                        <span className={pLDDTColor(d.pLDDT)}>{d.pLDDT}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1.5">
                        <span className={`inline-block h-2 w-2 shrink-0 rounded-full ${dotBg(bindingColor(d.bindingAffinity))}`} />
                        <span className={bindingColor(d.bindingAffinity)}>{d.bindingAffinity}</span>
                        <span className="text-[10px] text-gray-600">kcal/mol</span>
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1.5">
                        <span className={`inline-block h-2 w-2 shrink-0 rounded-full ${dotBg(humannessColor(d.humanness))}`} />
                        <span className={humannessColor(d.humanness)}>{d.humanness}%</span>
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          title="View design"
                          className="rounded p-1 text-gray-500 hover:bg-white/5 hover:text-white"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                        <button
                          title="Copy sequence"
                          className="rounded p-1 text-gray-500 hover:bg-white/5 hover:text-white"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </button>
                        <button
                          title="Download PDB"
                          className="rounded p-1 text-gray-500 hover:bg-white/5 hover:text-white"
                        >
                          <Download className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Load more */}
            {remaining > 0 && (
              <div className="border-t border-white/5 p-3 text-center">
                <button
                  onClick={() => setVisibleCount((c) => c + 10)}
                  className="text-sm font-medium text-dayhoff-purple hover:text-dayhoff-purple/80"
                >
                  Load More Results ({remaining} remaining)
                </button>
              </div>
            )}

            {/* Empty filter state */}
            {filteredDesigns.length === 0 && (
              <div className="p-8 text-center">
                <p className="text-sm text-gray-400">
                  No designs match the current filters.
                </p>
                <button
                  onClick={() => {
                    setActivePreset("all");
                    setPLDDTMin(0);
                    setBindingMax(0);
                    setHumannessMin(0);
                  }}
                  className="mt-2 text-sm font-medium text-dayhoff-purple hover:text-dayhoff-purple/80"
                >
                  Reset Filters
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {/* ─── Files Tab Content ──────────────────────────────────────── */}
      {activeTab === "Files" && (
        <>
          {/* Final Output Files */}
          <div className="rounded-xl border border-white/10 bg-dayhoff-bg-secondary p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-white">Final Output Files</h2>
              <span className="rounded-full border border-dayhoff-emerald/30 bg-dayhoff-emerald/10 px-2.5 py-0.5 text-[10px] font-semibold text-dayhoff-emerald">
                Ready for Download
              </span>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {FINAL_OUTPUT_FILES.map((f) => (
                <div
                  key={f.name}
                  className="group flex items-start gap-3 rounded-lg border border-white/5 bg-white/[0.02] p-3.5 transition-colors hover:border-white/10 hover:bg-white/[0.04]"
                >
                  <div className={`mt-0.5 shrink-0 rounded-lg p-2 ${fileTypeBg(f.type)}`}>
                    {fileTypeIcon(f.type)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-white">{f.name}</p>
                    <p className="mt-0.5 text-[10px] text-gray-500">
                      {f.type} &middot; {f.size}
                    </p>
                    <p className="mt-1 text-xs text-gray-400">{f.description}</p>
                  </div>
                  <button
                    title={`Download ${f.name}`}
                    className="shrink-0 rounded-md p-1.5 text-gray-600 transition-colors hover:bg-white/5 hover:text-white"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Intermediate Files by Module */}
          <div className="rounded-xl border border-white/10 bg-dayhoff-bg-secondary p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-white">
                Intermediate Files by Module
              </h2>
              <span className="text-xs text-gray-500">
                {TOTAL_INTERMEDIATE_FILES} files from {INTERMEDIATE_FILES.length} modules
              </span>
            </div>

            <div className="mt-4 space-y-5">
              {INTERMEDIATE_FILES.map((mod) => (
                <div key={mod.name}>
                  {/* Module header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`rounded-md p-1.5 ${mod.iconBg}`}>
                        <Sparkles className={`h-3.5 w-3.5 ${mod.color}`} />
                      </div>
                      <h3 className="text-sm font-semibold text-white">{mod.name}</h3>
                    </div>
                    <span className="text-xs text-gray-500">{mod.files.length} files</span>
                  </div>

                  {/* File grid */}
                  <div className="mt-2 grid gap-2 sm:grid-cols-2">
                    {mod.files.map((f) => (
                      <div
                        key={f.name}
                        className="group flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] px-3.5 py-2.5 transition-colors hover:border-white/10 hover:bg-white/[0.04]"
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-white">{f.name}</p>
                          <p className="mt-0.5 text-[10px] text-gray-500">
                            {f.type} &middot; {f.size} &middot; {f.description}
                          </p>
                        </div>
                        <button
                          title={`Download ${f.name}`}
                          className="ml-3 shrink-0 rounded-md p-1.5 text-gray-600 transition-colors hover:bg-white/5 hover:text-white"
                        >
                          <Download className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* ─── Placeholder for other tabs ────────────────────────────── */}
      {activeTab !== "Results" && activeTab !== "Files" && (
        <div className="rounded-xl border border-white/10 bg-dayhoff-bg-secondary p-12 text-center">
          <p className="text-sm text-gray-400">
            {activeTab} tab coming soon.
          </p>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCustomWorkflows } from "@/hooks/useCustomWorkflows";
import { getModuleById } from "@/data/modules-catalog";
import {
  Plus,
  GitBranch,
  ChevronDown,
  ChevronRight,
  Trash2,
  Clock,
  Cpu,
  GraduationCap,
  CheckCircle2,
  Lightbulb,
  ArrowRight,
} from "lucide-react";

/* ── pre-built templates ──────────────────────────────────────── */

interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  moduleIds: string[];
  learnAbout: string;
  keyConceptsCovered: string[];
}

const TEMPLATES: WorkflowTemplate[] = [
  {
    id: "tpl-de-novo",
    name: "De Novo Protein Design",
    description:
      "Design a protein structure from scratch, generate sequences that fold into it, then validate with structure prediction.",
    moduleIds: ["rfdiffusion", "proteinmpnn", "alphafold2"],
    learnAbout:
      "This is the classic generate-then-design pipeline. RFdiffusion creates novel backbone structures using diffusion models (similar to how image AI works, but in 3D protein space). ProteinMPNN then solves the inverse folding problem — designing amino acid sequences that will fold into the generated backbone. Finally, AlphaFold2 validates the design by predicting whether the designed sequence actually folds into the intended structure. If the predicted and designed structures match (high pLDDT, low RMSD), your design is likely viable.",
    keyConceptsCovered: [
      "Diffusion models for protein structure generation",
      "Inverse folding / sequence design",
      "Structure prediction and validation",
      "pLDDT confidence scores",
      "Design-predict-validate cycle",
    ],
  },
];

function TemplateCard({ tpl }: { tpl: WorkflowTemplate }) {
  const [expanded, setExpanded] = useState(false);

  const templateModules = tpl.moduleIds
    .map((id) => getModuleById(id))
    .filter(Boolean);

  const totalGpu = templateModules.some((m) => m!.computeRequirements.gpu);

  return (
    <div className="rounded-xl border border-white/10 bg-dayhoff-bg-secondary p-5">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-base font-semibold text-white">{tpl.name}</h3>
          <p className="mt-1 text-sm text-gray-400">{tpl.description}</p>
        </div>
      </div>

      {/* Pipeline visualization */}
      <div className="mt-4 flex items-center gap-2 overflow-x-auto">
        {templateModules.map((mod, i) => (
          <div key={mod!.id} className="flex items-center gap-2">
            <div className="shrink-0 rounded-lg border border-white/10 bg-white/5 px-3 py-2">
              <div className="text-xs font-semibold text-white">
                {mod!.displayName}
              </div>
              <div className="mt-0.5 text-[10px] text-gray-500">
                {mod!.inputFormats.join("/")} → {mod!.outputFormats.join("/")}
              </div>
            </div>
            {i < templateModules.length - 1 && (
              <ArrowRight className="h-4 w-4 shrink-0 text-gray-600" />
            )}
          </div>
        ))}
      </div>

      {/* Meta */}
      <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
        {totalGpu && (
          <span className="flex items-center gap-1">
            <Cpu className="h-3 w-3" /> GPU Required
          </span>
        )}
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" /> {templateModules.length} steps
        </span>
      </div>

      {/* Learn about this workflow */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="mt-3 flex items-center gap-1 text-xs font-semibold text-dayhoff-emerald hover:underline"
      >
        <GraduationCap className="h-3.5 w-3.5" />
        {expanded ? (
          <ChevronDown className="h-3.5 w-3.5" />
        ) : (
          <ChevronRight className="h-3.5 w-3.5" />
        )}
        Learn about this workflow
      </button>

      {expanded && (
        <div className="mt-3 space-y-3 rounded-lg border border-dayhoff-emerald/20 bg-dayhoff-emerald/5 p-4">
          <p className="text-xs leading-relaxed text-gray-300">{tpl.learnAbout}</p>
          <div>
            <div className="flex items-center gap-1 text-[10px] font-semibold text-dayhoff-emerald">
              <Lightbulb className="h-3 w-3" /> Key Concepts Covered
            </div>
            <ul className="mt-1.5 space-y-1">
              {tpl.keyConceptsCovered.map((concept, i) => (
                <li key={i} className="flex items-start gap-1.5 text-xs text-gray-400">
                  <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-dayhoff-emerald" />
                  {concept}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── main page ─────────────────────────────────────────────────── */

export default function WorkflowsPage() {
  return (
    <Suspense>
      <WorkflowsContent />
    </Suspense>
  );
}

function WorkflowsContent() {
  const searchParams = useSearchParams();
  const { workflows, deleteWorkflow } = useCustomWorkflows();
  const [tab, setTab] = useState<"templates" | "my">("templates");
  const [showSavedMsg, setShowSavedMsg] = useState(false);

  useEffect(() => {
    if (searchParams.get("saved") === "1") {
      setShowSavedMsg(true);
      setTab("my");
      const t = setTimeout(() => setShowSavedMsg(false), 4000);
      return () => clearTimeout(t);
    }
  }, [searchParams]);

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Workflows</h1>
          <p className="mt-1 text-sm text-gray-400">
            Build computational pipelines by connecting bioinformatics modules.
          </p>
        </div>
        <Link
          href="/workflows/builder"
          className="flex items-center gap-2 rounded-lg bg-dayhoff-purple px-5 py-2.5 text-sm font-semibold text-white hover:bg-dayhoff-purple/80"
        >
          <Plus className="h-4 w-4" />
          New Workflow
        </Link>
      </div>

      {/* Saved message */}
      {showSavedMsg && (
        <div className="flex items-center gap-2 rounded-lg border border-dayhoff-emerald/30 bg-dayhoff-emerald/10 p-3 text-sm text-dayhoff-emerald">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          Workflow saved successfully!
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 rounded-lg border border-white/10 bg-white/5 p-1">
        <button
          onClick={() => setTab("templates")}
          className={`flex-1 rounded-md px-4 py-2 text-sm font-semibold transition-all ${
            tab === "templates"
              ? "bg-dayhoff-purple text-white"
              : "text-gray-400 hover:text-white"
          }`}
        >
          Templates
        </button>
        <button
          onClick={() => setTab("my")}
          className={`flex-1 rounded-md px-4 py-2 text-sm font-semibold transition-all ${
            tab === "my"
              ? "bg-dayhoff-purple text-white"
              : "text-gray-400 hover:text-white"
          }`}
        >
          My Workflows
          {workflows.length > 0 && (
            <span className="ml-2 rounded-full bg-white/10 px-2 py-0.5 text-[10px]">
              {workflows.length}
            </span>
          )}
        </button>
      </div>

      {/* Content */}
      {tab === "templates" && (
        <div className="space-y-4">
          {TEMPLATES.map((tpl) => (
            <TemplateCard key={tpl.id} tpl={tpl} />
          ))}
        </div>
      )}

      {tab === "my" && (
        <div className="space-y-4">
          {workflows.length === 0 ? (
            <div className="rounded-xl border border-white/10 bg-dayhoff-bg-secondary p-12 text-center">
              <GitBranch className="mx-auto h-10 w-10 text-gray-600" />
              <p className="mt-3 text-sm text-gray-400">
                No custom workflows yet.
              </p>
              <Link
                href="/workflows/builder"
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-dayhoff-purple px-5 py-2.5 text-sm font-semibold text-white hover:bg-dayhoff-purple/80"
              >
                <Plus className="h-4 w-4" />
                Create Your First Workflow
              </Link>
            </div>
          ) : (
            workflows.map((wf) => (
              <div
                key={wf.id}
                className="rounded-xl border border-white/10 bg-dayhoff-bg-secondary p-5"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-base font-semibold text-white">
                      {wf.name}
                    </h3>
                    {wf.description && (
                      <p className="mt-1 text-sm text-gray-400">
                        {wf.description}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => deleteWorkflow(wf.id)}
                    className="text-gray-500 hover:text-red-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                {/* Module pipeline */}
                <div className="mt-3 flex items-center gap-2 overflow-x-auto">
                  {wf.modules.map((mod, i) => (
                    <div key={mod.id} className="flex items-center gap-2">
                      <div className="shrink-0 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5">
                        <div className="text-xs font-semibold text-white">
                          {mod.name}
                        </div>
                      </div>
                      {i < wf.modules.length - 1 && (
                        <ArrowRight className="h-3.5 w-3.5 shrink-0 text-gray-600" />
                      )}
                    </div>
                  ))}
                </div>

                <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
                  <span>
                    {wf.modules.length} module{wf.modules.length !== 1 ? "s" : ""}
                  </span>
                  <span>
                    {wf.connections.length} connection{wf.connections.length !== 1 ? "s" : ""}
                  </span>
                  <span>
                    Updated{" "}
                    {new Date(wf.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

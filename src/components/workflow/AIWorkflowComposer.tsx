"use client";

import { useState } from "react";
import {
  Sparkles,
  Loader2,
  Brain,
  Cpu,
} from "lucide-react";

/* ── types (exported for builder page) ─────────────────────────── */

export interface ComposedModule {
  moduleId: string;
  name: string;
  category: string;
  position: { x: number; y: number };
  inputs: string[];
  outputs: string[];
  reasoning?: string;
}

export interface ComposedConnection {
  from: number;
  to: number;
  dataType: string;
  learningAnnotation?: string;
  valid?: boolean;
}

export interface ComposeResult {
  workflow: {
    name: string;
    description: string;
    modules: ComposedModule[];
    connections: ComposedConnection[];
  };
  reasoning: string;
  confidenceScore: number;
  warnings: string[];
  keyInsight: string;
  socraticQuestion: string | null;
  source: "ai" | "fallback";
}

/* ── quick templates ───────────────────────────────────────────── */

const QUICK_TEMPLATES = [
  { label: "Antibody design", goal: "Design a therapeutic antibody with good stability and binding affinity" },
  { label: "Structure prediction", goal: "Predict the 3D structure of a protein from its amino acid sequence" },
  { label: "Protein optimization", goal: "Optimize a protein sequence for improved stability and function through directed evolution" },
];

/* ── sidebar input component ───────────────────────────────────── */

interface Props {
  onResult: (result: ComposeResult) => void;
}

export default function AIWorkflowComposer({ onResult }: Props) {
  const [goal, setGoal] = useState("");
  const [maxTime, setMaxTime] = useState("");
  const [gpuAvailable, setGpuAvailable] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!goal.trim() || loading) return;
    setLoading(true);

    try {
      const res = await fetch("/api/workflows/compose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          goal: goal.trim(),
          constraints: {
            maxTime: maxTime || undefined,
            gpuAvailable,
          },
          learningMode: true,
        }),
      });
      const data: ComposeResult = await res.json();
      onResult(data);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-full w-72 flex-col border-r border-white/10 bg-dayhoff-bg-secondary">
      <div className="border-b border-white/10 p-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-white">
          <Brain className="h-4 w-4 text-dayhoff-purple" />
          AI Workflow Designer
        </div>
        <p className="mt-1 text-[11px] text-gray-500">
          Describe your research goal and let AI design an optimal pipeline.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {/* Goal textarea */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-300">
              Research Goal
            </label>
            <textarea
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="e.g., Design a thermostable antibody targeting PD-L1 for cancer immunotherapy..."
              rows={4}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-dayhoff-purple focus:outline-none focus:ring-1 focus:ring-dayhoff-purple"
            />
          </div>

          {/* Quick templates */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-300">
              Quick Templates
            </label>
            <div className="space-y-1.5">
              {QUICK_TEMPLATES.map((t) => (
                <button
                  key={t.label}
                  onClick={() => setGoal(t.goal)}
                  className="flex w-full items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-left text-xs text-gray-300 hover:border-dayhoff-purple/30 hover:bg-white/10"
                >
                  <Sparkles className="h-3 w-3 shrink-0 text-dayhoff-purple" />
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Constraints */}
          <div className="space-y-3">
            <label className="block text-xs font-semibold text-gray-300">
              Constraints
            </label>
            <div>
              <label className="mb-1 block text-[11px] text-gray-500">
                Max Time
              </label>
              <select
                value={maxTime}
                onChange={(e) => setMaxTime(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white focus:border-dayhoff-purple focus:outline-none"
              >
                <option value="">No limit</option>
                <option value="30 minutes">30 minutes</option>
                <option value="1 hour">1 hour</option>
                <option value="2 hours">2 hours</option>
                <option value="4 hours">4+ hours</option>
              </select>
            </div>
            <label className="flex items-center gap-2 text-xs text-gray-300">
              <input
                type="checkbox"
                checked={gpuAvailable}
                onChange={(e) => setGpuAvailable(e.target.checked)}
                className="rounded border-white/10 bg-white/5 text-dayhoff-purple focus:ring-dayhoff-purple"
              />
              <Cpu className="h-3 w-3 text-gray-500" />
              GPU available
            </label>
          </div>
        </div>
      </div>

      {/* Generate button */}
      <div className="border-t border-white/10 p-4">
        <button
          onClick={handleGenerate}
          disabled={!goal.trim() || loading}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-dayhoff-purple py-2.5 text-sm font-semibold text-white hover:bg-dayhoff-purple/80 disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Designing workflow...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Generate Workflow
            </>
          )}
        </button>
      </div>
    </div>
  );
}

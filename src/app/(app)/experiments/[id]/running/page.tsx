"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getModuleById } from "@/data/modules-catalog";
import {
  ArrowLeft,
  ArrowRight,
  Clock,
  Cpu,
  FlaskConical,
  Loader2,
  RotateCcw,
} from "lucide-react";

interface ExperimentData {
  id: string;
  name: string;
  status: string;
  goal: string | null;
  config: {
    recipeId?: string;
    recipeName?: string;
    moduleIds?: string[];
    timeEstimate?: string;
    requiresGpu?: boolean;
  } | null;
  createdAt: string;
}

const STATUS_STYLES: Record<string, string> = {
  DRAFT: "border-gray-500/30 bg-gray-500/10 text-gray-400",
  QUEUED: "border-dayhoff-amber/30 bg-dayhoff-amber/10 text-dayhoff-amber",
  RUNNING: "border-dayhoff-purple/30 bg-dayhoff-purple/10 text-dayhoff-purple",
  COMPLETED:
    "border-dayhoff-emerald/30 bg-dayhoff-emerald/10 text-dayhoff-emerald",
  FAILED: "border-red-500/30 bg-red-500/10 text-red-400",
};

export default function RunningExperimentPage() {
  const params = useParams();
  const experimentId = params.id as string;
  const [experiment, setExperiment] = useState<ExperimentData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Try sessionStorage first for instant load
    const stored = sessionStorage.getItem(`experiment-${experimentId}`);
    if (stored) {
      try {
        setExperiment(JSON.parse(stored));
        setLoading(false);
        return;
      } catch {
        // Fall through to API
      }
    }

    // Fallback: fetch from API (handles refresh / direct navigation)
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

  const modules =
    experiment?.config?.moduleIds
      ?.map((id) => getModuleById(id))
      .filter(Boolean) ?? [];

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-dayhoff-purple" />
      </div>
    );
  }

  if (!experiment) {
    return (
      <div className="mx-auto max-w-4xl space-y-6 p-8">
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
          <Link
            href="/experiments"
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-dayhoff-purple px-5 py-2.5 text-sm font-semibold text-white hover:bg-dayhoff-purple/80"
          >
            View All Experiments
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-8">
      {/* Back link */}
      <Link
        href="/experiments"
        className="flex items-center gap-2 text-sm text-gray-400 hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Experiments
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">{experiment.name}</h1>
          {experiment.config?.recipeName && (
            <p className="mt-0.5 text-sm text-dayhoff-purple">
              {experiment.config.recipeName}
            </p>
          )}
          {experiment.goal && (
            <p className="mt-1 text-sm text-gray-400">{experiment.goal}</p>
          )}
        </div>
        <span
          className={`shrink-0 rounded-full border px-3 py-1 text-sm font-semibold ${STATUS_STYLES[experiment.status] || STATUS_STYLES.QUEUED}`}
        >
          {experiment.status}
        </span>
      </div>

      {/* Pipeline visualization */}
      {modules.length > 0 && (
        <div className="rounded-xl border border-white/10 bg-dayhoff-bg-secondary p-5">
          <h3 className="text-sm font-semibold text-white">Pipeline</h3>
          <div className="mt-3 flex items-center gap-2 overflow-x-auto">
            {modules.map((mod, i) => (
              <div key={mod!.id} className="flex items-center gap-2">
                <div className="shrink-0 rounded-lg border border-dayhoff-purple/30 bg-dayhoff-purple/10 px-4 py-3">
                  <div className="text-sm font-semibold text-white">
                    {mod!.displayName}
                  </div>
                  <div className="mt-0.5 text-[10px] text-gray-400">
                    {mod!.inputFormats.join("/")} →{" "}
                    {mod!.outputFormats.join("/")}
                  </div>
                </div>
                {i < modules.length - 1 && (
                  <ArrowRight className="h-4 w-4 shrink-0 text-dayhoff-purple" />
                )}
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
            {experiment.config?.timeEstimate && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" /> {experiment.config.timeEstimate}
              </span>
            )}
            {experiment.config?.requiresGpu && (
              <span className="flex items-center gap-1">
                <Cpu className="h-3 w-3" /> GPU Required
              </span>
            )}
          </div>
        </div>
      )}

      {/* Simulated progress */}
      <div className="rounded-xl border border-white/10 bg-dayhoff-bg-secondary p-5">
        <h3 className="text-sm font-semibold text-white">Progress</h3>
        <div className="mt-4 flex items-center gap-3">
          <Loader2 className="h-5 w-5 animate-spin text-dayhoff-purple" />
          <div className="flex-1">
            <p className="text-sm text-gray-300">
              Experiment queued — waiting for compute resources...
            </p>
            <div className="mt-2 h-2 rounded-full bg-white/10">
              <div className="h-2 w-[5%] rounded-full bg-dayhoff-purple transition-all" />
            </div>
          </div>
        </div>
        <p className="mt-3 text-xs text-gray-500">
          This is a simulated progress view. In production, this page would
          receive real-time updates from the compute backend.
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <Link
          href="/experiments/new"
          className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/10"
        >
          <RotateCcw className="h-4 w-4" />
          New Experiment
        </Link>
      </div>

      {/* Info */}
      <div className="text-xs text-gray-500">
        Created{" "}
        {new Date(experiment.createdAt).toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })}
        {" · "}
        ID: {experiment.id}
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { FlaskConical, Plus, Loader2, Clock, Trash2 } from "lucide-react";

interface Experiment {
  id: string;
  name: string;
  status: "DRAFT" | "QUEUED" | "RUNNING" | "COMPLETED" | "FAILED";
  goal: string | null;
  config: { workflowName?: string } | null;
  createdAt: string;
}

const STATUS_STYLES: Record<string, string> = {
  DRAFT: "border-gray-500/30 bg-gray-500/10 text-gray-400",
  QUEUED: "border-dayhoff-amber/30 bg-dayhoff-amber/10 text-dayhoff-amber",
  RUNNING: "border-dayhoff-purple/30 bg-dayhoff-purple/10 text-dayhoff-purple",
  COMPLETED: "border-dayhoff-emerald/30 bg-dayhoff-emerald/10 text-dayhoff-emerald",
  FAILED: "border-red-500/30 bg-red-500/10 text-red-400",
};

export default function ExperimentsPage() {
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/experiments");
        if (res.ok) {
          const data = await res.json();
          setExperiments(data);
        }
      } catch {
        // Silently fail
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleDelete = async (id: string) => {
    setDeleting((prev) => new Set(prev).add(id));
    try {
      const res = await fetch(`/api/experiments/${id}`, { method: "DELETE" });
      if (res.ok) {
        setExperiments((prev) => prev.filter((e) => e.id !== id));
      }
    } catch {
      // Silently fail
    } finally {
      setDeleting((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-dayhoff-purple" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Experiments</h1>
          <p className="mt-1 text-sm text-gray-400">
            Launch and track computational biology experiments.
          </p>
        </div>
        <Link
          href="/experiments/new"
          className="flex items-center gap-2 rounded-lg bg-dayhoff-purple px-5 py-2.5 text-sm font-semibold text-white hover:bg-dayhoff-purple/80"
        >
          <Plus className="h-4 w-4" />
          New Experiment
        </Link>
      </div>

      {/* Empty state */}
      {experiments.length === 0 && (
        <div className="rounded-xl border border-white/10 bg-dayhoff-bg-secondary p-12 text-center">
          <FlaskConical className="mx-auto h-10 w-10 text-gray-600" />
          <p className="mt-3 text-sm text-gray-400">No experiments yet.</p>
          <p className="mt-1 text-xs text-gray-500">
            Create your first experiment to start exploring computational
            biology.
          </p>
          <Link
            href="/experiments/new"
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-dayhoff-purple px-5 py-2.5 text-sm font-semibold text-white hover:bg-dayhoff-purple/80"
          >
            <Plus className="h-4 w-4" />
            Create Your First Experiment
          </Link>
        </div>
      )}

      {/* Experiment list */}
      {experiments.length > 0 && (
        <div className="space-y-3">
          {experiments.map((exp) => (
            <div
              key={exp.id}
              className="group relative rounded-xl border border-white/10 bg-dayhoff-bg-secondary p-5 transition-all hover:border-white/20"
            >
              <Link
                href={`/experiments/${exp.id}/running`}
                className="block"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-base font-semibold text-white">
                      {exp.name}
                    </h3>
                    {exp.config?.workflowName && (
                      <p className="mt-0.5 text-xs text-dayhoff-purple">
                        {exp.config.workflowName}
                      </p>
                    )}
                    {exp.goal && (
                      <p className="mt-1 line-clamp-1 text-sm text-gray-400">
                        {exp.goal}
                      </p>
                    )}
                  </div>
                  <span
                    className={`ml-4 shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLES[exp.status] || STATUS_STYLES.DRAFT}`}
                  >
                    {exp.status}
                  </span>
                </div>
                <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
                  <Clock className="h-3 w-3" />
                  {new Date(exp.createdAt).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </Link>
              <button
                onClick={() => handleDelete(exp.id)}
                disabled={deleting.has(exp.id)}
                className="absolute right-4 top-4 rounded-md p-1.5 text-gray-600 opacity-0 transition-all hover:bg-red-500/10 hover:text-red-400 group-hover:opacity-100 disabled:opacity-50"
                title="Delete experiment"
              >
                {deleting.has(exp.id) ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

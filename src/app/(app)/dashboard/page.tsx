"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { getModuleById } from "@/data/modules-catalog";
import {
  FlaskConical,
  CheckCircle2,
  BookOpen,
  Loader2,
  GitBranch,
  Boxes,
  Clock,
  Settings,
  GraduationCap,
  ArrowRight,
} from "lucide-react";

/* ── Types ────────────────────────────────────────────────────── */

interface Experiment {
  id: string;
  name: string;
  status: string;
  goal: string | null;
  config: { recipeName?: string } | null;
  createdAt: string;
}

interface LearningProgressRecord {
  id: string;
  moduleId: string;
  conceptsExplored: string[];
  questionsAsked: number;
  insightsUnlocked: string[];
  skillLevel: "NOVICE" | "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
}

interface DashboardData {
  recentExperiments: Experiment[];
  experimentCounts: {
    total: number;
    queued: number;
    running: number;
    completed: number;
    failed: number;
  };
  learningProgress: LearningProgressRecord[];
  stats: {
    totalModulesExplored: number;
    totalQuestionsAsked: number;
    totalInsights: number;
  };
}

/* ── Helpers ──────────────────────────────────────────────────── */

const STATUS_STYLES: Record<string, string> = {
  DRAFT: "border-gray-500/30 bg-gray-500/10 text-gray-400",
  QUEUED: "border-dayhoff-amber/30 bg-dayhoff-amber/10 text-dayhoff-amber",
  RUNNING: "border-dayhoff-purple/30 bg-dayhoff-purple/10 text-dayhoff-purple",
  COMPLETED: "border-dayhoff-emerald/30 bg-dayhoff-emerald/10 text-dayhoff-emerald",
  FAILED: "border-red-500/30 bg-red-500/10 text-red-400",
};

const SKILL_PROGRESS: Record<string, number> = {
  NOVICE: 10,
  BEGINNER: 35,
  INTERMEDIATE: 65,
  ADVANCED: 100,
};

const SKILL_COLORS: Record<string, string> = {
  NOVICE: "text-gray-400 border-gray-500/30 bg-gray-500/10",
  BEGINNER: "text-dayhoff-amber border-dayhoff-amber/30 bg-dayhoff-amber/10",
  INTERMEDIATE: "text-dayhoff-purple border-dayhoff-purple/30 bg-dayhoff-purple/10",
  ADVANCED: "text-dayhoff-emerald border-dayhoff-emerald/30 bg-dayhoff-emerald/10",
};

function timeAgo(dateStr: string): string {
  const seconds = Math.floor(
    (Date.now() - new Date(dateStr).getTime()) / 1000
  );
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "yesterday";
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

/* ── Main Page ────────────────────────────────────────────────── */

export default function DashboardPage() {
  const { data: session } = useSession();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/dashboard");
        if (res.ok) setData(await res.json());
      } catch {
        // Silently fail
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-dayhoff-purple" />
      </div>
    );
  }

  const counts = data?.experimentCounts ?? {
    total: 0,
    queued: 0,
    running: 0,
    completed: 0,
    failed: 0,
  };
  const stats = data?.stats ?? {
    totalModulesExplored: 0,
    totalQuestionsAsked: 0,
    totalInsights: 0,
  };

  return (
    <div className="mx-auto max-w-6xl space-y-8 p-8">
      {/* ── A. Welcome Header ─────────────────── */}
      <div>
        <h1 className="text-2xl font-bold text-white">
          Welcome back{session?.user?.name ? `, ${session.user.name}` : ""}
        </h1>
        <p className="mt-1 text-sm text-gray-400">
          Here&apos;s what&apos;s happening in your lab
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-xl border border-white/10 bg-dayhoff-bg-secondary p-5">
          <FlaskConical className="h-5 w-5 text-dayhoff-purple" />
          <div className="mt-3 text-3xl font-bold text-white">
            {counts.total}
          </div>
          <div className="mt-1 text-sm text-gray-400">Total Experiments</div>
        </div>
        <div className="rounded-xl border border-white/10 bg-dayhoff-bg-secondary p-5">
          <Loader2
            className={`h-5 w-5 text-dayhoff-amber ${counts.running > 0 ? "animate-spin" : ""}`}
          />
          <div className="mt-3 text-3xl font-bold text-white">
            {counts.running}
          </div>
          <div className="mt-1 text-sm text-gray-400">Running</div>
        </div>
        <div className="rounded-xl border border-white/10 bg-dayhoff-bg-secondary p-5">
          <CheckCircle2 className="h-5 w-5 text-dayhoff-emerald" />
          <div className="mt-3 text-3xl font-bold text-white">
            {counts.completed}
          </div>
          <div className="mt-1 text-sm text-gray-400">Completed</div>
        </div>
        <div className="rounded-xl border border-white/10 bg-dayhoff-bg-secondary p-5">
          <BookOpen className="h-5 w-5 text-dayhoff-pink" />
          <div className="mt-3 text-3xl font-bold text-white">
            {stats.totalModulesExplored}
          </div>
          <div className="mt-1 text-sm text-gray-400">Modules Explored</div>
        </div>
      </div>

      {/* ── B. Quick Actions ──────────────────── */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Link
          href="/experiments/new"
          className="rounded-xl border border-white/10 border-l-4 border-l-dayhoff-purple bg-dayhoff-bg-secondary p-4 transition-all hover:border-white/20"
        >
          <div className="flex items-center gap-3">
            <FlaskConical className="h-5 w-5 text-dayhoff-purple" />
            <div>
              <div className="font-semibold text-white">New Experiment</div>
              <div className="text-xs text-gray-400">
                Launch a computational biology pipeline
              </div>
            </div>
          </div>
        </Link>
        <Link
          href="/workflows/builder"
          className="rounded-xl border border-white/10 border-l-4 border-l-dayhoff-emerald bg-dayhoff-bg-secondary p-4 transition-all hover:border-white/20"
        >
          <div className="flex items-center gap-3">
            <GitBranch className="h-5 w-5 text-dayhoff-emerald" />
            <div>
              <div className="font-semibold text-white">Build Workflow</div>
              <div className="text-xs text-gray-400">
                Design custom module pipelines
              </div>
            </div>
          </div>
        </Link>
        <Link
          href="/modules"
          className="rounded-xl border border-white/10 border-l-4 border-l-dayhoff-pink bg-dayhoff-bg-secondary p-4 transition-all hover:border-white/20"
        >
          <div className="flex items-center gap-3">
            <Boxes className="h-5 w-5 text-dayhoff-pink" />
            <div>
              <div className="font-semibold text-white">Explore Modules</div>
              <div className="text-xs text-gray-400">
                Browse bioinformatics tools
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* ── C. Recent Experiments ─────────────── */}
      <section>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">
            Recent Experiments
          </h2>
          <Link
            href="/experiments"
            className="flex items-center gap-1 text-sm text-dayhoff-purple hover:underline"
          >
            View All <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {(!data?.recentExperiments ||
          data.recentExperiments.length === 0) && (
          <div className="mt-4 rounded-xl border border-white/10 bg-dayhoff-bg-secondary p-8 text-center">
            <FlaskConical className="mx-auto h-8 w-8 text-gray-600" />
            <p className="mt-2 text-sm text-gray-400">
              No experiments yet — launch your first one!
            </p>
            <Link
              href="/experiments/new"
              className="mt-3 inline-flex items-center gap-2 rounded-lg bg-dayhoff-purple px-5 py-2.5 text-sm font-semibold text-white hover:bg-dayhoff-purple/80"
            >
              <FlaskConical className="h-4 w-4" />
              New Experiment
            </Link>
          </div>
        )}

        {data?.recentExperiments && data.recentExperiments.length > 0 && (
          <div className="mt-4 space-y-2">
            {data.recentExperiments.map((exp) => (
              <Link
                key={exp.id}
                href={`/experiments/${exp.id}/running`}
                className="flex items-center justify-between rounded-xl border border-white/10 bg-dayhoff-bg-secondary p-4 transition-all hover:border-white/20"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-sm font-semibold text-white">
                      {exp.name}
                    </h3>
                    <span
                      className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${STATUS_STYLES[exp.status] || STATUS_STYLES.DRAFT}`}
                    >
                      {exp.status}
                    </span>
                  </div>
                  {exp.config?.recipeName && (
                    <p className="mt-0.5 text-xs text-gray-500">
                      {exp.config.recipeName}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Clock className="h-3 w-3" />
                  {timeAgo(exp.createdAt)}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* ── D. Learning Progress ──────────────── */}
      <section>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">
            Learning Journey
          </h2>
          <Link
            href="/learning"
            className="flex items-center gap-1 text-sm text-dayhoff-purple hover:underline"
          >
            View All <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {(!data?.learningProgress ||
          data.learningProgress.length === 0) && (
          <div className="mt-4 rounded-xl border border-dayhoff-emerald/20 bg-dayhoff-emerald/5 p-8 text-center">
            <GraduationCap className="mx-auto h-8 w-8 text-dayhoff-emerald" />
            <p className="mt-2 text-sm text-gray-300">
              Start your learning journey
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Explore modules to learn about computational biology tools and
              track your progress.
            </p>
            <Link
              href="/modules"
              className="mt-3 inline-flex items-center gap-2 rounded-lg bg-dayhoff-emerald/20 px-5 py-2.5 text-sm font-semibold text-dayhoff-emerald hover:bg-dayhoff-emerald/30"
            >
              <Boxes className="h-4 w-4" />
              Explore Modules
            </Link>
          </div>
        )}

        {data?.learningProgress && data.learningProgress.length > 0 && (
          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {data.learningProgress.map((lp) => {
              const mod = getModuleById(lp.moduleId);
              const progress = SKILL_PROGRESS[lp.skillLevel] ?? 10;
              return (
                <Link
                  key={lp.id}
                  href={`/modules/${lp.moduleId}`}
                  className="rounded-xl border border-white/10 bg-dayhoff-bg-secondary p-4 transition-all hover:border-white/20"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-white">
                      {mod?.displayName ?? lp.moduleId}
                    </h3>
                    <span
                      className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${SKILL_COLORS[lp.skillLevel] || SKILL_COLORS.NOVICE}`}
                    >
                      {lp.skillLevel}
                    </span>
                  </div>
                  <div className="mt-3 h-2 rounded-full bg-white/10">
                    <div
                      className="h-2 rounded-full bg-dayhoff-emerald transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                    <span>{lp.conceptsExplored.length} concepts</span>
                    <span>{lp.questionsAsked} questions</span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* ── E. Platform Tips ──────────────────── */}
      <section>
        <h2 className="text-lg font-semibold text-white">Getting Started</h2>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Link
            href="/settings/ai"
            className="rounded-xl border border-white/10 bg-dayhoff-bg-secondary p-4 transition-all hover:border-white/20"
          >
            <Settings className="h-5 w-5 text-dayhoff-purple" />
            <h3 className="mt-2 text-sm font-semibold text-white">
              Configure AI
            </h3>
            <p className="mt-1 text-xs text-gray-400">
              Set up your Anthropic API key for AI-powered features
            </p>
          </Link>
          <Link
            href="/experiments/new"
            className="rounded-xl border border-white/10 bg-dayhoff-bg-secondary p-4 transition-all hover:border-white/20"
          >
            <FlaskConical className="h-5 w-5 text-dayhoff-emerald" />
            <h3 className="mt-2 text-sm font-semibold text-white">
              Try a Recipe
            </h3>
            <p className="mt-1 text-xs text-gray-400">
              Launch a pre-built experiment to see the platform in action
            </p>
          </Link>
          <Link
            href="/modules"
            className="rounded-xl border border-white/10 bg-dayhoff-bg-secondary p-4 transition-all hover:border-white/20"
          >
            <GraduationCap className="h-5 w-5 text-dayhoff-pink" />
            <h3 className="mt-2 text-sm font-semibold text-white">
              Learn the Tools
            </h3>
            <p className="mt-1 text-xs text-gray-400">
              Explore modules to understand computational biology tools
            </p>
          </Link>
        </div>
      </section>
    </div>
  );
}

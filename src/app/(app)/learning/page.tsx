"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { MODULE_CATALOG, getModuleById } from "@/data/modules-catalog";
import FadeIn from "@/components/motion/FadeIn";
import StaggerList from "@/components/motion/StaggerList";
import {
  GraduationCap,
  Boxes,
  Loader2,
  MessageSquare,
  Lightbulb,
  ArrowRight,
  BookOpen,
  Trophy,
  RotateCcw,
} from "lucide-react";

/* ── Types ────────────────────────────────────────────────────── */

interface LearningProgressRecord {
  id: string;
  moduleId: string;
  conceptsExplored: string[];
  questionsAsked: number;
  insightsUnlocked: string[];
  skillLevel: "NOVICE" | "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  lastQuizScore: number | null;
  lastQuizAt: string | null;
}

interface QuizResultRecord {
  id: string;
  moduleId: string;
  score: number;
  totalQs: number;
  skillTier: string;
  createdAt: string;
}

interface DashboardData {
  learningProgress: LearningProgressRecord[];
  quizResults: QuizResultRecord[];
  quizStats: {
    totalQuizzesTaken: number;
    averageScore: number;
  };
  stats: {
    totalModulesExplored: number;
    totalQuestionsAsked: number;
    totalInsights: number;
  };
}

/* ── Helpers ──────────────────────────────────────────────────── */

function computeProgressPercent(lp: LearningProgressRecord): number {
  // Weighted progress based on actual progression thresholds
  let pct = 5; // Base for having a record

  // Questions asked: max 10 questions = 25%
  pct += Math.min(lp.questionsAsked / 10, 1) * 25;

  // Concepts explored: max 8 concepts = 25%
  pct += Math.min(lp.conceptsExplored.length / 8, 1) * 25;

  // Insights: max 5 insights = 15%
  pct += Math.min(lp.insightsUnlocked.length / 5, 1) * 15;

  // Quiz performance: max 100% = 20%
  if (lp.lastQuizScore !== null) {
    pct += (lp.lastQuizScore / 100) * 20;
  }

  // Skill level bonus: 10%
  const levelBonus: Record<string, number> = {
    NOVICE: 0,
    BEGINNER: 3,
    INTERMEDIATE: 7,
    ADVANCED: 10,
  };
  pct += levelBonus[lp.skillLevel] ?? 0;

  return Math.min(Math.round(pct), 100);
}

const SKILL_COLORS: Record<string, string> = {
  NOVICE: "text-gray-400 border-gray-500/30 bg-gray-500/10",
  BEGINNER: "text-dayhoff-amber border-dayhoff-amber/30 bg-dayhoff-amber/10",
  INTERMEDIATE: "text-dayhoff-purple border-dayhoff-purple/30 bg-dayhoff-purple/10",
  ADVANCED: "text-dayhoff-emerald border-dayhoff-emerald/30 bg-dayhoff-emerald/10",
};

const CATEGORY_COLORS: Record<string, string> = {
  protein: "text-dayhoff-purple border-dayhoff-purple/30 bg-dayhoff-purple/10",
  antibody: "text-dayhoff-pink border-dayhoff-pink/30 bg-dayhoff-pink/10",
  interaction: "text-dayhoff-amber border-dayhoff-amber/30 bg-dayhoff-amber/10",
  assessment: "text-dayhoff-emerald border-dayhoff-emerald/30 bg-dayhoff-emerald/10",
};

/* ── Main Page ────────────────────────────────────────────────── */

export default function LearningPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/dashboard");
        if (res.ok) {
          const d = await res.json();
          setData({
            learningProgress: d.learningProgress,
            quizResults: d.quizResults ?? [],
            quizStats: d.quizStats ?? { totalQuizzesTaken: 0, averageScore: 0 },
            stats: d.stats,
          });
        }
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

  const progress = data?.learningProgress ?? [];
  const quizResults = data?.quizResults ?? [];
  const quizStats = data?.quizStats ?? { totalQuizzesTaken: 0, averageScore: 0 };
  const stats = data?.stats ?? {
    totalModulesExplored: 0,
    totalQuestionsAsked: 0,
    totalInsights: 0,
  };

  // Map quiz results by moduleId for easy lookup
  const quizByModule: Record<string, QuizResultRecord> = {};
  for (const qr of quizResults) {
    quizByModule[qr.moduleId] = qr;
  }

  const exploredIds = new Set(progress.map((lp) => lp.moduleId));
  const suggestions = MODULE_CATALOG.filter((m) => !exploredIds.has(m.id)).slice(0, 3);

  return (
    <div className="mx-auto max-w-6xl space-y-8 p-8">
      {/* ── A. Header ─────────────────────────── */}
      <FadeIn>
        <div>
          <h1 className="text-2xl font-bold text-white">My Learning</h1>
          <p className="mt-1 text-sm text-gray-400">
            Track your progress across computational biology concepts
          </p>
        </div>
      </FadeIn>

      {/* ── B. Overall Stats ──────────────────── */}
      <FadeIn delay={0.1}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-white/10 bg-dayhoff-bg-secondary p-5">
          <BookOpen className="h-5 w-5 text-dayhoff-purple" />
          <div className="mt-3 text-3xl font-bold text-white">
            {stats.totalModulesExplored}
          </div>
          <div className="mt-1 text-sm text-gray-400">Modules Explored</div>
        </div>
        <div className="rounded-xl border border-white/10 bg-dayhoff-bg-secondary p-5">
          <MessageSquare className="h-5 w-5 text-dayhoff-emerald" />
          <div className="mt-3 text-3xl font-bold text-white">
            {stats.totalQuestionsAsked}
          </div>
          <div className="mt-1 text-sm text-gray-400">Questions Asked</div>
        </div>
        <div className="rounded-xl border border-white/10 bg-dayhoff-bg-secondary p-5">
          <Lightbulb className="h-5 w-5 text-dayhoff-amber" />
          <div className="mt-3 text-3xl font-bold text-white">
            {stats.totalInsights}
          </div>
          <div className="mt-1 text-sm text-gray-400">Insights Unlocked</div>
        </div>
        <div className="rounded-xl border border-white/10 bg-dayhoff-bg-secondary p-5">
          <Trophy className="h-5 w-5 text-dayhoff-pink" />
          <div className="mt-3 text-3xl font-bold text-white">
            {quizStats.totalQuizzesTaken > 0 ? `${quizStats.averageScore}%` : "--"}
          </div>
          <div className="mt-1 text-sm text-gray-400">
            Avg Quiz Score ({quizStats.totalQuizzesTaken} taken)
          </div>
        </div>
      </div>
      </FadeIn>

      {/* ── C. Module Progress Grid ───────────── */}
      <FadeIn delay={0.15}>
      <section>
        <h2 className="text-lg font-semibold text-white">Module Progress</h2>

        {progress.length === 0 && (
          <div className="mt-4 rounded-xl border border-dayhoff-emerald/20 bg-dayhoff-emerald/5 p-12 text-center">
            <GraduationCap className="mx-auto h-10 w-10 text-dayhoff-emerald" />
            <p className="mt-3 text-sm text-gray-300">
              Your learning journey starts here
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Visit module pages and ask questions to build your computational
              biology knowledge.
            </p>
            <Link
              href="/modules"
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-dayhoff-emerald/20 px-5 py-2.5 text-sm font-semibold text-dayhoff-emerald hover:bg-dayhoff-emerald/30"
            >
              <Boxes className="h-4 w-4" />
              Start with Modules
            </Link>
          </div>
        )}

        {progress.length > 0 && (
          <StaggerList className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {progress.map((lp) => {
              const mod = getModuleById(lp.moduleId);
              const pct = computeProgressPercent(lp);
              const quiz = quizByModule[lp.moduleId];
              return (
                <div
                  key={lp.id}
                  className="rounded-xl border border-white/10 bg-dayhoff-bg-secondary p-5"
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

                  {/* Category badge */}
                  {mod && (
                    <span
                      className={`mt-2 inline-block rounded-full border px-2 py-0.5 text-[10px] font-semibold ${CATEGORY_COLORS[mod.category] || CATEGORY_COLORS.protein}`}
                    >
                      {mod.category}
                    </span>
                  )}

                  {/* Progress bar */}
                  <div className="mt-3 h-2 rounded-full bg-white/10">
                    <div
                      className="h-2 rounded-full bg-dayhoff-emerald transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="mt-1 text-right text-[10px] text-gray-500">{pct}%</div>

                  {/* Stats */}
                  <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                    <span>{lp.conceptsExplored.length} concepts</span>
                    <span>{lp.questionsAsked} questions</span>
                    <span>{lp.insightsUnlocked.length} insights</span>
                  </div>

                  {/* Quiz history */}
                  {quiz && (
                    <div className="mt-3 flex items-center gap-3 rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2 text-xs">
                      <Trophy className="h-3.5 w-3.5 text-dayhoff-pink" />
                      <span className="text-gray-400">
                        Last quiz: <span className="font-semibold text-white">{quiz.score}%</span>
                      </span>
                      <span className="text-gray-600">
                        {new Date(quiz.createdAt).toLocaleDateString()}
                      </span>
                      <Link
                        href={`/modules/${lp.moduleId}`}
                        className="ml-auto flex items-center gap-1 text-dayhoff-purple hover:underline"
                      >
                        <RotateCcw className="h-3 w-3" /> Retake
                      </Link>
                    </div>
                  )}

                  {/* Concepts as chips */}
                  {lp.conceptsExplored.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {lp.conceptsExplored.slice(0, 5).map((c, i) => (
                        <span
                          key={i}
                          className="rounded bg-white/5 px-2 py-0.5 text-[10px] text-gray-400"
                        >
                          {c}
                        </span>
                      ))}
                      {lp.conceptsExplored.length > 5 && (
                        <span className="rounded bg-white/5 px-2 py-0.5 text-[10px] text-gray-500">
                          +{lp.conceptsExplored.length - 5} more
                        </span>
                      )}
                    </div>
                  )}

                  {/* Insights chips */}
                  {lp.insightsUnlocked.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {lp.insightsUnlocked.slice(0, 3).map((ins, i) => (
                        <span
                          key={i}
                          className="rounded bg-dayhoff-amber/10 px-2 py-0.5 text-[10px] text-dayhoff-amber"
                        >
                          {ins}
                        </span>
                      ))}
                      {lp.insightsUnlocked.length > 3 && (
                        <span className="rounded bg-dayhoff-amber/10 px-2 py-0.5 text-[10px] text-dayhoff-amber/60">
                          +{lp.insightsUnlocked.length - 3} more
                        </span>
                      )}
                    </div>
                  )}

                  {/* Continue link */}
                  <Link
                    href={`/modules/${lp.moduleId}`}
                    className="mt-3 flex items-center gap-1 text-xs font-semibold text-dayhoff-purple hover:underline"
                  >
                    Continue Learning
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              );
            })}
          </StaggerList>
        )}
      </section>
      </FadeIn>

      {/* ── D. Suggested Next Steps ───────────── */}
      {suggestions.length > 0 && (
        <FadeIn delay={0.2}>
        <section>
          <h2 className="text-lg font-semibold text-white">
            {progress.length > 0
              ? "Suggested Next Modules"
              : "Popular Modules to Explore"}
          </h2>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {suggestions.map((mod) => (
              <Link
                key={mod.id}
                href={`/modules/${mod.id}`}
                className="rounded-xl border border-white/10 bg-dayhoff-bg-secondary p-4 transition-all hover:border-white/20"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-white">
                    {mod.displayName}
                  </h3>
                  <span
                    className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${CATEGORY_COLORS[mod.category] || CATEGORY_COLORS.protein}`}
                  >
                    {mod.category}
                  </span>
                </div>
                <p className="mt-2 line-clamp-2 text-xs text-gray-400">
                  {mod.learning.conceptSummary.slice(0, 120)}...
                </p>
                <div className="mt-2 flex items-center gap-1 text-xs font-semibold text-dayhoff-purple">
                  Explore <ArrowRight className="h-3 w-3" />
                </div>
              </Link>
            ))}
          </div>
        </section>
        </FadeIn>
      )}
    </div>
  );
}

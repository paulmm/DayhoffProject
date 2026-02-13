"use client";

import Link from "next/link";
import { FlaskConical, Clock, ArrowRight, CheckCircle2 } from "lucide-react";
import type { ModuleExercise } from "@/data/module-exercises";

interface HandsOnExerciseProps {
  exercise: ModuleExercise;
  moduleId: string;
  completed?: boolean;
}

const DIFFICULTY_BADGES: Record<string, string> = {
  beginner: "border-dayhoff-emerald/30 bg-dayhoff-emerald/10 text-dayhoff-emerald",
  intermediate: "border-dayhoff-amber/30 bg-dayhoff-amber/10 text-dayhoff-amber",
  advanced: "border-red-500/30 bg-red-500/10 text-red-400",
};

export default function HandsOnExercise({
  exercise,
  moduleId,
  completed,
}: HandsOnExerciseProps) {
  return (
    <div className="rounded-xl border border-white/10 bg-dayhoff-bg-secondary p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <FlaskConical className="h-4 w-4 text-dayhoff-emerald" />
            <h4 className="font-semibold text-white">{exercise.title}</h4>
            {completed && (
              <span className="flex items-center gap-1 rounded-full border border-dayhoff-emerald/30 bg-dayhoff-emerald/10 px-2 py-0.5 text-[10px] font-semibold text-dayhoff-emerald">
                <CheckCircle2 className="h-3 w-3" />
                Completed
              </span>
            )}
          </div>
          <p className="mt-2 text-sm leading-relaxed text-gray-400">
            {exercise.description}
          </p>
        </div>
      </div>

      {/* Meta badges */}
      <div className="mt-3 flex items-center gap-3 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {exercise.estimatedTime}
        </span>
        <span
          className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold capitalize ${DIFFICULTY_BADGES[exercise.difficulty]}`}
        >
          {exercise.difficulty}
        </span>
      </div>

      {/* Sample input */}
      <div className="mt-3 rounded-lg border border-white/5 bg-white/[0.02] px-4 py-2.5 text-xs text-gray-400">
        <span className="font-semibold text-gray-300">Sample input: </span>
        {exercise.sampleInputDescription}
      </div>

      {/* What You'll Learn */}
      <div className="mt-3">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-dayhoff-emerald">
          What You&apos;ll Learn
        </div>
        <ul className="mt-1.5 space-y-1">
          {exercise.whatYoullLearn.map((item, i) => (
            <li
              key={i}
              className="flex items-start gap-2 text-xs text-gray-300"
            >
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-dayhoff-emerald" />
              {item}
            </li>
          ))}
        </ul>
      </div>

      {/* Expected Outcome */}
      <div className="mt-3 text-xs text-gray-400">
        <span className="font-semibold text-gray-300">Expected outcome: </span>
        {exercise.expectedOutcome}
      </div>

      {/* CTA */}
      <Link
        href={`/experiments/new?workflow=${exercise.workflowId}&module=${moduleId}&exercise=${exercise.id}`}
        className="mt-4 flex items-center justify-center gap-2 rounded-lg bg-dayhoff-emerald px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-dayhoff-emerald/80"
      >
        <FlaskConical className="h-4 w-4" />
        Start Exercise
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}

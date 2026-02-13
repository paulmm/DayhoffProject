"use client";

import { useState, useEffect } from "react";
import {
  FlaskConical,
  Trophy,
  BookOpen,
  MessageCircle,
  Sparkles,
} from "lucide-react";
import QuizPanel from "./QuizPanel";
import HandsOnExercise from "./HandsOnExercise";
import { getExercisesForModule } from "@/data/module-exercises";

type LearnerType = "HANDS_ON" | "ASSESSMENT" | "CONCEPTUAL" | "EXPLORATORY";

interface ApplyKnowledgeSectionProps {
  moduleId: string;
  moduleName: string;
  deepDiveTopics: string[];
  onLevelUp: (level: string) => void;
  onAsk: (question: string) => void;
  onTrack: (action: string, topic?: string) => void;
}

const SECTION_ORDER: Record<LearnerType, string[]> = {
  HANDS_ON: ["exercise", "deepdives", "questions"],
  ASSESSMENT: ["exercise", "deepdives", "questions"],
  CONCEPTUAL: ["deepdives", "exercise", "questions"],
  EXPLORATORY: ["questions", "exercise", "deepdives"],
};

const EXPLORATORY_QUESTIONS = [
  "What are the biggest open problems this tool is trying to solve?",
  "How might this tool evolve in the next 2-3 years?",
  "What complementary tools should I learn alongside this one?",
  "What are the limitations that researchers are actively working to overcome?",
];

export default function ApplyKnowledgeSection({
  moduleId,
  moduleName,
  deepDiveTopics,
  onLevelUp,
  onAsk,
  onTrack,
}: ApplyKnowledgeSectionProps) {
  const [learnerType, setLearnerType] = useState<LearnerType>("HANDS_ON");
  const [exercisesCompleted, setExercisesCompleted] = useState<string[]>([]);

  const exercises = getExercisesForModule(moduleId);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch("/api/settings/ai");
        if (res.ok) {
          const data = await res.json();
          if (data?.learnerType) {
            setLearnerType(data.learnerType as LearnerType);
          }
        }
      } catch {
        // Use default
      }
    }

    async function fetchProgress() {
      try {
        const res = await fetch(`/api/modules/${moduleId}/progress`);
        if (res.ok) {
          const data = await res.json();
          if (data?.exercisesCompleted) {
            setExercisesCompleted(data.exercisesCompleted);
          }
        }
      } catch {
        // Use default
      }
    }

    fetchSettings();
    fetchProgress();
  }, [moduleId]);

  const sectionOrder = SECTION_ORDER[learnerType] || SECTION_ORDER.HANDS_ON;

  const renderSection = (key: string) => {
    switch (key) {
      case "exercise":
        if (exercises.length === 0) return null;
        return (
          <div key="exercise">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-300">
              <FlaskConical className="h-4 w-4 text-dayhoff-emerald" />
              Try It Yourself
            </div>
            <div className="space-y-3">
              {exercises.map((ex) => (
                <HandsOnExercise
                  key={ex.id}
                  exercise={ex}
                  moduleId={moduleId}
                  completed={exercisesCompleted.includes(ex.id)}
                />
              ))}
            </div>
          </div>
        );

      case "quiz":
        return (
          <div key="quiz">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-300">
              <Trophy className="h-4 w-4 text-dayhoff-amber" />
              Knowledge Check
            </div>
            <QuizPanel moduleId={moduleId} onLevelUp={onLevelUp} />
          </div>
        );

      case "deepdives":
        if (deepDiveTopics.length === 0) return null;
        return (
          <div key="deepdives">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-300">
              <BookOpen className="h-4 w-4 text-blue-400" />
              Deep Dives
            </div>
            <div className="flex flex-wrap gap-2">
              {deepDiveTopics.map((topic, i) => (
                <button
                  key={i}
                  onClick={() => {
                    onTrack("expandedDeepDive", topic);
                    onAsk(
                      `Give me a deep dive on "${topic}" in the context of ${moduleName}`
                    );
                  }}
                  className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-gray-300 transition-colors hover:border-blue-400/30 hover:bg-blue-400/10 hover:text-blue-300"
                >
                  {topic}
                </button>
              ))}
            </div>
          </div>
        );

      case "questions":
        return (
          <div key="questions">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-300">
              <MessageCircle className="h-4 w-4 text-dayhoff-purple" />
              Explore Further
            </div>
            <div className="space-y-2">
              {EXPLORATORY_QUESTIONS.map((q, i) => (
                <button
                  key={i}
                  onClick={() =>
                    onAsk(`Regarding ${moduleName}: ${q}`)
                  }
                  className="flex w-full items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-left text-xs text-gray-300 transition-colors hover:border-dayhoff-purple/30 hover:bg-dayhoff-purple/10"
                >
                  <MessageCircle className="h-3.5 w-3.5 shrink-0 text-dayhoff-purple" />
                  {q}
                </button>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div>
      <div className="mb-4 flex items-center gap-2 text-lg font-bold text-white">
        <Sparkles className="h-5 w-5 text-dayhoff-purple" />
        Apply Your Knowledge
      </div>
      <div className="space-y-6">{sectionOrder.map(renderSection)}</div>
    </div>
  );
}

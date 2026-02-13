"use client";

import { useState, useCallback, useEffect } from "react";
import { CheckCircle2, XCircle, Loader2, Trophy, RotateCcw, ArrowRight } from "lucide-react";

interface ClientQuestion {
  id: string;
  question: string;
  options: string[];
  difficulty: "beginner" | "intermediate" | "advanced";
  correctIndex: number;
  explanation: string;
}

interface QuizResultItem {
  questionId: string;
  correct: boolean;
  correctIndex: number;
  explanation: string;
}

interface LastQuizData {
  score: number;
  totalQs: number;
  skillTier: string;
  takenAt: string;
}

interface QuizPanelProps {
  moduleId: string;
  onLevelUp?: (level: string) => void;
}

type QuizState = "init" | "idle" | "loading" | "question" | "feedback" | "submitting" | "complete";

export default function QuizPanel({ moduleId, onLevelUp }: QuizPanelProps) {
  const [state, setState] = useState<QuizState>("init");
  const [questions, setQuestions] = useState<ClientQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<{ questionId: string; selectedIndex: number }[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [results, setResults] = useState<QuizResultItem[]>([]);
  const [score, setScore] = useState(0);
  const [lastQuiz, setLastQuiz] = useState<LastQuizData | null>(null);

  // On mount, check for previous quiz results
  useEffect(() => {
    let cancelled = false;
    async function checkPrevious() {
      try {
        const res = await fetch(`/api/modules/${moduleId}/quiz`);
        if (!res.ok) {
          if (!cancelled) setState("idle");
          return;
        }
        const data = await res.json();
        if (!cancelled) {
          if (data.lastQuiz) {
            setLastQuiz(data.lastQuiz);
          }
          setState("idle");
        }
      } catch {
        if (!cancelled) setState("idle");
      }
    }
    checkPrevious();
    return () => { cancelled = true; };
  }, [moduleId]);

  const loadQuiz = useCallback(async () => {
    setState("loading");
    try {
      const res = await fetch(`/api/modules/${moduleId}/quiz`);
      if (!res.ok) throw new Error("Failed to load quiz");
      const data = await res.json();
      setQuestions(data.questions);
      setCurrentIndex(0);
      setAnswers([]);
      setSelectedIndex(null);
      setResults([]);
      setScore(0);
      setState("question");
    } catch {
      setState("idle");
    }
  }, [moduleId]);

  const selectAnswer = (idx: number) => {
    if (selectedIndex !== null) return; // Already answered
    setSelectedIndex(idx);
    const q = questions[currentIndex];
    setAnswers((prev) => [...prev, { questionId: q.id, selectedIndex: idx }]);
    setState("feedback");
  };

  const goToNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedIndex(null);
      setState("question");
    } else {
      // All questions answered — submit for server-side grading
      submitQuiz();
    }
  };

  const submitQuiz = async () => {
    setState("submitting");
    try {
      const res = await fetch(`/api/modules/${moduleId}/quiz`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });
      if (!res.ok) throw new Error("Failed to submit quiz");
      const data = await res.json();
      setResults(data.results);
      setScore(data.score);
      setLastQuiz({
        score: data.score,
        totalQs: data.totalQuestions,
        skillTier: "",
        takenAt: new Date().toISOString(),
      });

      if (data.skillLevelUp && onLevelUp) {
        onLevelUp(data.skillLevelUp);
      }

      setState("complete");
    } catch {
      setState("idle");
    }
  };

  // Initial loading state
  if (state === "init") {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Loader2 className="h-4 w-4 animate-spin" />
      </div>
    );
  }

  if (state === "idle") {
    // Show previous result if available, with retake option
    if (lastQuiz) {
      const passed = lastQuiz.score >= 70;
      const takenDate = new Date(lastQuiz.takenAt).toLocaleDateString();
      return (
        <div className="rounded-xl border border-white/10 bg-dayhoff-bg-secondary p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Trophy className={`h-5 w-5 ${passed ? "text-dayhoff-emerald" : "text-dayhoff-amber"}`} />
              <div>
                <div className="flex items-center gap-2">
                  <span className={`text-lg font-bold ${passed ? "text-dayhoff-emerald" : "text-dayhoff-amber"}`}>
                    {lastQuiz.score}%
                  </span>
                  {passed ? (
                    <span className="rounded-full border border-dayhoff-emerald/30 bg-dayhoff-emerald/10 px-2 py-0.5 text-[10px] font-semibold text-dayhoff-emerald">
                      Passed
                    </span>
                  ) : (
                    <span className="rounded-full border border-dayhoff-amber/30 bg-dayhoff-amber/10 px-2 py-0.5 text-[10px] font-semibold text-dayhoff-amber">
                      70% to pass
                    </span>
                  )}
                </div>
                <div className="mt-0.5 text-xs text-gray-500">
                  Last taken {takenDate}
                </div>
              </div>
            </div>
            <button
              onClick={loadQuiz}
              className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-gray-300 hover:bg-white/10"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Retake Quiz
            </button>
          </div>
        </div>
      );
    }

    return (
      <button
        onClick={loadQuiz}
        className="flex items-center gap-2 rounded-lg border border-dayhoff-purple/30 bg-dayhoff-purple/10 px-5 py-2.5 text-sm font-semibold text-dayhoff-purple hover:bg-dayhoff-purple/20"
      >
        <Trophy className="h-4 w-4" />
        Knowledge Check
      </button>
    );
  }

  if (state === "loading") {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-dayhoff-bg-secondary p-6 text-sm text-gray-400">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading quiz...
      </div>
    );
  }

  if (state === "question" || state === "feedback") {
    const q = questions[currentIndex];
    const isCorrect = selectedIndex !== null && selectedIndex === q.correctIndex;
    const showFeedback = state === "feedback" && selectedIndex !== null;
    const isLastQuestion = currentIndex === questions.length - 1;

    const DIFF_COLORS: Record<string, string> = {
      beginner: "text-dayhoff-emerald",
      intermediate: "text-dayhoff-amber",
      advanced: "text-red-400",
    };

    return (
      <div className="rounded-xl border border-white/10 bg-dayhoff-bg-secondary p-6">
        <div className="mb-1 flex items-center justify-between text-xs text-gray-500">
          <span>
            Question {currentIndex + 1} of {questions.length}
          </span>
          <span className={`font-semibold capitalize ${DIFF_COLORS[q.difficulty]}`}>
            {q.difficulty}
          </span>
        </div>

        {/* Progress bar */}
        <div className="mb-5 h-1.5 rounded-full bg-white/10">
          <div
            className="h-1.5 rounded-full bg-dayhoff-purple transition-all"
            style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
          />
        </div>

        <p className="mb-5 text-sm font-semibold leading-relaxed text-white">
          {q.question}
        </p>

        <div className="space-y-2">
          {q.options.map((opt, i) => {
            let optionStyle =
              "border-white/10 bg-white/5 text-gray-300 hover:border-dayhoff-purple/30 hover:bg-white/10";

            if (showFeedback) {
              if (i === q.correctIndex) {
                optionStyle = "border-dayhoff-emerald/40 bg-dayhoff-emerald/10 text-white";
              } else if (i === selectedIndex && !isCorrect) {
                optionStyle = "border-red-500/40 bg-red-500/10 text-red-300";
              } else {
                optionStyle = "border-white/5 bg-white/[0.02] text-gray-500";
              }
            }

            return (
              <button
                key={i}
                onClick={() => selectAnswer(i)}
                disabled={showFeedback}
                className={`flex w-full items-start gap-3 rounded-lg border p-3.5 text-left text-sm transition-all ${optionStyle} ${showFeedback ? "cursor-default" : "cursor-pointer"}`}
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/20 text-xs font-bold text-gray-400">
                  {showFeedback && i === q.correctIndex ? (
                    <CheckCircle2 className="h-5 w-5 text-dayhoff-emerald" />
                  ) : showFeedback && i === selectedIndex && !isCorrect ? (
                    <XCircle className="h-5 w-5 text-red-400" />
                  ) : (
                    String.fromCharCode(65 + i)
                  )}
                </span>
                {opt}
              </button>
            );
          })}
        </div>

        {/* Per-question feedback */}
        {showFeedback && (
          <div className={`mt-4 rounded-lg border p-4 ${isCorrect ? "border-dayhoff-emerald/20 bg-dayhoff-emerald/5" : "border-red-500/20 bg-red-500/5"}`}>
            <div className="flex items-center gap-2 text-sm font-semibold">
              {isCorrect ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-dayhoff-emerald" />
                  <span className="text-dayhoff-emerald">Correct!</span>
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4 text-red-400" />
                  <span className="text-red-400">Incorrect</span>
                </>
              )}
            </div>
            <p className="mt-2 text-xs leading-relaxed text-gray-400">
              {q.explanation}
            </p>
          </div>
        )}

        {/* Next / Finish button */}
        {showFeedback && (
          <button
            onClick={goToNext}
            className="mt-4 flex items-center gap-2 rounded-lg bg-dayhoff-purple px-4 py-2.5 text-sm font-semibold text-white hover:bg-dayhoff-purple/80"
          >
            {isLastQuestion ? "See Results" : "Next Question"}
            <ArrowRight className="h-4 w-4" />
          </button>
        )}
      </div>
    );
  }

  if (state === "submitting") {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-dayhoff-bg-secondary p-6 text-sm text-gray-400">
        <Loader2 className="h-4 w-4 animate-spin" />
        Grading your answers...
      </div>
    );
  }

  // Complete state — show final results
  const passed = score >= 70;

  return (
    <div className="rounded-xl border border-white/10 bg-dayhoff-bg-secondary p-6">
      {/* Score summary */}
      <div className="mb-5 text-center">
        <div className={`text-4xl font-bold ${passed ? "text-dayhoff-emerald" : "text-dayhoff-amber"}`}>
          {score}%
        </div>
        <div className="mt-1 text-sm text-gray-400">
          {results.filter((r) => r.correct).length} of {results.length} correct
        </div>
        {passed ? (
          <div className="mt-2 text-xs font-semibold text-dayhoff-emerald">Passed!</div>
        ) : (
          <div className="mt-2 text-xs text-gray-500">70% needed to pass</div>
        )}
      </div>

      {/* Answer review */}
      <div className="space-y-4">
        {results.map((r, i) => {
          const q = questions.find((question) => question.id === r.questionId);
          const userAnswer = answers[i]?.selectedIndex;
          return (
            <div
              key={r.questionId}
              className={`rounded-lg border p-4 ${
                r.correct
                  ? "border-dayhoff-emerald/20 bg-dayhoff-emerald/5"
                  : "border-red-500/20 bg-red-500/5"
              }`}
            >
              <div className="flex items-start gap-2">
                {r.correct ? (
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-dayhoff-emerald" />
                ) : (
                  <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
                )}
                <div className="flex-1">
                  <p className="text-sm font-semibold text-white">{q?.question}</p>
                  {!r.correct && q && (
                    <div className="mt-1.5 space-y-1 text-xs">
                      <div className="text-red-400">
                        Your answer: {q.options[userAnswer ?? 0]}
                      </div>
                      <div className="text-dayhoff-emerald">
                        Correct: {q.options[r.correctIndex]}
                      </div>
                    </div>
                  )}
                  <p className="mt-2 text-xs leading-relaxed text-gray-400">
                    {r.explanation}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <button
        onClick={loadQuiz}
        className="mt-5 flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-gray-300 hover:bg-white/10"
      >
        <RotateCcw className="h-3.5 w-3.5" />
        Retake Quiz
      </button>
    </div>
  );
}

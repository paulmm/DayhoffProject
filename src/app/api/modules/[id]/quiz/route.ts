import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUserId, unauthorizedResponse } from "@/lib/auth-helpers";
import { getQuizForModule } from "@/data/module-quizzes";
import { evaluateSkillProgression } from "@/lib/learning/progress-engine";
import { prisma } from "@/lib/prisma";

/**
 * GET — Returns quiz questions for a module, filtered by difficulty tier matching
 * user's skill level. Strips correctIndex from response (server-side grading only).
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const userId = await getAuthenticatedUserId();
  if (!userId) return unauthorizedResponse();

  const questions = getQuizForModule(params.id);
  if (!questions) {
    return NextResponse.json({ error: "No quiz found for this module" }, { status: 404 });
  }

  // Get user's skill level and last quiz result in parallel
  const [progress, lastQuiz] = await Promise.all([
    prisma.learningProgress.findUnique({
      where: { userId_moduleId: { userId, moduleId: params.id } },
    }),
    prisma.quizResult.findFirst({
      where: { userId, moduleId: params.id },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const skillLevel = progress?.skillLevel ?? "NOVICE";

  // Map skill level to quiz difficulty tier
  let tier: "beginner" | "intermediate" | "advanced";
  switch (skillLevel) {
    case "NOVICE":
    case "BEGINNER":
      tier = "beginner";
      break;
    case "INTERMEDIATE":
      tier = "intermediate";
      break;
    case "ADVANCED":
      tier = "advanced";
      break;
  }

  // Filter questions: include current tier and below
  const tierOrder = ["beginner", "intermediate", "advanced"];
  const maxTierIndex = tierOrder.indexOf(tier);
  const filtered = questions.filter(
    (q) => tierOrder.indexOf(q.difficulty) <= maxTierIndex
  );

  // Include correctIndex and explanation for per-question feedback
  const clientQuestions = filtered.map(({ id, question, options, difficulty, correctIndex, explanation }) => ({
    id,
    question,
    options,
    difficulty,
    correctIndex,
    explanation,
  }));

  return NextResponse.json({
    questions: clientQuestions,
    skillTier: tier,
    totalQuestions: clientQuestions.length,
    ...(lastQuiz
      ? {
          lastQuiz: {
            score: lastQuiz.score,
            totalQs: lastQuiz.totalQs,
            skillTier: lastQuiz.skillTier,
            takenAt: lastQuiz.createdAt.toISOString(),
          },
        }
      : {}),
  });
}

/**
 * POST — Receives answers, grades server-side, creates QuizResult,
 * updates LearningProgress, evaluates skill progression.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const userId = await getAuthenticatedUserId();
  if (!userId) return unauthorizedResponse();

  const { answers } = (await request.json()) as {
    answers: { questionId: string; selectedIndex: number }[];
  };

  if (!answers || !Array.isArray(answers)) {
    return NextResponse.json({ error: "Answers are required" }, { status: 400 });
  }

  const allQuestions = getQuizForModule(params.id);
  if (!allQuestions) {
    return NextResponse.json({ error: "No quiz found for this module" }, { status: 404 });
  }

  // Grade answers server-side
  const gradedAnswers = answers.map((a) => {
    const question = allQuestions.find((q) => q.id === a.questionId);
    if (!question) {
      return { questionId: a.questionId, selectedAnswer: a.selectedIndex, correct: false };
    }
    return {
      questionId: a.questionId,
      selectedAnswer: a.selectedIndex,
      correct: a.selectedIndex === question.correctIndex,
    };
  });

  const correctCount = gradedAnswers.filter((a) => a.correct).length;
  const totalQs = gradedAnswers.length;
  const scorePercent = totalQs > 0 ? Math.round((correctCount / totalQs) * 100) : 0;

  // Determine skill tier from current level
  const progress = await prisma.learningProgress.findUnique({
    where: { userId_moduleId: { userId, moduleId: params.id } },
  });
  const skillLevel = progress?.skillLevel ?? "NOVICE";
  let skillTier: string;
  switch (skillLevel) {
    case "ADVANCED":
      skillTier = "advanced";
      break;
    case "INTERMEDIATE":
      skillTier = "intermediate";
      break;
    default:
      skillTier = "beginner";
  }

  // Create QuizResult and update LearningProgress in parallel
  await Promise.all([
    prisma.quizResult.create({
      data: {
        userId,
        moduleId: params.id,
        score: scorePercent,
        totalQs,
        answers: gradedAnswers,
        skillTier,
      },
    }),
    prisma.learningProgress.upsert({
      where: { userId_moduleId: { userId, moduleId: params.id } },
      update: {
        lastQuizScore: scorePercent,
        lastQuizAt: new Date(),
      },
      create: {
        userId,
        moduleId: params.id,
        lastQuizScore: scorePercent,
        lastQuizAt: new Date(),
      },
    }),
  ]);

  // Evaluate skill progression
  const newLevel = await evaluateSkillProgression(userId, params.id);

  // Build response with explanations
  const results = answers.map((a) => {
    const question = allQuestions.find((q) => q.id === a.questionId);
    return {
      questionId: a.questionId,
      correct: a.selectedIndex === question?.correctIndex,
      correctIndex: question?.correctIndex,
      explanation: question?.explanation ?? "",
    };
  });

  return NextResponse.json({
    score: scorePercent,
    correctCount,
    totalQuestions: totalQs,
    results,
    ...(newLevel ? { skillLevelUp: newLevel } : {}),
  });
}

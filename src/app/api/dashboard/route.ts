import { NextResponse } from "next/server";
import { getAuthenticatedUserId, unauthorizedResponse } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const userId = await getAuthenticatedUserId();
  if (!userId) return unauthorizedResponse();

  const [recentExperiments, statusCounts, totalExperiments, learningProgress, quizResults] =
    await Promise.all([
      prisma.experiment.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      prisma.experiment.groupBy({
        by: ["status"],
        where: { userId },
        _count: true,
      }),
      prisma.experiment.count({ where: { userId } }),
      prisma.learningProgress.findMany({
        where: { userId },
      }),
      prisma.quizResult.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
      }),
    ]);

  const countMap: Record<string, number> = {};
  for (const row of statusCounts) {
    countMap[row.status] = row._count;
  }

  // Build latest quiz per module map
  const latestQuizByModule: Record<string, typeof quizResults[0]> = {};
  for (const qr of quizResults) {
    if (!latestQuizByModule[qr.moduleId]) {
      latestQuizByModule[qr.moduleId] = qr;
    }
  }

  const totalQuizzes = quizResults.length;
  const avgScore = totalQuizzes > 0
    ? Math.round(quizResults.reduce((sum, qr) => sum + qr.score, 0) / totalQuizzes)
    : 0;

  return NextResponse.json({
    recentExperiments,
    experimentCounts: {
      total: totalExperiments,
      queued: countMap.QUEUED ?? 0,
      running: countMap.RUNNING ?? 0,
      completed: countMap.COMPLETED ?? 0,
      failed: countMap.FAILED ?? 0,
    },
    learningProgress,
    quizResults: Object.values(latestQuizByModule),
    quizStats: {
      totalQuizzesTaken: totalQuizzes,
      averageScore: avgScore,
    },
    stats: {
      totalModulesExplored: learningProgress.length,
      totalQuestionsAsked: learningProgress.reduce(
        (sum, lp) => sum + lp.questionsAsked,
        0
      ),
      totalInsights: learningProgress.reduce(
        (sum, lp) => sum + lp.insightsUnlocked.length,
        0
      ),
    },
  });
}

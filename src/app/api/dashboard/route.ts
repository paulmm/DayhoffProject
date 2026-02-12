import { NextResponse } from "next/server";
import { getAuthenticatedUserId, unauthorizedResponse } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const userId = await getAuthenticatedUserId();
  if (!userId) return unauthorizedResponse();

  const [recentExperiments, statusCounts, totalExperiments, learningProgress] =
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
    ]);

  const countMap: Record<string, number> = {};
  for (const row of statusCounts) {
    countMap[row.status] = row._count;
  }

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

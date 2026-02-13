import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUserId, unauthorizedResponse } from "@/lib/auth-helpers";
import { trackConceptExplored, trackInsightUnlocked, trackExerciseCompleted } from "@/lib/learning/progress-engine";

/**
 * Lightweight fire-and-forget POST for tracking page interactions.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const userId = await getAuthenticatedUserId();
  if (!userId) return unauthorizedResponse();

  const { action, topic, exerciseId } = (await request.json()) as {
    action: "visited" | "expandedWhyItMatters" | "expandedDeepDive" | "viewedCaseStudy" | "startedExercise" | "completedExercise";
    topic?: string;
    exerciseId?: string;
  };

  const moduleId = params.id;

  switch (action) {
    case "visited":
      await trackInsightUnlocked(userId, moduleId, "Visited module page");
      break;
    case "expandedWhyItMatters":
      await trackConceptExplored(userId, moduleId, "Why It Matters");
      await trackInsightUnlocked(userId, moduleId, "Explored why it matters");
      break;
    case "expandedDeepDive":
      if (topic) {
        await trackConceptExplored(userId, moduleId, topic);
        await trackInsightUnlocked(userId, moduleId, `Deep dive: ${topic}`);
      }
      break;
    case "viewedCaseStudy":
      if (topic) {
        await trackConceptExplored(userId, moduleId, `caseStudy:${topic}`);
        await trackInsightUnlocked(userId, moduleId, "Viewed case study");
      }
      break;
    case "startedExercise":
      if (exerciseId) {
        await trackInsightUnlocked(userId, moduleId, `Started exercise: ${exerciseId}`);
      }
      break;
    case "completedExercise":
      if (exerciseId) {
        await trackExerciseCompleted(userId, moduleId, exerciseId);
        await trackInsightUnlocked(userId, moduleId, `Completed exercise: ${exerciseId}`);
      }
      break;
  }

  return NextResponse.json({ ok: true });
}

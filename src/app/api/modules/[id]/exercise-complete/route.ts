import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUserId, unauthorizedResponse } from "@/lib/auth-helpers";
import { trackExerciseCompleted, evaluateSkillProgression } from "@/lib/learning/progress-engine";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const userId = await getAuthenticatedUserId();
  if (!userId) return unauthorizedResponse();

  const { exerciseId } = (await request.json()) as { exerciseId: string };

  if (!exerciseId) {
    return NextResponse.json(
      { error: "exerciseId is required" },
      { status: 400 }
    );
  }

  const moduleId = params.id;

  await trackExerciseCompleted(userId, moduleId, exerciseId);
  const newLevel = await evaluateSkillProgression(userId, moduleId);

  return NextResponse.json({
    ok: true,
    ...(newLevel ? { skillLevelUp: newLevel } : {}),
  });
}

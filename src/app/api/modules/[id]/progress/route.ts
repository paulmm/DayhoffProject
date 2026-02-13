import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUserId, unauthorizedResponse } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const userId = await getAuthenticatedUserId();
  if (!userId) return unauthorizedResponse();

  const progress = await prisma.learningProgress.findUnique({
    where: { userId_moduleId: { userId, moduleId: params.id } },
    select: { exercisesCompleted: true },
  });

  return NextResponse.json({
    exercisesCompleted: progress?.exercisesCompleted ?? [],
  });
}

import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUserId, unauthorizedResponse } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const userId = await getAuthenticatedUserId();
  if (!userId) return unauthorizedResponse();

  const body = await request.json();
  const { name, goal, parameters, config } = body;

  if (!name?.trim()) {
    return NextResponse.json(
      { error: "Experiment name is required" },
      { status: 400 }
    );
  }

  const experiment = await prisma.experiment.create({
    data: {
      name: name.trim(),
      goal: goal?.trim() || null,
      status: "QUEUED",
      parameters: parameters ?? null,
      config: config ?? null,
      userId,
    },
  });

  return NextResponse.json(experiment, { status: 201 });
}

export async function GET() {
  const userId = await getAuthenticatedUserId();
  if (!userId) return unauthorizedResponse();

  const experiments = await prisma.experiment.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(experiments);
}

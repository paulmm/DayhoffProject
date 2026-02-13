import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUserId, unauthorizedResponse } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const userId = await getAuthenticatedUserId();
  if (!userId) return unauthorizedResponse();

  const experiment = await prisma.experiment.findFirst({
    where: { id: params.id, userId },
  });

  if (!experiment) {
    return NextResponse.json(
      { error: "Experiment not found" },
      { status: 404 }
    );
  }

  return NextResponse.json(experiment);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const userId = await getAuthenticatedUserId();
  if (!userId) return unauthorizedResponse();

  const experiment = await prisma.experiment.findFirst({
    where: { id: params.id, userId },
  });

  if (!experiment) {
    return NextResponse.json(
      { error: "Experiment not found" },
      { status: 404 }
    );
  }

  await prisma.experiment.delete({ where: { id: params.id } });

  return NextResponse.json({ deleted: true });
}

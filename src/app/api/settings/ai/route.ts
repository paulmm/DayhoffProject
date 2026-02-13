import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { encrypt, decrypt } from "@/lib/ai/get-user-ai-service";
import { getAuthenticatedUserId, unauthorizedResponse } from "@/lib/auth-helpers";

export async function GET() {
  const userId = await getAuthenticatedUserId();
  if (!userId) return unauthorizedResponse();

  const settings = await prisma.aISettings.findUnique({
    where: { userId },
  });

  if (!settings) {
    return NextResponse.json(null);
  }

  // Return settings with masked API key
  return NextResponse.json({
    ...settings,
    anthropicApiKey: settings.anthropicApiKey
      ? "sk-ant-•••" + decrypt(settings.anthropicApiKey).slice(-4)
      : null,
    hasApiKey: !!settings.anthropicApiKey,
  });
}

export async function PUT(request: NextRequest) {
  const userId = await getAuthenticatedUserId();
  if (!userId) return unauthorizedResponse();

  const body = await request.json();
  const {
    anthropicApiKey,
    modelId,
    temperature,
    maxTokens,
    topP,
    topK,
    enableStreaming,
    enableCaching,
    learningMode,
    learnerType,
  } = body;

  // Build update data — only encrypt if a new key is provided
  const data: Record<string, any> = {
    modelId,
    temperature,
    maxTokens,
    topP,
    topK,
    enableStreaming,
    enableCaching,
    learningMode,
    learnerType,
  };

  if (anthropicApiKey && !anthropicApiKey.startsWith("sk-ant-•••")) {
    data.anthropicApiKey = encrypt(anthropicApiKey);
  }

  const settings = await prisma.aISettings.upsert({
    where: { userId },
    update: data,
    create: {
      userId,
      ...data,
      anthropicApiKey: anthropicApiKey
        ? encrypt(anthropicApiKey)
        : undefined,
    },
  });

  return NextResponse.json({
    ...settings,
    anthropicApiKey: settings.anthropicApiKey
      ? "sk-ant-•••" + decrypt(settings.anthropicApiKey).slice(-4)
      : null,
    hasApiKey: !!settings.anthropicApiKey,
  });
}

export async function DELETE() {
  const userId = await getAuthenticatedUserId();
  if (!userId) return unauthorizedResponse();

  await prisma.aISettings.deleteMany({
    where: { userId },
  });

  return NextResponse.json({ success: true });
}

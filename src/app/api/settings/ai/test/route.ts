import { NextRequest, NextResponse } from "next/server";
import { AnthropicAIService } from "@/lib/ai/ai-service";
import { prisma } from "@/lib/prisma";
import { decrypt } from "@/lib/ai/get-user-ai-service";
import { getAuthenticatedUserId, unauthorizedResponse } from "@/lib/auth-helpers";

export async function POST(request: NextRequest) {
  const userId = await getAuthenticatedUserId();
  if (!userId) return unauthorizedResponse();

  const body = await request.json();
  let { apiKey, modelId } = body;

  // If no key provided in the request, use the stored one
  if (!apiKey || apiKey.startsWith("sk-ant-•••")) {
    const settings = await prisma.aISettings.findUnique({
      where: { userId },
    });
    if (!settings?.anthropicApiKey) {
      return NextResponse.json(
        { success: false, message: "No API key configured" },
        { status: 400 }
      );
    }
    apiKey = decrypt(settings.anthropicApiKey);
    modelId = modelId || settings.modelId;
  }

  const service = new AnthropicAIService({
    apiKey,
    modelId: modelId || "claude-sonnet-4-5-20250929",
    temperature: 0.7,
    maxTokens: 32,
    topP: 1,
    topK: 0,
  });

  const result = await service.testConnection();
  return NextResponse.json(result);
}

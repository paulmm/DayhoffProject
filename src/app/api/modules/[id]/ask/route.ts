import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUserId, unauthorizedResponse } from "@/lib/auth-helpers";
import { getUserAIService } from "@/lib/ai/get-user-ai-service";
import { LEARNING_SYSTEM_PROMPTS } from "@/lib/ai/learning-prompts";
import { getModuleById } from "@/data/modules-catalog";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const userId = await getAuthenticatedUserId();
  if (!userId) return unauthorizedResponse();

  const { question } = await request.json();
  if (!question) {
    return NextResponse.json(
      { error: "Question is required" },
      { status: 400 }
    );
  }

  const mod = getModuleById(params.id);
  if (!mod) {
    return NextResponse.json({ error: "Module not found" }, { status: 404 });
  }

  // Track the question in LearningProgress
  await prisma.learningProgress.upsert({
    where: {
      userId_moduleId: { userId, moduleId: params.id },
    },
    update: {
      questionsAsked: { increment: 1 },
    },
    create: {
      userId,
      moduleId: params.id,
      questionsAsked: 1,
    },
  });

  // Try to get AI service
  const aiService = await getUserAIService(userId);
  if (!aiService) {
    return NextResponse.json({
      answer: `I'd love to answer your question about ${mod.displayName}, but you haven't configured an API key yet. Go to Settings → AI to add your Anthropic API key.\n\nIn the meantime, here's what I can tell you from the module documentation:\n\n**${mod.learning.conceptSummary}**\n\n**Key Insight:** ${mod.learning.keyInsight}`,
      source: "fallback",
    });
  }

  const moduleContext = `
Module: ${mod.displayName}
Category: ${mod.category}
Description: ${mod.description}
Concept Summary: ${mod.learning.conceptSummary}
Why It Matters: ${mod.learning.whyItMatters}
Key Insight: ${mod.learning.keyInsight}
Prerequisites: ${mod.learning.prerequisites.join(", ")}
Common Mistakes: ${mod.learning.commonMistakes.join("; ")}
Input: ${mod.inputFormats.join(", ")} | Output: ${mod.outputFormats.join(", ")}
`.trim();

  const systemPrompt = `${LEARNING_SYSTEM_PROMPTS.conceptExplainer}

You are answering a question about the following bioinformatics mod. Use the provided context but feel free to draw on broader knowledge. Keep responses focused and educational.

${moduleContext}`;

  try {
    const answer = await aiService.generateCompletion(question, systemPrompt);
    return NextResponse.json({ answer, source: "ai" });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "AI request failed" },
      { status: 500 }
    );
  }
}

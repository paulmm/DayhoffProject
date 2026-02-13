import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUserId, unauthorizedResponse } from "@/lib/auth-helpers";
import { getUserAIService } from "@/lib/ai/get-user-ai-service";
import { selectPromptForContext, getSkillLevelInstruction, getLearnerTypeInstruction } from "@/lib/ai/learning-prompts";
import { getUserLearningContext } from "@/lib/ai/get-user-learning-context";
import { getModuleById } from "@/data/modules-catalog";
import { getCaseStudiesForModule } from "@/data/module-case-studies";
import { trackConceptExplored, trackInsightUnlocked, evaluateSkillProgression } from "@/lib/learning/progress-engine";
import { prisma } from "@/lib/prisma";

function detectConcepts(
  question: string,
  mod: { learning: { deepDiveTopics: string[]; prerequisites: string[]; commonMistakes: string[] } }
): string[] {
  const q = question.toLowerCase();
  const detected: string[] = [];

  for (const topic of mod.learning.deepDiveTopics) {
    const keywords = topic.toLowerCase().split(/[\s,()]+/).filter((w) => w.length > 4);
    if (keywords.some((kw) => q.includes(kw))) {
      detected.push(topic);
    }
  }

  for (const prereq of mod.learning.prerequisites) {
    const keywords = prereq.toLowerCase().split(/[\s,()]+/).filter((w) => w.length > 4);
    if (keywords.some((kw) => q.includes(kw))) {
      detected.push(prereq);
    }
  }

  for (const mistake of mod.learning.commonMistakes) {
    const keywords = mistake.toLowerCase().split(/[\s,()]+/).filter((w) => w.length > 5);
    const matchCount = keywords.filter((kw) => q.includes(kw)).length;
    if (matchCount >= 2) {
      detected.push(mistake.slice(0, 60));
    }
  }

  return Array.from(new Set(detected));
}

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

  // Fetch learning context and track question in parallel
  const [learningContext] = await Promise.all([
    getUserLearningContext(userId, params.id),
    prisma.learningProgress.upsert({
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
    }),
  ]);

  // Track first question insight (fire-and-forget)
  if (learningContext.questionsAsked === 0) {
    trackInsightUnlocked(userId, params.id, "Asked first question");
  }

  // Detect and track concepts from the question (fire-and-forget)
  const detectedConcepts = detectConcepts(question, mod);
  for (const concept of detectedConcepts) {
    trackConceptExplored(userId, params.id, concept);
  }

  // Try to get AI service
  const aiService = await getUserAIService(userId);
  if (!aiService) {
    return NextResponse.json({
      answer: `I'd love to answer your question about ${mod.displayName}, but you haven't configured an API key yet. Go to Settings → AI to add your Anthropic API key.\n\nIn the meantime, here's what I can tell you from the module documentation:\n\n**${mod.learning.conceptSummary}**\n\n**Key Insight:** ${mod.learning.keyInsight}`,
      source: "fallback",
    });
  }

  // Build case study context
  const caseStudies = getCaseStudiesForModule(params.id);
  const caseStudyContext = caseStudies.length > 0
    ? `\nReal-World Case Studies (reference these when relevant):\n${caseStudies.map((cs) => `- "${cs.paperTitle}" (${cs.authors}, ${cs.year}, ${cs.journal}): ${cs.summary}`).join("\n")}`
    : "";

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
${caseStudyContext}
`.trim();

  // Select prompt based on learning mode and add skill calibration
  const basePrompt = selectPromptForContext(learningContext.learningMode, "module");
  const skillInstruction = getSkillLevelInstruction(learningContext.skillLevel);

  const learnerTypeInstruction = getLearnerTypeInstruction(learningContext.learnerType);

  const systemPrompt = `${basePrompt}

You are answering a question about the following bioinformatics module. Use the provided context but feel free to draw on broader knowledge. Keep responses focused and educational.

${moduleContext}${skillInstruction}${learnerTypeInstruction}`;

  try {
    const answer = await aiService.generateCompletion(question, systemPrompt);

    // Evaluate skill progression after response
    const newLevel = await evaluateSkillProgression(userId, params.id);

    return NextResponse.json({
      answer,
      source: "ai",
      ...(newLevel ? { skillLevelUp: newLevel } : {}),
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "AI request failed" },
      { status: 500 }
    );
  }
}

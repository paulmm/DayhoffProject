import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUserId, unauthorizedResponse } from "@/lib/auth-helpers";
import { getUserAIService } from "@/lib/ai/get-user-ai-service";
import { LEARNING_SYSTEM_PROMPTS } from "@/lib/ai/learning-prompts";
import { EXPERIMENT_RECIPES } from "@/data/experiment-recipes";

interface AnalyzeResponse {
  suggestedRecipeId: string;
  confidence: number;
  reasoning: string;
  learningObjectives: string[];
  alternativeRecipeId: string | null;
}

function keywordFallback(goal: string): AnalyzeResponse {
  const lower = goal.toLowerCase();

  let recipeId = "de-novo-design";
  let altId: string | null = "structure-prediction";
  let reasoning = "Based on keyword analysis of your research goal.";

  if (lower.includes("antibod") || lower.includes("cdr") || lower.includes("immunoglobulin")) {
    recipeId = "antibody-optimization";
    altId = "de-novo-design";
    reasoning =
      "Your goal mentions antibody-related concepts. The Antibody Optimization recipe uses specialized tools for CDR loop design and stability assessment.";
  } else if (lower.includes("structure") || lower.includes("fold") || lower.includes("predict")) {
    recipeId = "structure-prediction";
    altId = "de-novo-design";
    reasoning =
      "Your goal involves structure prediction. This recipe uses both AlphaFold2 and ESMFold for cross-validated predictions.";
  } else if (lower.includes("dock") || lower.includes("bind") || lower.includes("interact")) {
    recipeId = "molecular-docking";
    altId = "structure-prediction";
    reasoning =
      "Your goal involves protein-protein interactions. Molecular Docking predicts how two proteins physically bind.";
  } else if (lower.includes("evolv") || lower.includes("optim") || lower.includes("mutati") || lower.includes("improv")) {
    recipeId = "directed-evolution";
    altId = "antibody-optimization";
    reasoning =
      "Your goal involves sequence optimization or directed evolution. This recipe uses gradient-guided evolution with stability assessment.";
  } else {
    reasoning =
      "De Novo Protein Design is the most general-purpose recipe, suitable for creating novel proteins. Configure an AI API key in Settings for more precise recommendations.";
  }

  return {
    suggestedRecipeId: recipeId,
    confidence: 0.6,
    reasoning,
    learningObjectives: EXPERIMENT_RECIPES.find((r) => r.id === recipeId)?.whatWillLearn ?? [],
    alternativeRecipeId: altId,
  };
}

export async function POST(request: NextRequest) {
  const userId = await getAuthenticatedUserId();
  if (!userId) return unauthorizedResponse();

  const body = await request.json();
  const { goal } = body;

  if (!goal?.trim()) {
    return NextResponse.json(
      { error: "Research goal is required" },
      { status: 400 }
    );
  }

  const aiService = await getUserAIService(userId);

  if (!aiService) {
    return NextResponse.json(keywordFallback(goal));
  }

  const recipeCatalog = EXPERIMENT_RECIPES.map(
    (r) =>
      `- ${r.id}: "${r.name}" — ${r.description} Modules: ${r.moduleIds.join(" → ")}. Time: ${r.timeEstimate}. GPU: ${r.requiresGpu ? "required" : "not required"}.`
  ).join("\n");

  const systemPrompt = `${LEARNING_SYSTEM_PROMPTS.workflowMentor}

You are recommending an experiment recipe for a computational biology research goal.

Available recipes:
${recipeCatalog}

You MUST respond with valid JSON matching this exact schema:
{
  "suggestedRecipeId": "string - exact recipe id from the list above",
  "confidence": 0.85,
  "reasoning": "string - 2-3 sentences explaining why this recipe fits the goal and what the user will learn",
  "learningObjectives": ["string - 3-4 specific things the user will learn from this experiment"],
  "alternativeRecipeId": "string or null - a second recipe that could also work"
}`;

  const userPrompt = `Research goal: "${goal}"

Which experiment recipe best matches this goal? Respond ONLY with valid JSON, no markdown or explanation outside the JSON.`;

  try {
    const response = await aiService.generateCompletion(userPrompt, systemPrompt);

    let parsed: AnalyzeResponse;
    try {
      const jsonMatch = response.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, response];
      parsed = JSON.parse(jsonMatch[1]!.trim());
    } catch {
      return NextResponse.json(keywordFallback(goal));
    }

    // Validate the suggested recipe exists
    const validRecipe = EXPERIMENT_RECIPES.find((r) => r.id === parsed.suggestedRecipeId);
    if (!validRecipe) {
      return NextResponse.json(keywordFallback(goal));
    }

    return NextResponse.json({
      suggestedRecipeId: parsed.suggestedRecipeId,
      confidence: Math.min(1, Math.max(0, parsed.confidence || 0.75)),
      reasoning: parsed.reasoning || "",
      learningObjectives: parsed.learningObjectives || validRecipe.whatWillLearn,
      alternativeRecipeId: parsed.alternativeRecipeId || null,
    });
  } catch {
    return NextResponse.json(keywordFallback(goal));
  }
}

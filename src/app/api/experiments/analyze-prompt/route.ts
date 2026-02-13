import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUserId, unauthorizedResponse } from "@/lib/auth-helpers";
import { getUserAIService } from "@/lib/ai/get-user-ai-service";
import { LEARNING_SYSTEM_PROMPTS } from "@/lib/ai/learning-prompts";
import { EXPERIMENT_WORKFLOWS } from "@/data/experiment-recipes";

interface AnalyzeResponse {
  suggestedWorkflowId: string;
  confidence: number;
  reasoning: string;
  learningObjectives: string[];
  alternativeWorkflowId: string | null;
}

function keywordFallback(goal: string): AnalyzeResponse {
  const lower = goal.toLowerCase();

  let workflowId = "de-novo-design";
  let altId: string | null = "structure-prediction";
  let reasoning = "Based on keyword analysis of your research goal.";

  if (lower.includes("antibod") || lower.includes("cdr") || lower.includes("immunoglobulin")) {
    workflowId = "antibody-optimization";
    altId = "de-novo-design";
    reasoning =
      "Your goal mentions antibody-related concepts. The Antibody Optimization workflow uses specialized tools for CDR loop design and stability assessment.";
  } else if (lower.includes("structure") || lower.includes("fold") || lower.includes("predict")) {
    workflowId = "structure-prediction";
    altId = "de-novo-design";
    reasoning =
      "Your goal involves structure prediction. This workflow uses both AlphaFold2 and ESMFold for cross-validated predictions.";
  } else if (lower.includes("dock") || lower.includes("bind") || lower.includes("interact")) {
    workflowId = "molecular-docking";
    altId = "structure-prediction";
    reasoning =
      "Your goal involves protein-protein interactions. Molecular Docking predicts how two proteins physically bind.";
  } else if (lower.includes("evolv") || lower.includes("optim") || lower.includes("mutati") || lower.includes("improv")) {
    workflowId = "directed-evolution";
    altId = "antibody-optimization";
    reasoning =
      "Your goal involves sequence optimization or directed evolution. This workflow uses gradient-guided evolution with stability assessment.";
  } else {
    reasoning =
      "De Novo Protein Design is the most general-purpose workflow, suitable for creating novel proteins. Configure an AI API key in Settings for more precise recommendations.";
  }

  return {
    suggestedWorkflowId: workflowId,
    confidence: 0.6,
    reasoning,
    learningObjectives: EXPERIMENT_WORKFLOWS.find((r) => r.id === workflowId)?.whatWillLearn ?? [],
    alternativeWorkflowId: altId,
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

  const workflowCatalog = EXPERIMENT_WORKFLOWS.map(
    (r) =>
      `- ${r.id}: "${r.name}" — ${r.description} Modules: ${r.moduleIds.join(" → ")}. Time: ${r.timeEstimate}. GPU: ${r.requiresGpu ? "required" : "not required"}.`
  ).join("\n");

  const systemPrompt = `${LEARNING_SYSTEM_PROMPTS.workflowMentor}

You are recommending an experiment workflow for a computational biology research goal.

Available workflows:
${workflowCatalog}

You MUST respond with valid JSON matching this exact schema:
{
  "suggestedWorkflowId": "string - exact workflow id from the list above",
  "confidence": 0.85,
  "reasoning": "string - 2-3 sentences explaining why this workflow fits the goal and what the user will learn",
  "learningObjectives": ["string - 3-4 specific things the user will learn from this experiment"],
  "alternativeWorkflowId": "string or null - a second workflow that could also work"
}`;

  const userPrompt = `Research goal: "${goal}"

Which experiment workflow best matches this goal? Respond ONLY with valid JSON, no markdown or explanation outside the JSON.`;

  try {
    const response = await aiService.generateCompletion(userPrompt, systemPrompt);

    let parsed: AnalyzeResponse;
    try {
      const jsonMatch = response.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, response];
      parsed = JSON.parse(jsonMatch[1]!.trim());
    } catch {
      return NextResponse.json(keywordFallback(goal));
    }

    // Validate the suggested workflow exists
    const validWorkflow = EXPERIMENT_WORKFLOWS.find((r) => r.id === parsed.suggestedWorkflowId);
    if (!validWorkflow) {
      return NextResponse.json(keywordFallback(goal));
    }

    return NextResponse.json({
      suggestedWorkflowId: parsed.suggestedWorkflowId,
      confidence: Math.min(1, Math.max(0, parsed.confidence || 0.75)),
      reasoning: parsed.reasoning || "",
      learningObjectives: parsed.learningObjectives || validWorkflow.whatWillLearn,
      alternativeWorkflowId: parsed.alternativeWorkflowId || null,
    });
  } catch {
    return NextResponse.json(keywordFallback(goal));
  }
}

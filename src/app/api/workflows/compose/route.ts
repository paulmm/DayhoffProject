import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUserId, unauthorizedResponse } from "@/lib/auth-helpers";
import { getUserAIService } from "@/lib/ai/get-user-ai-service";
import { LEARNING_SYSTEM_PROMPTS } from "@/lib/ai/learning-prompts";
import { MODULE_CATALOG } from "@/data/modules-catalog";
import { suggestModulesForGoal, validateModuleConnection } from "@/lib/modules/module-metadata";

interface ComposeRequest {
  goal: string;
  constraints?: {
    maxTime?: string;
    gpuAvailable?: boolean;
  };
  learningMode?: boolean;
}

function buildFallbackWorkflow(goal: string, constraints?: ComposeRequest["constraints"]) {
  const suggestedIds = suggestModulesForGoal(goal);
  if (suggestedIds.length === 0) {
    suggestedIds.push("alphafold2");
  }

  const mods = suggestedIds
    .map((id) => MODULE_CATALOG.find((m) => m.id === id))
    .filter(Boolean);

  // Filter by GPU if needed
  const filtered = constraints?.gpuAvailable === false
    ? mods.filter((m) => !m!.computeRequirements.gpu)
    : mods;

  const finalMods = filtered.length > 0 ? filtered : mods.slice(0, 2);

  const modules = finalMods.map((m, i) => ({
    moduleId: m!.id,
    name: m!.displayName,
    category: m!.category,
    position: { x: 100 + i * 280, y: 200 },
    inputs: m!.inputFormats.map((f) => f.toLowerCase()),
    outputs: m!.outputFormats.map((f) => f.toLowerCase()),
  }));

  const connections: { from: number; to: number; dataType: string; learningAnnotation: string }[] = [];
  for (let i = 0; i < modules.length - 1; i++) {
    const validation = validateModuleConnection(modules[i].moduleId, modules[i + 1].moduleId);
    if (validation.valid) {
      connections.push({
        from: i,
        to: i + 1,
        dataType: validation.message.replace("Compatible via ", ""),
        learningAnnotation: validation.learningNote,
      });
    }
  }

  const reasoning = modules
    .map(
      (m, i) =>
        `Step ${i + 1}: ${m.name} — Selected based on your goal keywords. ${
          MODULE_CATALOG.find((c) => c.id === m.moduleId)?.learning.whyItMatters || ""
        }`
    )
    .join("\n\n");

  return {
    workflow: {
      name: `Workflow for: ${goal.slice(0, 50)}`,
      description: `Auto-generated workflow based on: ${goal}`,
      modules,
      connections,
    },
    reasoning,
    confidenceScore: 0.6,
    warnings: [
      "This workflow was generated using keyword matching (no AI). Configure an API key in Settings for AI-powered workflow design.",
    ],
    keyInsight:
      "This is a basic suggestion. An AI-powered design would consider module interactions, optimal ordering, and your specific constraints.",
    socraticQuestion: null,
    source: "fallback" as const,
  };
}

export async function POST(request: NextRequest) {
  const userId = await getAuthenticatedUserId();
  if (!userId) return unauthorizedResponse();

  const body: ComposeRequest = await request.json();
  const { goal, constraints, learningMode = true } = body;

  if (!goal?.trim()) {
    return NextResponse.json(
      { error: "Research goal is required" },
      { status: 400 }
    );
  }

  const aiService = await getUserAIService(userId);

  if (!aiService) {
    const fallback = buildFallbackWorkflow(goal, constraints);
    return NextResponse.json(fallback);
  }

  // Build module catalog context for AI
  const catalogContext = MODULE_CATALOG.map(
    (m) =>
      `- ${m.id} (${m.displayName}): ${m.description}. Category: ${m.category}. Input: ${m.inputFormats.join(", ")}. Output: ${m.outputFormats.join(", ")}. GPU: ${m.computeRequirements.gpu ? "required" : "not required"}. Time: ${m.computeRequirements.timeEstimate}. Key insight: ${m.learning.keyInsight}`
  ).join("\n");

  const constraintText = constraints
    ? `\nConstraints: ${constraints.maxTime ? `Max time: ${constraints.maxTime}.` : ""} ${constraints.gpuAvailable === false ? "No GPU available." : "GPU available."}`
    : "";

  const socraticInstruction = learningMode
    ? `\n- IMPORTANT: Include a "socraticQuestion" field with a thought-provoking question about experimental design that the user should consider before finalizing. This teaches them to think critically about pipeline design.`
    : "";

  const systemPrompt = `${LEARNING_SYSTEM_PROMPTS.workflowMentor}

You are designing a computational biology workflow. You have access to these modules:

${catalogContext}

IMPORTANT RULES:
- Only use modules from the list above (use their exact id values)
- Modules connect via compatible I/O formats (e.g., PDB output → PDB input, FASTA output → FASTA input)
- Each module should have a clear scientific purpose in the pipeline
- Explain WHY each step matters, not just WHAT it does

You MUST respond with valid JSON matching this exact schema:
{
  "workflow": {
    "name": "string - concise workflow name",
    "description": "string - one sentence description",
    "modules": [
      {
        "moduleId": "string - exact module id from catalog",
        "reasoning": "string - WHY this module is needed (2-3 sentences)"
      }
    ],
    "connections": [
      {
        "fromIndex": 0,
        "toIndex": 1,
        "dataType": "PDB or FASTA or CSV"
      }
    ]
  },
  "reasoning": "string - overall design rationale (2-3 paragraphs)",
  "confidenceScore": 0.85,
  "warnings": ["string - potential issues or limitations"],
  "keyInsight": "string - the most important design principle in this workflow"${learningMode ? ',\n  "socraticQuestion": "string - a question to make the user think about design choices"' : ""}
}${socraticInstruction}`;

  const userPrompt = `Design a workflow for this research goal: "${goal}"${constraintText}

Respond ONLY with valid JSON, no markdown or explanation outside the JSON.`;

  try {
    const response = await aiService.generateCompletion(userPrompt, systemPrompt);

    // Parse AI response
    let parsed;
    try {
      // Try to extract JSON from potential markdown code blocks
      const jsonMatch = response.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, response];
      parsed = JSON.parse(jsonMatch[1]!.trim());
    } catch {
      return NextResponse.json({
        ...buildFallbackWorkflow(goal, constraints),
        warnings: ["AI response could not be parsed. Showing keyword-based suggestion instead."],
      });
    }

    // Enrich modules with position and port data from catalog
    const enrichedModules = (parsed.workflow?.modules || []).map(
      (m: any, i: number) => {
        const catalogMod = MODULE_CATALOG.find((c) => c.id === m.moduleId);
        if (!catalogMod) return null;
        return {
          moduleId: catalogMod.id,
          name: catalogMod.displayName,
          category: catalogMod.category,
          position: { x: 100 + i * 280, y: 200 },
          inputs: catalogMod.inputFormats.map((f) => f.toLowerCase()),
          outputs: catalogMod.outputFormats.map((f) => f.toLowerCase()),
          reasoning: m.reasoning || "",
        };
      }
    ).filter(Boolean);

    // Build connections with validation
    const enrichedConnections = (parsed.workflow?.connections || [])
      .map((c: any) => {
        const from = enrichedModules[c.fromIndex];
        const to = enrichedModules[c.toIndex];
        if (!from || !to) return null;
        const validation = validateModuleConnection(from.moduleId, to.moduleId);
        return {
          from: c.fromIndex,
          to: c.toIndex,
          dataType: c.dataType || validation.message.replace("Compatible via ", ""),
          learningAnnotation: validation.learningNote,
          valid: validation.valid,
        };
      })
      .filter(Boolean);

    return NextResponse.json({
      workflow: {
        name: parsed.workflow?.name || `Workflow for: ${goal.slice(0, 50)}`,
        description: parsed.workflow?.description || "",
        modules: enrichedModules,
        connections: enrichedConnections,
      },
      reasoning: parsed.reasoning || "",
      confidenceScore: parsed.confidenceScore || 0.75,
      warnings: parsed.warnings || [],
      keyInsight: parsed.keyInsight || "",
      socraticQuestion: parsed.socraticQuestion || null,
      source: "ai",
    });
  } catch (error: any) {
    // Fall back to keyword-based
    const fallback = buildFallbackWorkflow(goal, constraints);
    return NextResponse.json({
      ...fallback,
      warnings: [
        `AI request failed: ${error.message || "Unknown error"}. Showing keyword-based suggestion.`,
      ],
    });
  }
}

import { NextRequest } from "next/server";
import { getAuthenticatedUserId, unauthorizedResponse } from "@/lib/auth-helpers";
import { getUserAIService } from "@/lib/ai/get-user-ai-service";
import { selectPromptForContext, getSkillLevelInstruction, getLearnerTypeInstruction } from "@/lib/ai/learning-prompts";
import { getUserLearningContext } from "@/lib/ai/get-user-learning-context";

interface WorkspaceContext {
  currentStep: string;
  completedSteps: string[];
  pdbId: string;
  pdbLoaded: boolean;
  availableChains: string[];
  framework: string | null;
  hotspotRegions: {
    name: string;
    chain: string;
    range: string;
    selected: boolean;
  }[];
  candidateCount: number;
  cdrPreference: string | null;
  experimentId: string | null;
}

interface ChatHistoryMessage {
  role: "ai" | "user";
  text: string;
}

function buildSystemPrompt(context: WorkspaceContext, basePrompt: string, skillInstruction: string): string {
  const stepDescriptions: Record<string, string> = {
    pdb: "selecting a target protein structure (PDB)",
    framework: "choosing an antibody framework (IgG1, IgG4, or VHH nanobody)",
    hotspots: "identifying binding hotspot regions on the target antigen",
    config: "configuring design parameters (candidate count, CDR loop preferences)",
    pipeline: "reviewing the computational pipeline before launch",
    results: "reviewing experiment results",
  };

  const currentActivity = stepDescriptions[context.currentStep] || context.currentStep;

  let experimentContext = `\n## Current Experiment State\n`;
  experimentContext += `- **Current Step:** ${context.currentStep} — ${currentActivity}\n`;
  experimentContext += `- **Completed Steps:** ${context.completedSteps.length > 0 ? context.completedSteps.join(", ") : "none yet"}\n`;

  if (context.pdbLoaded) {
    experimentContext += `- **Target Structure:** PDB ${context.pdbId} (SARS-CoV-2 RBD–ACE2 Complex), chains: ${context.availableChains.join(", ")}\n`;
  }

  if (context.framework) {
    const fwNames: Record<string, string> = {
      igg1: "IgG1 — full-length antibody with effector functions (ADCC/CDC), ~150 kDa, ~21-day half-life",
      igg4: "IgG4 — reduced effector function, useful for blocking without immune-mediated killing",
      vhh: "VHH Nanobody — single-domain (~15 kDa), accesses cryptic epitopes, high stability",
    };
    experimentContext += `- **Antibody Framework:** ${fwNames[context.framework] || context.framework}\n`;
  }

  if (context.hotspotRegions.length > 0) {
    const selected = context.hotspotRegions.filter((r) => r.selected);
    const all = context.hotspotRegions.map((r) => `${r.name} (${r.chain}:${r.range})${r.selected ? " [SELECTED]" : ""}`);
    experimentContext += `- **Available Hotspot Regions:** ${all.join("; ")}\n`;
    if (selected.length > 0) {
      experimentContext += `- **Selected Hotspots:** ${selected.map((r) => r.name).join(", ")}\n`;
    }
  }

  if (context.candidateCount) {
    experimentContext += `- **Candidate Count:** ${context.candidateCount}\n`;
  }

  if (context.cdrPreference) {
    const cdrNames: Record<string, string> = {
      standard: "Standard CDR loops (10-15 residues)",
      extended: "Extended CDR-H3 (16-24 residues)",
      custom: "Custom CDR ranges",
    };
    experimentContext += `- **CDR Preference:** ${cdrNames[context.cdrPreference] || context.cdrPreference}\n`;
  }

  return `${basePrompt}

You are embedded in the Dayhoff platform's Guided Antibody Design workspace. The user is working through a step-by-step de novo antibody design experiment. Your role is to be a knowledgeable, approachable teaching assistant.

## Your Capabilities
- Answer questions about protein structures, antibody engineering, computational biology tools, and the design pipeline
- Explain concepts like PDB files, antibody frameworks (IgG subtypes, nanobodies), epitopes, CDR loops, and binding affinity
- Clarify what each pipeline module does: RFdiffusion (backbone generation), ProteinMPNN (sequence design), ESMFold (structure validation)
- Help the user understand WHY each step in the workflow matters
- Relate their specific choices (e.g., selected hotspots, framework) back to the underlying biology

## Important Guidelines
- Keep responses concise (2-4 paragraphs max) — this is a chat, not a lecture
- Use **bold** for key terms when introducing them
- When the user asks about their specific experiment, reference their actual selections from the context below
- If the user asks something unrelated to the experiment, gently redirect while still being helpful
- Encourage curiosity — suggest follow-up questions the user might find interesting
- Use markdown formatting for readability
${experimentContext}

## Pipeline Modules (for reference)
- **RFdiffusion-Antibody:** Generates diverse antibody backbone structures conditioned on target epitopes using diffusion models. Accuracy: ~75% for binder generation.
- **ProteinMPNN:** Designs optimal amino acid sequences for given backbones using message-passing neural networks. Recovery rate: ~95% sequence accuracy.
- **ESMFold:** Validates that designed sequences fold into intended structures using evolutionary scale modeling. Prediction accuracy: ~91% (pLDDT > 70).
- **Composite Scoring:** Ranks candidates by predicted binding affinity, structural quality (pLDDT), and sequence naturalness.${skillInstruction}`;
}

export async function POST(request: NextRequest) {
  const userId = await getAuthenticatedUserId();
  if (!userId) return unauthorizedResponse();

  const { question, context, history } = (await request.json()) as {
    question: string;
    context: WorkspaceContext;
    history: ChatHistoryMessage[];
  };

  if (!question) {
    return new Response(JSON.stringify({ error: "Question is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const [aiService, learningContext] = await Promise.all([
    getUserAIService(userId),
    getUserLearningContext(userId),
  ]);

  if (!aiService) {
    return new Response(
      JSON.stringify({
        answer:
          "I'd love to help with your question, but you haven't configured an API key yet. Go to **Settings → AI** to add your Anthropic API key, and I'll be able to answer your questions about the experiment in real time.",
        source: "fallback",
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  const basePrompt = selectPromptForContext(learningContext.learningMode, "workspace");
  const skillInstruction = getSkillLevelInstruction(learningContext.skillLevel);
  const learnerTypeInstruction = getLearnerTypeInstruction(learningContext.learnerType);
  const systemPrompt = buildSystemPrompt(context, basePrompt, skillInstruction + learnerTypeInstruction);

  // Build conversation with recent history for context (last 10 messages)
  const recentHistory = history.slice(-10);
  const conversationMessages = recentHistory.map((msg) => ({
    role: msg.role === "ai" ? ("assistant" as const) : ("user" as const),
    content: msg.text,
  }));
  // Add the current question
  conversationMessages.push({ role: "user" as const, content: question });

  try {
    const stream = aiService.generateCompletionStream(
      // We pass the full conversation as the prompt; the service wraps it in a single user message
      // But we need multi-turn, so let's use the stream directly with messages
      question,
      systemPrompt
    );

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            controller.enqueue(encoder.encode(chunk));
          }
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
        "Cache-Control": "no-cache",
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "AI request failed";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

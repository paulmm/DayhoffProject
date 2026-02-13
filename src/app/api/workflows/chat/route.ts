import { NextRequest } from "next/server";
import { getAuthenticatedUserId, unauthorizedResponse } from "@/lib/auth-helpers";
import { getUserAIService } from "@/lib/ai/get-user-ai-service";
import { selectPromptForContext, getSkillLevelInstruction, getLearnerTypeInstruction } from "@/lib/ai/learning-prompts";
import { getUserLearningContext } from "@/lib/ai/get-user-learning-context";
import { MODULE_CATALOG } from "@/data/modules-catalog";

interface WorkflowContext {
  name: string;
  description: string;
  modules: { moduleId: string; name: string; category: string }[];
  connections: {
    fromName: string;
    toName: string;
    dataType: string;
    learningAnnotation?: string;
  }[];
}

interface ChatHistoryMessage {
  role: "ai" | "user";
  text: string;
}

function buildSystemPrompt(context: WorkflowContext, basePrompt: string, skillInstruction: string): string {
  let workflowState = `\n## Current Workflow State\n`;
  workflowState += `- **Name:** ${context.name || "(unnamed)"}\n`;
  if (context.description) {
    workflowState += `- **Description:** ${context.description}\n`;
  }

  if (context.modules.length > 0) {
    workflowState += `- **Modules on canvas (${context.modules.length}):**\n`;
    for (const m of context.modules) {
      const catalogEntry = MODULE_CATALOG.find((c) => c.id === m.moduleId);
      workflowState += `  - ${m.name} (${m.category})`;
      if (catalogEntry) {
        workflowState += ` — ${catalogEntry.inputFormats.join("/")} → ${catalogEntry.outputFormats.join("/")}`;
      }
      workflowState += `\n`;
    }
  } else {
    workflowState += `- **Modules:** none yet (empty canvas)\n`;
  }

  if (context.connections.length > 0) {
    workflowState += `- **Connections (${context.connections.length}):**\n`;
    for (const c of context.connections) {
      workflowState += `  - ${c.fromName} → ${c.toName} (${c.dataType})`;
      if (c.learningAnnotation) {
        workflowState += ` — ${c.learningAnnotation.slice(0, 80)}...`;
      }
      workflowState += `\n`;
    }
  }

  const moduleReference = MODULE_CATALOG.map(
    (m) =>
      `- **${m.displayName}** (${m.id}): ${m.learning.conceptSummary.slice(0, 120)}. Input: ${m.inputFormats.join("/")}. Output: ${m.outputFormats.join("/")}.`
  ).join("\n");

  return `${basePrompt}

You are embedded in the Dayhoff platform's Workflow Builder. The user is assembling a computational biology pipeline by connecting modules on a visual canvas. Your role is to be a knowledgeable, approachable teaching assistant for pipeline design.

## Your Capabilities
- Suggest which modules to add next based on the user's research goal
- Explain what each module does: what it takes as input, what it produces, and why it matters
- Recommend optimal pipeline orderings and explain data flow between modules
- Flag potential issues: missing validation steps, incompatible formats, suboptimal orderings
- Explain concepts like structure prediction, inverse folding, docking, thermostability assessment
- Help the user understand trade-offs (e.g., ESMFold is faster but less accurate than AlphaFold2)

## Important Guidelines
- Keep responses concise (2-4 paragraphs max) — this is a chat sidebar, not a lecture
- Use **bold** for key terms and module names
- Reference the user's actual workflow state from the context below
- If the canvas is empty, suggest a starting point based on common workflows
- Suggest concrete next steps: "Try adding **ProteinMPNN** next to design sequences for those backbones"
- Use markdown formatting for readability
${workflowState}

## Available Modules
${moduleReference}${skillInstruction}`;
}

export async function POST(request: NextRequest) {
  const userId = await getAuthenticatedUserId();
  if (!userId) return unauthorizedResponse();

  const { question, context, history } = (await request.json()) as {
    question: string;
    context: WorkflowContext;
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
          "I'd love to help with your workflow, but you haven't configured an API key yet. Go to **Settings → AI** to add your Anthropic API key, and I'll be able to help you build and optimize your pipeline.",
        source: "fallback",
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  const basePrompt = selectPromptForContext(learningContext.learningMode, "workflow");
  const skillInstruction = getSkillLevelInstruction(learningContext.skillLevel);
  const learnerTypeInstruction = getLearnerTypeInstruction(learningContext.learnerType);
  const systemPrompt = buildSystemPrompt(context, basePrompt, skillInstruction + learnerTypeInstruction);

  try {
    const stream = aiService.generateCompletionStream(question, systemPrompt);

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

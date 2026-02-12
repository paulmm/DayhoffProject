import Anthropic from "@anthropic-ai/sdk";
import type { MessageCreateParamsNonStreaming } from "@anthropic-ai/sdk/resources/messages";

export interface AIServiceConfig {
  apiKey: string;
  modelId: string;
  temperature: number;
  maxTokens: number;
  topP: number;
  topK: number;
}

export class AnthropicAIService {
  private client: Anthropic;
  private modelId: string;
  private temperature: number;
  private maxTokens: number;
  private topP: number;
  private topK: number;

  constructor(config: AIServiceConfig) {
    this.client = new Anthropic({ apiKey: config.apiKey });
    this.modelId = config.modelId;
    this.temperature = config.temperature;
    this.maxTokens = config.maxTokens;
    this.topP = config.topP;
    this.topK = config.topK;
  }

  async generateCompletion(
    prompt: string,
    systemPrompt?: string
  ): Promise<string> {
    const params = this.buildParams(prompt, systemPrompt);
    const response = await this.client.messages.create(params);

    const textBlock = response.content.find((block) => block.type === "text");
    return textBlock ? textBlock.text : "";
  }

  async *generateCompletionStream(
    prompt: string,
    systemPrompt?: string
  ): AsyncGenerator<string> {
    const params = this.buildParams(prompt, systemPrompt);

    const stream = this.client.messages.stream({
      ...params,
      stream: true,
    });

    for await (const event of stream) {
      if (
        event.type === "content_block_delta" &&
        event.delta.type === "text_delta"
      ) {
        yield event.delta.text;
      }
    }
  }

  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      const response = await this.client.messages.create({
        model: this.modelId,
        max_tokens: 32,
        messages: [{ role: "user", content: "Say 'Connection successful' and nothing else." }],
      });

      const textBlock = response.content.find((block) => block.type === "text");
      return {
        success: true,
        message: textBlock?.text ?? "Connected",
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message ?? "Connection failed",
      };
    }
  }

  private buildParams(
    prompt: string,
    systemPrompt?: string
  ): MessageCreateParamsNonStreaming {
    // temperature and top_p cannot both be sent to Anthropic API.
    // If both are set, only send temperature.
    const params: MessageCreateParamsNonStreaming = {
      model: this.modelId,
      max_tokens: this.maxTokens,
      messages: [{ role: "user", content: prompt }],
    };

    if (systemPrompt) {
      params.system = systemPrompt;
    }

    if (this.temperature !== undefined && this.temperature > 0) {
      params.temperature = this.temperature;
    } else if (this.topP !== undefined && this.topP < 1) {
      params.top_p = this.topP;
    }

    if (this.topK > 0) {
      params.top_k = this.topK;
    }

    return params;
  }
}

import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { AnthropicAIService } from "./ai-service";

const ALGORITHM = "aes-256-cbc";
const IV_LENGTH = 16;

export function encrypt(text: string): string {
  const key = Buffer.from(process.env.ENCRYPTION_KEY!, "hex");
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return iv.toString("hex") + ":" + encrypted;
}

export function decrypt(text: string): string {
  const key = Buffer.from(process.env.ENCRYPTION_KEY!, "hex");
  const [ivHex, encryptedHex] = text.split(":");
  const iv = Buffer.from(ivHex, "hex");
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  let decrypted = decipher.update(encryptedHex, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

export async function getUserAIService(
  userId: string
): Promise<AnthropicAIService | null> {
  const settings = await prisma.aISettings.findUnique({
    where: { userId },
  });

  if (!settings?.anthropicApiKey) {
    return null;
  }

  const apiKey = decrypt(settings.anthropicApiKey);

  return new AnthropicAIService({
    apiKey,
    modelId: settings.modelId,
    temperature: settings.temperature,
    maxTokens: settings.maxTokens,
    topP: settings.topP,
    topK: settings.topK,
  });
}

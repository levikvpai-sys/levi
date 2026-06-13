import OpenAI from "openai";

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  organization: process.env.OPENAI_ORG_ID,
});

export const DEFAULT_MODEL = "gpt-4o";
export const FAST_MODEL = "gpt-4o-mini";

export interface CompletionOptions {
  model?: string;
  temperature?: number;
  max_tokens?: number;
  system?: string;
  stream?: boolean;
}

export async function generateCompletion(
  prompt: string,
  options: CompletionOptions = {}
): Promise<string> {
  const {
    model = DEFAULT_MODEL,
    temperature = 0.7,
    max_tokens = 2000,
    system,
  } = options;

  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [];

  if (system) {
    messages.push({ role: "system", content: system });
  }

  messages.push({ role: "user", content: prompt });

  const response = await openai.chat.completions.create({
    model,
    temperature,
    max_tokens,
    messages,
  });

  return response.choices[0]?.message?.content || "";
}

export async function generateStructuredOutput<T>(
  prompt: string,
  options: CompletionOptions = {}
): Promise<T> {
  const content = await generateCompletion(prompt, {
    ...options,
    temperature: options.temperature ?? 0.3,
  });

  // Try to parse JSON from the response
  try {
    // Look for JSON in the response
    const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[1]) as T;
    }
    // Try direct parse
    return JSON.parse(content) as T;
  } catch {
    // Return as-is if not JSON
    return content as unknown as T;
  }
}

export async function streamCompletion(
  prompt: string,
  options: CompletionOptions = {}
): Promise<ReadableStream> {
  const {
    model = DEFAULT_MODEL,
    temperature = 0.7,
    max_tokens = 2000,
    system,
  } = options;

  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [];

  if (system) {
    messages.push({ role: "system", content: system });
  }

  messages.push({ role: "user", content: prompt });

  const stream = await openai.chat.completions.create({
    model,
    temperature,
    max_tokens,
    messages,
    stream: true,
  });

  return new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        const text = chunk.choices[0]?.delta?.content || "";
        if (text) {
          controller.enqueue(new TextEncoder().encode(text));
        }
      }
      controller.close();
    },
  });
}

export function createSystemPrompt(parts: string[]): string {
  return parts.filter(Boolean).join("\n\n");
}

export function estimateTokens(text: string): number {
  // Rough estimate: ~4 characters per token
  return Math.ceil(text.length / 4);
}

import OpenAI from "openai";

let _client: OpenAI | null = null;

function getClient(): OpenAI {
  if (!_client) {
    _client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      organization: process.env.OPENAI_ORG_ID,
    });
  }
  return _client;
}

export const openai = new Proxy({} as OpenAI, {
  get(_target, prop) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (getClient() as any)[prop];
  },
});

export const DEFAULT_MODEL = "gpt-4o";
export const FAST_MODEL = "gpt-4o-mini";

export interface CompletionOptions {
  model?: string;
  temperature?: number;
  max_tokens?: number;
  system?: string;
}

export async function generateCompletion(
  prompt: string,
  options: CompletionOptions = {}
): Promise<string> {
  const { model = DEFAULT_MODEL, temperature = 0.7, max_tokens = 2000, system } = options;

  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [];
  if (system) messages.push({ role: "system", content: system });
  messages.push({ role: "user", content: prompt });

  const response = await openai.chat.completions.create({
    model,
    temperature,
    max_tokens,
    messages,
  });

  return response.choices[0]?.message?.content ?? "";
}

// Forces valid JSON every time using OpenAI's JSON mode
export async function generateStructuredOutput<T>(
  prompt: string,
  options: CompletionOptions = {}
): Promise<T> {
  const { model = DEFAULT_MODEL, temperature = 0.3, max_tokens = 3000, system } = options;

  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [];
  if (system) {
    messages.push({
      role: "system",
      content: system + "\n\nYou MUST respond with valid JSON only. No markdown, no explanation, just the JSON object.",
    });
  }
  messages.push({ role: "user", content: prompt + "\n\nRespond with valid JSON only." });

  const response = await openai.chat.completions.create({
    model,
    temperature,
    max_tokens,
    messages,
    response_format: { type: "json_object" },
  });

  const content = response.choices[0]?.message?.content ?? "{}";
  return JSON.parse(content) as T;
}

export function createSystemPrompt(parts: string[]): string {
  return parts.filter(Boolean).join("\n\n");
}

import Anthropic from "@anthropic-ai/sdk";

let _client: Anthropic | null = null;

function getClient(): Anthropic {
  if (!_client) {
    _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return _client;
}

// Model tiers
export const CLAUDE_OPUS   = "claude-opus-4-8";
export const CLAUDE_SONNET = "claude-sonnet-4-6";
export const CLAUDE_HAIKU  = "claude-haiku-4-5-20251001";

export interface ClaudeOptions {
  model?: string;
  temperature?: number;
  max_tokens?: number;
  system?: string;
}

function stripJsonFences(text: string): string {
  return text
    .replace(/^```json\s*\n?/i, "")
    .replace(/^```\s*\n?/, "")
    .replace(/\n?```\s*$/, "")
    .trim();
}

export async function claudeCompletion(
  prompt: string,
  options: ClaudeOptions = {}
): Promise<string> {
  const { model = CLAUDE_SONNET, max_tokens = 2000, system } = options;

  const response = await getClient().messages.create({
    model,
    max_tokens,
    ...(system ? { system } : {}),
    messages: [{ role: "user", content: prompt }],
  });

  const block = response.content[0];
  return block.type === "text" ? block.text : "";
}

export async function claudeStructured<T>(
  prompt: string,
  options: ClaudeOptions = {}
): Promise<T> {
  const { model = CLAUDE_SONNET, max_tokens = 3000, system } = options;

  const systemWithJson = (system ?? "")
    + "\n\nCRITICAL: Your response must be valid JSON only. No markdown code fences, no explanation, no text before or after — just the raw JSON object or array.";

  const response = await getClient().messages.create({
    model,
    max_tokens,
    system: systemWithJson,
    messages: [{
      role: "user",
      content: prompt + "\n\nRemember: respond with raw JSON only — no markdown, no text.",
    }],
  });

  const block = response.content[0];
  if (block.type !== "text") throw new Error("Unexpected non-text response from Claude");

  const clean = stripJsonFences(block.text);
  try {
    return JSON.parse(clean) as T;
  } catch {
    // If parsing fails, try to extract JSON from the response
    const jsonMatch = clean.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]) as T;
    throw new Error(`Claude returned invalid JSON: ${clean.slice(0, 200)}`);
  }
}

export function createSystemPrompt(parts: string[]): string {
  return parts.filter(Boolean).join("\n\n");
}

import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export const maxDuration = 60;

export async function GET() {
  const rawKey = process.env.ANTHROPIC_API_KEY ?? "";
  const apiKey = rawKey.trim();

  if (!apiKey) {
    return NextResponse.json(
      { ok: false, stage: "env", error: "ANTHROPIC_API_KEY is not set" },
      { status: 500 }
    );
  }

  try {
    const client = new Anthropic({ apiKey });
    const response = await client.messages.create({
      model: "claude-3-5-sonnet-latest",
      max_tokens: 16,
      messages: [{ role: "user", content: "Say OK" }],
    });

    const block = response.content[0];
    return NextResponse.json({
      ok: true,
      model: response.model,
      reply: block.type === "text" ? block.text : null,
      raw_length: rawKey.length,
      trimmed_length: apiKey.length,
      had_whitespace: rawKey.length !== apiKey.length,
    });
  } catch (error) {
    const err = error as {
      status?: number;
      name?: string;
      message?: string;
      error?: unknown;
      headers?: unknown;
    };
    return NextResponse.json(
      {
        ok: false,
        stage: "anthropic_request",
        status: err.status ?? null,
        name: err.name ?? null,
        message: err.message ?? String(error),
        error: err.error ?? null,
        raw_length: rawKey.length,
        trimmed_length: apiKey.length,
        had_whitespace: rawKey.length !== apiKey.length,
      },
      { status: 500 }
    );
  }
}

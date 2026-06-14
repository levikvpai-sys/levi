import { NextRequest, NextResponse } from "next/server";
import { promptDirector } from "@/agents/prompt-director";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { product, color, concept, style } = body;

    if (!product || !concept) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: product, concept" },
        { status: 400 }
      );
    }

    const shotPrompt = await promptDirector.buildSingleImagePrompt(
      product,
      color || "vibrant",
      concept,
      style || "LIFESTYLE_BEACH"
    );

    return NextResponse.json({ success: true, data: shotPrompt });
  } catch (error) {
    console.error("Prompt Director API error:", error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}

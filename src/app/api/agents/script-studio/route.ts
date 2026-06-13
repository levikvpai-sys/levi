import { NextRequest, NextResponse } from "next/server";
import { scriptStudio } from "@/agents/script-studio";
import type { Platform } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { product, platform, style, objective, tone, keyMessage, targetAudience, durationSeconds } = body;

    if (!product || !platform || !style || !objective) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: product, platform, style, objective" },
        { status: 400 }
      );
    }

    const script = await scriptStudio.writeScript({
      product,
      platform: platform as Platform,
      style,
      objective,
      tone,
      key_message: keyMessage,
      target_audience: targetAudience,
      duration_seconds: durationSeconds,
    });

    return NextResponse.json({ success: true, data: script });
  } catch (error) {
    console.error("Script Studio API error:", error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}

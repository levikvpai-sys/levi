import { NextRequest, NextResponse } from "next/server";
import { generateImage } from "@/lib/openai";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const { prompt, size } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { success: false, error: "Missing required field: prompt" },
        { status: 400 }
      );
    }

    const imageUrl = await generateImage(
      prompt,
      size ?? "1792x1024"
    );

    return NextResponse.json({ success: true, url: imageUrl });
  } catch (error) {
    console.error("DALL-E 3 generate-image error:", error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}

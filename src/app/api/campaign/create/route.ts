import { NextRequest, NextResponse } from "next/server";
import { orchestrator } from "@/agents";
import type { Platform } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, product, productColor, platforms, style, objective, tone, keyMessage, targetAudience } = body;

    if (!title || !product || !platforms || !style || !objective) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const result = await orchestrator.createCampaign({
      title,
      product,
      productColor,
      platforms: platforms as Platform[],
      style,
      objective,
      tone,
      keyMessage,
      targetAudience,
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("Campaign create API error:", error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}

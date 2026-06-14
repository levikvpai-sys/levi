import { NextRequest, NextResponse } from "next/server";
import { socialAgent } from "@/agents/social-agent";
import type { Platform } from "@/types";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { product, platform, visualDescription, keyMessage, campaignTone, includePrice } = body;

    if (!product || !platform || !visualDescription) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: product, platform, visualDescription" },
        { status: 400 }
      );
    }

    const caption = await socialAgent.writeCaption({
      product,
      platform: platform as Platform,
      visual_description: visualDescription,
      key_message: keyMessage,
      campaign_tone: campaignTone,
      include_price: includePrice,
    });

    return NextResponse.json({ success: true, data: caption });
  } catch (error) {
    console.error("Social Agent API error:", error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}

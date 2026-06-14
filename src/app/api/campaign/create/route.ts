import { NextRequest, NextResponse } from "next/server";
import { scriptStudio, type ScriptBrief } from "@/agents/script-studio";
import { socialAgent } from "@/agents/social-agent";
import type { Platform } from "@/types";

export const maxDuration = 60;

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

    const errors: string[] = [];

    // Script Studio: write one script for the first platform (fastest path)
    const primaryPlatform = (platforms as Platform[])[0];
    const scriptBrief: ScriptBrief = {
      product,
      platform: primaryPlatform,
      style,
      objective,
      tone,
      key_message: keyMessage,
      target_audience: targetAudience,
    };

    const [script, captions] = await Promise.all([
      scriptStudio.writeScript(scriptBrief).catch((e: unknown) => {
        errors.push(`Script Studio: ${String(e)}`);
        return null;
      }),
      socialAgent.buildPostPackage(product, objective, platforms as Platform[]).catch((e: unknown) => {
        errors.push(`Social Agent: ${String(e)}`);
        return null;
      }),
    ]);

    const status = script && captions ? "success" : script || captions ? "partial" : "failed";

    return NextResponse.json({
      success: status !== "failed",
      data: { title, product, productColor, platforms, script, captions, status, errors },
    });
  } catch (error) {
    console.error("Campaign create API error:", error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}

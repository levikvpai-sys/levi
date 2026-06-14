import { NextRequest, NextResponse } from "next/server";
import { scriptStudio, type ScriptBrief } from "@/agents/script-studio";
import { socialAgent } from "@/agents/social-agent";
import type { Platform } from "@/types";

export const maxDuration = 60;

function fail(error: string, data?: unknown) {
  console.error("[campaign/create]", error);
  return NextResponse.json({ success: false, error, data: data ?? null }, { status: 500 });
}

async function saveCampaignToDb(data: {
  title: string;
  product: string;
  productColor?: string;
  platforms: string[];
  style: string;
  objective: string;
  script: Record<string, unknown> | null;
  captions: Record<string, unknown> | null;
}) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return;
  try {
    const { supabaseAdmin } = await import("@/lib/supabase");
    const { data: campaign } = await supabaseAdmin
      .from("campaigns")
      .insert({
        name: data.title,
        objective: data.objective,
        platform: data.platforms,
        content_type: ["video_script", "social_post"],
        brief: data.objective,
        product: data.product,
        product_color: data.productColor,
        style: data.style,
        status: "draft",
      })
      .select()
      .single();

    if (!campaign) return;

    if (data.script) {
      await supabaseAdmin.from("campaign_outputs").insert({
        campaign_id: campaign.id,
        agent_type: "script_studio",
        content_type: "video_script",
        platform: data.platforms[0],
        content: JSON.stringify(data.script),
        metadata: data.script,
        status: "draft",
      });
    }

    if (data.captions && Array.isArray((data.captions as { posts?: unknown[] }).posts)) {
      const posts = (data.captions as { posts: { platform: string; full_post: string }[] }).posts;
      await Promise.all(
        posts.map((post) =>
          supabaseAdmin.from("campaign_outputs").insert({
            campaign_id: campaign.id,
            agent_type: "social_agent",
            content_type: "social_post",
            platform: post.platform,
            content: post.full_post,
            metadata: post,
            status: "draft",
          })
        )
      );
    }
  } catch {
    // Silent fail — Supabase is optional
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      product,
      productColor,
      platforms,
      style,
      objective,
      tone,
      keyMessage,
      targetAudience,
    } = body;

    if (!title || !product || !platforms?.length || !style || !objective) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: title, product, platforms, style, objective", data: null },
        { status: 400 }
      );
    }

    const agentErrors: string[] = [];
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
        const msg = `Script Studio: ${e instanceof Error ? e.message : String(e)}`;
        agentErrors.push(msg);
        console.error("[campaign/create]", msg);
        return null;
      }),
      socialAgent
        .buildPostPackage(product, objective, platforms as Platform[])
        .catch((e: unknown) => {
          const msg = `Social Agent: ${e instanceof Error ? e.message : String(e)}`;
          agentErrors.push(msg);
          console.error("[campaign/create]", msg);
          return null;
        }),
    ]);

    const status =
      script && captions ? "success" : script || captions ? "partial" : "failed";

    const data = { title, product, productColor, platforms, script, captions, status, errors: agentErrors };

    if (status === "failed") {
      return fail(
        agentErrors.length > 0
          ? agentErrors.join(" | ")
          : "Both agents failed with no error details — check ANTHROPIC_API_KEY in Vercel environment variables.",
        data
      );
    }

    // Fire and forget — never blocks the API response
    saveCampaignToDb({
      title,
      product,
      productColor,
      platforms,
      style,
      objective,
      script: script as Record<string, unknown> | null,
      captions: captions as Record<string, unknown> | null,
    });

    return NextResponse.json({ success: true, error: null, data });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return fail(msg);
  }
}

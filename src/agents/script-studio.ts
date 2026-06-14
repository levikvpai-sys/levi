import { claudeStructured, claudeCompletion, createSystemPrompt, CLAUDE_OPUS } from "@/lib/claude";
import { BRAND_VOICE_TEXT } from "@/brand/brand-bible";
import { PRODUCT_RULES_TEXT } from "@/brand/product-bible";
import type { Platform } from "@/types";

export interface ScriptScene {
  scene_number: number;
  shot_type: string;
  duration_seconds: number;
  visual: string;
  audio: string;
  on_screen_text?: string;
  notes?: string;
}

export interface Script {
  title: string;
  style: string;
  platform: string;
  total_duration_seconds: number;
  hook: string;
  concept: string;
  emotional_arc: string;
  beat_sheet: string[];
  scenes: ScriptScene[];
  dialogue?: string;
  voiceover?: string;
  music_direction: string;
  visual_intention: string;
  cta: string;
  hashtags?: string[];
}

export interface ScriptBrief {
  product: string;
  platform: Platform;
  style: string;
  objective: string;
  tone?: string;
  key_message?: string;
  target_audience?: string;
  duration_seconds?: number;
}

const SCRIPT_SYSTEM = createSystemPrompt([
  `You are the Hollywood Script Director AI for Hippo Float — a seasoned commercial director who has worked on campaigns for Apple, Nike, and luxury travel brands.

You write scripts with CINEMATIC PRECISION. Every word is intentional. Every shot serves the story. Every second earns its place.

${BRAND_VOICE_TEXT}

${PRODUCT_RULES_TEXT}

## THE 4 HIPPO FLOAT PRODUCTS:
- **Joy**: Luxury recliner lounger — like floating in a first-class seat. Campaign: "Float Your Way to Paradise"
- **Chill**: U-shape social ring float — social anchored fun. Campaign: "Float Together. Stay in Place."
- **Fun**: Cylindrical torpedo tube — energetic, fun, colorful. Campaign: "Have Some Fun"
- **Vibes**: Flat mat with texture holes — bold color, pure comfort. Campaign: "Summer in Full Bloom"

## THE CORE INNOVATION TO HIGHLIGHT:
The 2-in-1 anchor bag system — a waterproof bag that anchors the float so you drift nowhere.
This is what makes Hippo Float different. When you show it:
- Anchor bag is UNDERWATER (never surface)
- Blue rope visible connecting float to anchor
- Yellow buoy marker at water surface
- This is ENGINEERING + LIFESTYLE — not a gimmick

## YOUR SCRIPT FRAMEWORK:

### For TikTok/Reels (15-30s):
- Hook: 1-3 seconds — instant visual grab or provocative statement
- Problem/Contrast: 3-8 seconds — establish the familiar frustration
- Reveal: 8-20 seconds — the Hippo Float solution in action
- Payoff: 20-28 seconds — emotional reward, aspiration
- CTA: last 2-3 seconds

### For Brand Films (60-180s):
- Act 1 (20%): World-building — establish the setting and desire
- Act 2 (60%): Journey — conflict, discovery, transformation
- Act 3 (20%): Resolution — the feeling, the brand, the promise

### For Product Demo (20-45s):
- Hook: Show the problem visually (float drifting away)
- Demo: Show the anchor system working
- Lifestyle payoff: Beautiful person, beautiful water, not moving

## SCRIPT OUTPUT FORMAT:
Return a complete JSON Script object with all fields filled in.`,
]);

export class ScriptStudioAgent {
  async writeScript(brief: ScriptBrief): Promise<Script> {
    const duration = brief.duration_seconds || this.getDefaultDuration(brief.platform);

    const prompt = `Write a complete ${brief.style} commercial script for Hippo Float.

PRODUCT: ${brief.product}
PLATFORM: ${brief.platform}
STYLE: ${brief.style}
OBJECTIVE: ${brief.objective}
TONE: ${brief.tone || "premium luxury with joy"}
KEY MESSAGE: ${brief.key_message || "Stay where you float — drift-free luxury"}
TARGET AUDIENCE: ${brief.target_audience || "25-40, lifestyle-focused, beach lovers"}
DURATION: ${duration} seconds

Write a COMPLETE script with:
- Compelling hook that stops the scroll
- Clear emotional arc
- Beat-by-beat scene breakdown
- Specific visual direction for each scene
- Music direction
- CTA

Return as JSON Script object.`;

    return await claudeStructured<Script>(prompt, {
      model: CLAUDE_OPUS,
      system: SCRIPT_SYSTEM,
      temperature: 0.8,
      max_tokens: 2500,
    });
  }

  async writeHook(product: string, platform: Platform, style: string): Promise<string[]> {
    const prompt = `Write 5 different OPENING HOOKS for a ${product} Hippo Float ${style} video on ${platform}.

Each hook must:
- Stop scrolling in the FIRST SECOND
- Create immediate curiosity or FOMO
- Be visually describable (what the camera shows)
- Not sound like an ad (feel authentic)

Format as JSON array: [{"text": "hook text", "visual": "what camera shows", "why_it_works": "explanation"}]`;

    return await claudeStructured<string[]>(prompt, {
      system: SCRIPT_SYSTEM,
      temperature: 0.9,
      max_tokens: 1000,
    });
  }

  async writeProductDemoScript(product: string): Promise<Script> {
    return await this.writeScript({
      product,
      platform: "instagram",
      style: "PRODUCT_DEMO",
      objective: "Show the 2-in-1 anchor bag system in action and demonstrate drift-free luxury",
      key_message: "The bag IS the anchor — genius engineering meets beach lifestyle",
      duration_seconds: 30,
    });
  }

  async writeViralTikTok(product: string, trend?: string): Promise<Script> {
    return await this.writeScript({
      product,
      platform: "tiktok",
      style: "TIKTOK_VIRAL",
      objective: "Create a hook-driven viral moment that showcases the float without feeling like an ad",
      key_message: trend
        ? `Use trend: ${trend}`
        : "POV: you discovered the float that never drifts",
      duration_seconds: 25,
    });
  }

  async improvScript(script: Script, feedback: string): Promise<Script> {
    const prompt = `Improve this Hippo Float script based on the feedback:

CURRENT SCRIPT: ${JSON.stringify(script, null, 2)}

FEEDBACK: ${feedback}

Rewrite the script incorporating the feedback while maintaining brand standards. Return complete revised Script JSON.`;

    return await claudeStructured<Script>(prompt, {
      model: CLAUDE_OPUS,
      system: SCRIPT_SYSTEM,
      temperature: 0.7,
      max_tokens: 2500,
    });
  }

  private getDefaultDuration(platform: Platform): number {
    const durations: Partial<Record<Platform, number>> = {
      tiktok: 25,
      instagram: 30,
      youtube: 60,
      facebook: 30,
    };
    return durations[platform] || 30;
  }
}

export const scriptStudio = new ScriptStudioAgent();
export default scriptStudio;

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
  `You are the Script Director AI for Smart Medical Ventures (SMV) — a seasoned commercial director who makes premium, credible educational brand films for clinical and professional audiences.

You write scripts with CINEMATIC PRECISION. Every word is intentional. Every shot serves the story. Every second earns its place — and every claim stays compliant.

${BRAND_VOICE_TEXT}

${PRODUCT_RULES_TEXT}

## THE SMV LAUNCH PATHS:
- **Standard**: Low-entry subscription launch path. Line: "Launch the school. Build the pipeline. Keep the tuition."
- **Premium**: Expanded guided implementation across compliance, marketing, enrollment, operations.
- **California Premium**: Premium framework tuned for California requirements (State requirements vary).
- **Clinical Ready(TM)**: Demonstrated-readiness curriculum model — performance gates, skill validation, externship readiness.

## THE CORE STORY TO HIGHLIGHT:
The SMV launch framework — a practice-based dental assisting school a practice can actually launch and operate.
This is what makes SMV different. When you show it:
- Real dental operatory, adult learners in navy scrubs, instructor-led skill checks
- Staffing pipeline + tuition ownership (school keeps tuition; no SMV royalties or per-student fees)
- Clinical Ready(TM) readiness, not "perfect assistants"
- Compliance-minded: "State requirements vary", "Practice verification required", never guarantee licensure

## YOUR SCRIPT FRAMEWORK:

### For TikTok/Reels (15-30s):
- Hook: 1-3 seconds — clear, credible grab (e.g. the assistant-staffing reality)
- Problem/Contrast: 3-8 seconds — the familiar staffing / training gap
- Reveal: 8-20 seconds — the SMV launch framework in action
- Payoff: 20-28 seconds — the pipeline, the tuition, the structure
- CTA: last 2-3 seconds

### For Brand Films (60-180s):
- Act 1 (20%): World-building — the practice and its staffing challenge
- Act 2 (60%): Journey — launching the school, Clinical Ready(TM) in action
- Act 3 (20%): Resolution — the pipeline, the tuition, the brand promise

### For Program Demo (20-45s):
- Hook: Show the problem (the assistant shortage / turnover)
- Demo: Show the launch framework and Clinical Ready(TM) readiness working
- Payoff: A trained, validated assistant in a real operatory; keep it compliant

## SCRIPT OUTPUT FORMAT:
Return a complete JSON Script object with all fields filled in.`,
]);

export class ScriptStudioAgent {
  async writeScript(brief: ScriptBrief): Promise<Script> {
    const duration = brief.duration_seconds || this.getDefaultDuration(brief.platform);

    const prompt = `Write a complete ${brief.style} commercial script for Smart Medical Ventures (SMV).

PROGRAM: ${brief.product}
PLATFORM: ${brief.platform}
STYLE: ${brief.style}
OBJECTIVE: ${brief.objective}
TONE: ${brief.tone || "calm, confident, premium, compliance-minded"}
KEY MESSAGE: ${brief.key_message || "Launch the school. Build the pipeline. Keep the tuition."}
TARGET AUDIENCE: ${brief.target_audience || "dentists, practice owners, DSOs, and school operators"}
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
    const prompt = `Write 5 different OPENING HOOKS for a ${product} Smart Medical Ventures (SMV) ${style} video on ${platform}.

Each hook must:
- Grab attention in the FIRST SECOND with a clear, credible line
- Create immediate curiosity (staffing pipeline, tuition ownership, school launch)
- Be visually describable (what the camera shows in a real practice)
- Feel authentic and compliance-minded, never hype or a licensure guarantee

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
      objective: "Show the SMV launch framework and Clinical Ready(TM) readiness in action inside a real practice",
      key_message: "A practice-based dental assisting school you can actually launch — build the pipeline, keep the tuition",
      duration_seconds: 30,
    });
  }

  async writeViralTikTok(product: string, trend?: string): Promise<Script> {
    return await this.writeScript({
      product,
      platform: "tiktok",
      style: "TIKTOK_VIRAL",
      objective: "Create a clear, hook-driven moment that shows how a practice can launch its own dental assisting school",
      key_message: trend
        ? `Use trend: ${trend}`
        : "POV: your dental practice runs its own assisting school and keeps the tuition",
      duration_seconds: 25,
    });
  }

  async improvScript(script: Script, feedback: string): Promise<Script> {
    const prompt = `Improve this Smart Medical Ventures (SMV) script based on the feedback:

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

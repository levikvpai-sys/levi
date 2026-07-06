import { generateCompletion, generateStructuredOutput, createSystemPrompt } from "@/lib/openai";
import { BRAND_VOICE_TEXT } from "@/brand/brand-bible";

export interface BrandScore {
  score: number;
  tier: "premium" | "acceptable" | "needs_work" | "reject";
  passed: boolean;
  strengths: string[];
  weaknesses: string[];
  tone_alignment: number;
  visual_alignment: number;
  recommendations: string[];
  revised_version?: string;
}

export interface BrandBrief {
  concept: string;
  platform?: string;
  content_type?: string;
  target_emotion?: string;
}

const BRAND_DIRECTOR_SYSTEM = createSystemPrompt([
  `You are the Brand Director AI for Smart Medical Ventures (SMV) — the creative guardian of brand excellence.

Your role: Ensure every piece of content looks, sounds, and feels like a PREMIUM, calm-and-confident dental-education launch brand — clear, structured, and clinically informed.

${BRAND_VOICE_TEXT}

## SMV LAUNCH PATHS (Launch Programs 2026):
- **Standard**: Low-entry subscription launch path — "Launch the school. Build the pipeline. Keep the tuition."
- **Premium**: Expanded guided implementation across compliance, marketing, enrollment, operations
- **California Premium**: Premium framework tuned for California requirements (State requirements vary)
- **Clinical Ready(TM)**: Demonstrated-readiness curriculum model — performance gates, skill validation, externship readiness

## BRAND PERSONALITY:
Think: "A trusted clinical educator and launch partner" — authoritative, calm, confident, practical.
Not: Discount store. Not: Get-rich-quick pitch. Not: Side-hustle course.

## THE SMV VIBE:
- "Launch the school. Build the pipeline. Keep the tuition." — structure, ownership, staffing pipeline
- Practice-based dental assisting school — real operatories, real training, real readiness
- Subjects are adult learners and instructors in navy scrubs — competent and focused, not staged
- Visuals are clean, clinical, premium — navy/violet-magenta/gold, white text on dark panels
- Compliance-minded always: "State requirements vary", "Practice verification required", never guarantee licensure

## SCORING CRITERIA:
- 9-10: Premium — this could represent SMV on its official channel
- 7-8: Acceptable — good but needs refinement
- 5-6: Needs work — on-brand in direction but execution is off
- 1-4: Reject — wrong tone, compliance risk, or damages brand perception

## OUTPUT FORMAT:
Always return JSON:
{
  "score": number 1-10,
  "tier": "premium" | "acceptable" | "needs_work" | "reject",
  "passed": boolean (score >= 7),
  "strengths": ["what works"],
  "weaknesses": ["what doesn't"],
  "tone_alignment": number 1-10,
  "visual_alignment": number 1-10,
  "recommendations": ["specific improvements"],
  "revised_version": "improved version if score < 8"
}`,
]);

export class BrandDirectorAgent {
  async evaluateCreative(content: string, contentType: string): Promise<BrandScore> {
    const prompt = `Evaluate this ${contentType} for Smart Medical Ventures (SMV) brand alignment:

CONTENT: ${content}

Score it ruthlessly against the brand standards. Return JSON brand score.`;

    return await generateStructuredOutput<BrandScore>(prompt, {
      system: BRAND_DIRECTOR_SYSTEM,
      temperature: 0.3,
      max_tokens: 800,
    });
  }

  async refineBrief(brief: BrandBrief): Promise<string> {
    const prompt = `Elevate this creative brief to premium Smart Medical Ventures (SMV) brand standards:

ORIGINAL BRIEF: ${brief.concept}
PLATFORM: ${brief.platform || "general"}
CONTENT TYPE: ${brief.content_type || "general"}
TARGET EMOTION: ${brief.target_emotion || "calm confidence and credibility"}

Rewrite the brief to be more specific, more premium, more structured. Add specific visual direction (real operatories, navy scrubs, SMV navy/gold treatment), mood, correct SMV terminology, and keep it compliance-minded (no licensure guarantees). Return ONLY the refined brief text.`;

    return await generateCompletion(prompt, {
      system: BRAND_DIRECTOR_SYSTEM,
      temperature: 0.6,
      max_tokens: 600,
    });
  }

  async approveCaption(caption: string, platform: string): Promise<BrandScore> {
    return await this.evaluateCreative(
      `Platform: ${platform}\nCaption: ${caption}`,
      "social media caption"
    );
  }

  async generateBrandedTaglines(product: string, count: number = 5): Promise<string[]> {
    const prompt = `Generate ${count} premium on-brand taglines for ${product} by Smart Medical Ventures (SMV).

Each tagline must:
- Sound like a premium clinical-education launch partner, not a get-rich-quick pitch
- Reference the launch framework, staffing pipeline, tuition ownership, or Clinical Ready(TM) readiness subtly or directly
- Be calm, confident, and outcome-focused
- Be under 10 words
- Never guarantee licensure or use passive-income / side-hustle language

Return as JSON array of strings: ["tagline1", "tagline2", ...]`;

    const result = await generateStructuredOutput<string[]>(prompt, {
      system: BRAND_DIRECTOR_SYSTEM,
      temperature: 0.8,
      max_tokens: 400,
    });

    return Array.isArray(result) ? result : [];
  }
}

export const brandDirector = new BrandDirectorAgent();
export default brandDirector;

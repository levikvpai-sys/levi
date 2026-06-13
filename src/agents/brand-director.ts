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
  `You are the Brand Director AI for Hippo Float — the creative guardian of brand excellence.

Your role: Ensure every piece of content looks, sounds, and feels like a PREMIUM luxury beach lifestyle brand.

${BRAND_VOICE_TEXT}

## REAL HIPPO FLOAT PRODUCTS (Summer Collection 2026):
- **Joy**: Luxury recliner lounger — aspirational, "Float Your Way to Paradise", $89.99
- **Chill**: U-ring social float — fun luxury, "Float Together. Stay in Place.", $69.99
- **Fun**: Cylindrical tube — energetic, "Have Some Fun", $49.99
- **Vibes**: Flat mat — bold color, "Summer in Full Bloom", $69.99

## BRAND PERSONALITY:
Think: "If Saint Tropez had a poolside brand" — confident, aspirational, joyful luxury.
Not: Discount store. Not: Generic Amazon listing. Not: Kids' toy advertising.

## THE HIPPO FLOAT VIBE (from actual ad campaigns):
- "Stay Where You Float" — effortless anchoring, effortless luxury
- "Drift-Free Float Collection" — engineering meets lifestyle
- Models are attractive, diverse, genuinely joyful — not posed, just living their best life
- Water is always crystal clear turquoise — never murky, never dark
- Every shot could be a travel magazine cover

## SCORING CRITERIA:
- 9-10: Premium — this could air on a luxury brand's official channel
- 7-8: Acceptable — good but needs refinement
- 5-6: Needs work — on-brand in direction but execution is off
- 1-4: Reject — wrong tone, wrong look, or damages brand perception

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
    const prompt = `Evaluate this ${contentType} for Hippo Float brand alignment:

CONTENT: ${content}

Score it ruthlessly against the brand standards. Return JSON brand score.`;

    return await generateStructuredOutput<BrandScore>(prompt, {
      system: BRAND_DIRECTOR_SYSTEM,
      temperature: 0.3,
      max_tokens: 800,
    });
  }

  async refineBrief(brief: BrandBrief): Promise<string> {
    const prompt = `Elevate this creative brief to premium Hippo Float brand standards:

ORIGINAL BRIEF: ${brief.concept}
PLATFORM: ${brief.platform || "general"}
CONTENT TYPE: ${brief.content_type || "general"}
TARGET EMOTION: ${brief.target_emotion || "aspirational joy"}

Rewrite the brief to be more specific, more premium, more cinematic. Add specific visual direction, mood, and brand-appropriate language. Return ONLY the refined brief text.`;

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
    const prompt = `Generate ${count} premium on-brand taglines for ${product} by Hippo Float.

Each tagline must:
- Sound like a luxury brand, not a discount store
- Reference the drift-free anchor innovation subtly or directly
- Create FOMO and aspiration
- Be under 8 words
- Feel like it could headline a Condé Nast Traveler ad

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

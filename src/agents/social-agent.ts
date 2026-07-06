import { claudeStructured, createSystemPrompt, CLAUDE_HAIKU } from "@/lib/claude";
import { BRAND_VOICE_TEXT } from "@/brand/brand-bible";
import type { Platform } from "@/types";

export interface Caption {
  platform: Platform;
  text: string;
  hashtags: string[];
  cta: string;
  full_post: string;
  character_count: number;
  hook_line: string;
  emoji_usage: string[];
}

export interface PostPackage {
  campaign_title: string;
  product: string;
  posts: Caption[];
  story_text?: string;
  story_poll?: { question: string; options: [string, string] };
  thumbnail_text?: string;
  youtube_title?: string;
  youtube_description?: string;
}

export interface ContentBrief {
  product: string;
  platform: Platform;
  visual_description: string;
  key_message?: string;
  campaign_tone?: string;
  include_price?: boolean;
  include_link?: boolean;
}

const SOCIAL_AGENT_SYSTEM = createSystemPrompt([
  `You are the Social Media Director AI for Smart Medical Ventures (SMV) — a master copywriter who creates premium, credible social content for a dental-education launch brand while feeling completely organic.

${BRAND_VOICE_TEXT}

## SMV PROGRAMS & LINES:
- **Standard**: "Launch the school. Build the pipeline. Keep the tuition." — low-entry subscription launch path
- **Premium**: "Guided implementation from compliance to enrollment." — expanded launch support
- **California Premium**: "Built for California practice requirements." — Premium tuned for California (State requirements vary)
- **Clinical Ready(TM)**: "Students advance by proven readiness." — performance gates, skill validation, externship readiness

## PLATFORM RULES:

### TikTok:
- Hook in FIRST LINE — clear and credible
- Conversational, practical, still premium and compliance-minded
- 3-5 hashtags MAX — mix popular + niche dental-education tags
- CTA is direct but calm: "start subscription intake", "compare plans", "run the ROI"
- Emojis: used sparingly for emphasis, not decoration
- Caption can be 1-3 lines — short wins
- Total length: 100-150 characters max

### Instagram Feed:
- First line is the hook (everything else is "more")
- 2-3 sentences max before the fold
- 5-8 hashtags after line breaks (not in main text)
- Premium tone — authoritative and practical, not salesy or hype
- Emojis sparingly
- CTA: "Start Subscription Intake" or "Compare Plans"

### Instagram Stories:
- 5-7 words max per frame — readable at a glance
- Bold statement or question format
- Strong CTA: "Compare plans", "Run the ROI"
- Can include poll sticker copy

### Facebook / LinkedIn:
- Slightly longer — professional audience reads more
- Name the program and the outcome (pipeline, tuition, readiness)
- Credibility angles: "A structured, practice-based dental assisting school launch"
- CTA: clear and direct

### YouTube:
- Title: SEO-aware, curiosity-gap, 60 chars max
- Description: First 2 lines must hook before "Show more"
- Include the program name naturally

## WRITING RULES:
- NEVER write "passive income", "free money", "side hustle", or "guaranteed licensure"
- NEVER promise licensure — say "guided launch support" / "Done-for-You state requirements"
- NEVER sound cheap, coupon-y, or hype
- ALWAYS keep it calm, confident, and outcome-focused (pipeline, tuition ownership, Clinical Ready readiness)
- Keep compliance notes available where relevant: "State requirements vary", "Practice verification required"
- Revenue framing is a strength: the school keeps tuition — NO SMV royalties, NO per-student SMV fees
- Hebrew posts: use ✅ for bullet points, keep the same premium, compliance-minded tone

## OUTPUT FORMAT:
Return JSON Caption or PostPackage objects.`,
]);

export class SocialAgent {
  async writeCaption(brief: ContentBrief): Promise<Caption> {
    const prompt = `Write a ${brief.platform} caption for Smart Medical Ventures (SMV) ${brief.product}.

VISUAL: ${brief.visual_description}
KEY MESSAGE: ${brief.key_message || "launch a practice-based dental assisting school — build the pipeline, keep the tuition"}
TONE: ${brief.campaign_tone || "calm, confident, premium, compliance-minded"}
INCLUDE PRICE: ${brief.include_price ? "yes" : "no"}

Write a complete Caption JSON object with hook, main text, hashtags, CTA, and full assembled post text.`;

    return await claudeStructured<Caption>(prompt, {
      model: CLAUDE_HAIKU,
      system: SOCIAL_AGENT_SYSTEM,
      temperature: 0.8,
      max_tokens: 800,
    });
  }

  async buildPostPackage(
    product: string,
    campaignConcept: string,
    platforms: Platform[]
  ): Promise<PostPackage> {
    const prompt = `Create a complete multi-platform post package for Smart Medical Ventures (SMV) ${product}.

CAMPAIGN CONCEPT: ${campaignConcept}
PLATFORMS: ${platforms.join(", ")}

Create an optimized post for each platform with:
- Platform-specific caption style
- Appropriate hashtags
- CTA tailored to platform
- Hook line that stops scrolling

Also include:
- Story text (if Instagram in platforms)
- YouTube title + first 2 lines of description (if YouTube in platforms)

Return complete JSON PostPackage.`;

    return await claudeStructured<PostPackage>(prompt, {
      model: CLAUDE_HAIKU,
      system: SOCIAL_AGENT_SYSTEM,
      temperature: 0.8,
      max_tokens: 2000,
    });
  }

  async writeTikTokCaption(product: string, videoHook: string): Promise<Caption> {
    return await this.writeCaption({
      product,
      platform: "tiktok",
      visual_description: videoHook,
      campaign_tone: "viral authentic",
    });
  }

  async writeInstagramCaption(
    product: string,
    imageDescription: string,
    premium: boolean = true
  ): Promise<Caption> {
    return await this.writeCaption({
      product,
      platform: "instagram",
      visual_description: imageDescription,
      campaign_tone: premium ? "aspirational luxury" : "lifestyle authentic",
    });
  }

  async translateToHebrew(caption: Caption): Promise<Caption> {
    const prompt = `Translate this Smart Medical Ventures (SMV) social media caption to Hebrew (עברית).

Keep the premium, calm, confident, compliance-minded tone. Adapt naturally for a professional dental-education audience.
Keep hashtags in English but add 2-3 Hebrew hashtags.
Preserve the brand voice — authoritative and practical, never hype, and never guarantee licensure.

ORIGINAL: ${JSON.stringify(caption)}

Return translated JSON Caption object.`;

    return await claudeStructured<Caption>(prompt, {
      model: CLAUDE_HAIKU,
      system: SOCIAL_AGENT_SYSTEM,
      temperature: 0.6,
      max_tokens: 800,
    });
  }

  async generateHashtagSet(product: string, platform: Platform, count: number = 8): Promise<string[]> {
    const prompt = `Generate ${count} hashtags for Smart Medical Ventures (SMV) ${product} on ${platform}.

Mix: branded (#smartmedicalventures #clinicalready), category (#dentalassisting #dentaleducation #practicegrowth), niche (#dentalassistingschool #dentalstaffing #dsomanagement), trending-adjacent.

Return as JSON array of strings (include the # symbol).`;

    const result = await claudeStructured<string[]>(prompt, {
      model: CLAUDE_HAIKU,
      system: SOCIAL_AGENT_SYSTEM,
      temperature: 0.7,
      max_tokens: 200,
    });

    return Array.isArray(result) ? result : [];
  }
}

export const socialAgent = new SocialAgent();
export default socialAgent;

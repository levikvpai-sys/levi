import { generateStructuredOutput, createSystemPrompt, FAST_MODEL } from "@/lib/openai";
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
  `You are the Social Media Director AI for Hippo Float — a master copywriter who creates social content that SELLS luxury while feeling completely organic.

${BRAND_VOICE_TEXT}

## HIPPO FLOAT PRODUCTS & CAMPAIGNS:
- **Joy** ($89.99): "Float Your Way to Paradise" — luxury, effortless, paradise vibes
- **Chill** ($69.99): "Float Together. Stay in Place." — social, anchored, fun with friends
- **Fun** ($49.99): "Have Some Fun" — energetic, colorful, good times
- **Vibes** ($69.99): "Summer in Full Bloom" — bold color, pure comfort, summer aesthetic

## PLATFORM RULES:

### TikTok:
- Hook in FIRST LINE — must stop the scroll instantly
- Conversational, authentic, trend-aware
- 3-5 hashtags MAX — mix popular + niche
- CTA is subtle: "link in bio", "find yours", "get yours before summer ends"
- Emojis: used for emphasis, not decoration (🌊 ☀️ ✨)
- Caption can be 1-3 lines — short wins
- Total length: 100-150 characters max

### Instagram Feed:
- First line is the hook (everything else is "more")
- 2-3 sentences max before the fold
- 5-8 hashtags after line breaks (not in main text)
- Premium tone — aspirational, not salesy
- Emojis sparingly: 🌊 ✨ 🌴 💛 🤍
- CTA: "Shop the link in bio" or "Your float is waiting"

### Instagram Stories:
- 5-7 words max per frame — readable at a glance
- Bold statement or question format
- Strong CTA: "Swipe up", "Tap to shop"
- Can include poll sticker copy

### Facebook:
- Slightly longer — Facebook audience reads more
- Include product name and price if promo
- Social proof angles: "Thousands already floating without drifting"
- CTA: clear and direct

### YouTube:
- Title: SEO-aware, curiosity-gap, 60 chars max
- Description: First 2 lines must hook before "Show more"
- Include product name naturally

## WRITING RULES:
- NEVER write "affordable" or "cheap" or "discount"
- NEVER write like a basic Amazon listing
- ALWAYS write like you're inviting someone to a lifestyle, not selling a product
- The anchor system is a FEATURE to brag about: "never drift again", "stays exactly where you put it", "drift-free"
- Hebrew posts: use ✅ for bullet points, keep same luxury tone

## OUTPUT FORMAT:
Return JSON Caption or PostPackage objects.`,
]);

export class SocialAgent {
  async writeCaption(brief: ContentBrief): Promise<Caption> {
    const prompt = `Write a ${brief.platform} caption for Hippo Float ${brief.product}.

VISUAL: ${brief.visual_description}
KEY MESSAGE: ${brief.key_message || "drift-free luxury float"}
TONE: ${brief.campaign_tone || "premium lifestyle aspiration"}
INCLUDE PRICE: ${brief.include_price ? "yes" : "no"}

Write a complete Caption JSON object with hook, main text, hashtags, CTA, and full assembled post text.`;

    return await generateStructuredOutput<Caption>(prompt, {
      model: FAST_MODEL,
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
    const prompt = `Create a complete multi-platform post package for Hippo Float ${product}.

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

    return await generateStructuredOutput<PostPackage>(prompt, {
      model: FAST_MODEL,
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
    const prompt = `Translate this Hippo Float social media caption to Hebrew (עברית).

Keep the luxury premium tone. Adapt for Israeli beach culture (Mediterranean Sea, Red Sea beach, hotel pools).
Keep hashtags in English but add 2-3 Hebrew hashtags.
Preserve the brand voice — aspirational, not salesy.

ORIGINAL: ${JSON.stringify(caption)}

Return translated JSON Caption object.`;

    return await generateStructuredOutput<Caption>(prompt, {
      model: FAST_MODEL,
      system: SOCIAL_AGENT_SYSTEM,
      temperature: 0.6,
      max_tokens: 800,
    });
  }

  async generateHashtagSet(product: string, platform: Platform, count: number = 8): Promise<string[]> {
    const prompt = `Generate ${count} hashtags for Hippo Float ${product} on ${platform}.

Mix: branded (#hippofloat #hippofloatjoy), lifestyle (#beachlife #poolluxury #summervibes), niche (#driftfree #anchoredfloat #poolday), trending-adjacent.

Return as JSON array of strings (include the # symbol).`;

    const result = await generateStructuredOutput<string[]>(prompt, {
      model: FAST_MODEL,
      system: SOCIAL_AGENT_SYSTEM,
      temperature: 0.7,
      max_tokens: 200,
    });

    return Array.isArray(result) ? result : [];
  }
}

export const socialAgent = new SocialAgent();
export default socialAgent;

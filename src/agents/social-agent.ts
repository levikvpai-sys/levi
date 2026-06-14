import { claudeStructured, createSystemPrompt, CLAUDE_SONNET } from "@/lib/claude";
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
  `You are the world's most effective social media copywriter — the person brands call when a launch needs to break records. You have written captions that drove Stanley to sell out in 4 minutes, made Drunk Elephant go viral before anyone knew the brand, and turned a $69 pool float into a summer obsession.

You understand the difference between a caption that gets 200 likes and one that gets 2 million. The difference is not luck. It is architecture.

${BRAND_VOICE_TEXT}

## THE 4 HIPPO FLOAT PRODUCTS & THEIR EMOTIONAL CORE:
- **Joy** ($89.99 — Luxury Recliner): The float for people who don't compromise. "Float Your Way to Paradise." Emotional core: effortless deserved indulgence. Who they are: the person who books the villa, not the hostel.
- **Chill** ($69.99 — U-Shape Ring): The float for people who float together. "Float Together. Stay in Place." Emotional core: connection + ease. Who they are: the person who organizes the group trip.
- **Fun** ($49.99 — Torpedo Tube): The float for people who are the energy. "Have Some Fun." Emotional core: joyful chaos, nothing taken too seriously. Who they are: the person who starts the water fight.
- **Vibes** ($69.99 — Flat Mat): The float for people who curate their summer. "Summer in Full Bloom." Emotional core: aesthetic beauty, color, sensory pleasure. Who they are: the person with the perfect Instagram feed naturally.

## THE CENTRAL VIRAL TRUTH:
The bag you bring to the beach IS the anchor. It fills with water, sinks, keeps you exactly where you want to be.
You never drift again.

This is not a product feature. This is a DISCOVERY. Write every caption so that reading it feels like being told a secret.

## THE ARCHITECTURE OF HIGH-PERFORMING CAPTIONS:

### What makes people SAVE a post (saves = algorithm gold):
- Useful information they'll want to reference later
- Something that solves a real, named problem ("I didn't know this existed")
- Lists, tips, rankings — anything scannable
- Revelations: "the bag IS the anchor" is a save-worthy revelation

### What makes people SHARE a post:
- Identity alignment — "this is SO me / SO us"
- Discovery — "I found this before you did"
- Social currency — "recommending this makes me look cool"
- Summer content people want on their own feed
- Anything with the emotional energy of: "we're doing this"

### What makes people COMMENT:
- Asking a question directly (comment bait done tastefully)
- Saying something so true they have to agree
- Creating a prompt to tag someone: "tag your pool person"
- Controversy-light: "fight me but [opinion]"
- Relatability that demands a "ME" response

### What makes people CLICK LINK IN BIO:
- Creating a gap between the caption and the product page: they need more
- Social proof: "12,000 people bought this last summer" (if true)
- FOMO: "summer limited" or "ships in 24 hours"
- Clear, direct, non-desperate CTA: "Yours is waiting →"

## PLATFORM SPECIFICS:

### TikTok (100-150 characters MAX):
The caption is almost invisible. It's backup to the video. Make it count.
Formula that works: [Hook that names the feeling] + [1-line truth] + [1 CTA] + [3-5 hashtags]

Best-performing TikTok caption structures:
- "I cannot believe I floated for 4 years without knowing this existed 🌊" [extremely relatable, creates FOMO]
- "pov: you're the one who found hippo float first" [identity play, share trigger]
- "the bag is the anchor. i said what i said 🛟" [revelation format, quotable]
- "ok but why does EVERY pool float drift 😭 [answer: hippo float]" [problem-solution, comment bait]

NEVER: write more than 150 characters. Never use #poolday #beachvibes without more specific tags. Never sound like a brand.

### Instagram Feed (max 2200 chars, but the first 125 matter most):
The fold is at 125 characters. Everything before: must earn the "more" tap.
Everything after: reward the person who tapped.

Formula: [Hook — one bold statement or question] + [line break] + [2-3 sentence story or revelation] + [white space] + [5-10 hashtags below the dots]

Best-performing first lines:
- "Nobody told me pool floats were supposed to drift." (resentment-then-revelation)
- "Things I didn't know I needed until I saw them floating perfectly still 🌊" (discovery)
- "This is going to sound dramatic but this float changed my entire summer." (personal)
- "The bag. Is. The. Anchor. Read that again." (revelation, emphasis structure)

Hashtag strategy: 3-4 high-reach (#poolday 8M, #beachlife 120M, #summervibes 50M) + 3-4 medium (#luxuryfloat 50K, #poolfloat 200K, #summermusthaves 500K) + 2-3 branded (#hippofloat #driftfree #hippofloatjoy)

### Instagram Stories (5-7 words per frame):
Frame 1: Problem statement or hook
Frame 2: The revelation
Frame 3: CTA
Poll copy: simple, action-oriented ("have you tried it yet?")

### Facebook (longer, more conversational, community tone):
Facebook audiences read more and buy more deliberately.
Formula: [Relatable problem] + [Story with emotional beat] + [The solution, explained] + [Social proof language] + [Direct CTA with price]
Use price (Facebook buyers expect it). Use words like "thousands of families", "this summer". Speak to the buyer, not the influencer.

### YouTube:
Title: curiosity gap + keyword + under 60 chars
"I tried the float that doesn't drift. Here's what happened."
"Why every other pool float is wrong (and this one is right)"
"The bag is the anchor — and I can't go back"
Description opening (first 2 lines, no "show more"): must hook AND introduce the product.

## THE VOCABULARY OF HIPPO FLOAT:
USE: drift-free, anchored, stays put, exactly where you want it, never moves, held in place, still, effortless, unlock summer, own the pool, precision floating
USE: paradise, effortless, deserved, luxurious, alive, present, free

NEVER USE: affordable, cheap, budget, price drop, sale, deal, discount, promotional
NEVER WRITE: "Introducing...", "Check out our...", "Buy now...", "Don't miss..."
NEVER SOUND LIKE: a brand. Sound like a person who found something they love and can't stop talking about it.

## EMOTIONAL REGISTER:
The tone is: luxury-adjacent aspiration + authentic discovery + summer joy
Think: the feeling of a perfectly still afternoon on crystal water, where nothing needs to happen because everything already is.
Write from inside that feeling.

Return JSON Caption or PostPackage objects.`,
]);

export class SocialAgent {
  async writeCaption(brief: ContentBrief): Promise<Caption> {
    const prompt = `Write a ${brief.platform} caption for Hippo Float ${brief.product} that is built to get shares and saves — not just likes.

VISUAL BEING CAPTIONED: ${brief.visual_description}
KEY MESSAGE: ${brief.key_message || "The bag IS the anchor. You never drift again."}
EMOTIONAL TONE: ${brief.campaign_tone || "aspirational luxury discovery — someone found something they can't believe existed"}
INCLUDE PRICE: ${brief.include_price ? "yes — mention naturally, not as a selling point" : "no"}

Write a Caption JSON with a hook_line that stops scrolling, main text that earns the follow, platform-appropriate hashtags, and a CTA that feels invited not demanded.

The full_post field must be the COMPLETE ready-to-paste post (hook + text + hashtags + CTA assembled exactly as it would appear).`;

    return await claudeStructured<Caption>(prompt, {
      model: CLAUDE_SONNET,
      system: SOCIAL_AGENT_SYSTEM,
      temperature: 0.85,
      max_tokens: 1000,
    });
  }

  async buildPostPackage(
    product: string,
    campaignConcept: string,
    platforms: Platform[]
  ): Promise<PostPackage> {
    const prompt = `Create a complete multi-platform social campaign for Hippo Float ${product} that is architected to go viral.

CAMPAIGN CONCEPT / OBJECTIVE: ${campaignConcept}
PLATFORMS: ${platforms.join(", ")}

For EACH platform, write the post that is:
- Natively formatted for that platform's scroll behavior
- Engineered for that platform's specific share/save/comment trigger
- Written from the INSIDE (as a discoverer, not a brand)
- Complete and ready to copy-paste

Platform-specific extras to include if platform is selected:
- Instagram → also write story_text (5-7 word frame), story_poll question + 2 options
- YouTube → also write youtube_title (curiosity gap, <60 chars) + youtube_description (2-line hook before "show more")
- TikTok → hook_line must be under 80 chars, caption under 150 chars total

Return complete JSON PostPackage. The full_post field for each platform must be complete — no "[add hashtags here]" placeholders.`;

    return await claudeStructured<PostPackage>(prompt, {
      model: CLAUDE_SONNET,
      system: SOCIAL_AGENT_SYSTEM,
      temperature: 0.85,
      max_tokens: 2500,
    });
  }

  async writeTikTokCaption(product: string, videoHook: string): Promise<Caption> {
    return await this.writeCaption({
      product,
      platform: "tiktok",
      visual_description: videoHook,
      campaign_tone: "authentic viral discovery — the person who found this first",
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
      campaign_tone: premium ? "aspirational luxury — deserved indulgence" : "relatable summer discovery",
    });
  }

  async translateToHebrew(caption: Caption): Promise<Caption> {
    const prompt = `Translate this Hippo Float social media caption to Hebrew (עברית).

Adapt for Israeli summer culture: Mediterranean Sea, Red Sea beach (Eilat), hotel rooftop pools, Tel Aviv beach clubs.
Keep the luxury discovery tone — the same feeling, in Hebrew.
Keep hashtags in English, add 2-3 Israeli-relevant Hebrew hashtags (#קיץ #בריכה #חופש).
Sound like an Israeli influencer who found something amazing — not a translation.

ORIGINAL:
${JSON.stringify(caption)}

Return translated JSON Caption object with Hebrew text in all text fields.`;

    return await claudeStructured<Caption>(prompt, {
      model: CLAUDE_SONNET,
      system: SOCIAL_AGENT_SYSTEM,
      temperature: 0.7,
      max_tokens: 1000,
    });
  }

  async generateHashtagSet(product: string, platform: Platform, count: number = 10): Promise<string[]> {
    const prompt = `Generate ${count} high-performing hashtags for Hippo Float ${product} on ${platform}.

Strategy: mix high-reach discovery tags (1M-100M posts) + medium niche tags (50K-1M) + branded/owned tags.
Every hashtag must be a tag a real person in the target audience actually follows or searches.

AVOID: generic vacation tags that everyone uses and nobody searches.
INCLUDE: tags where Hippo Float actually belongs and would be discovered.

Return as JSON array of strings (include the # symbol).`;

    const result = await claudeStructured<string[]>(prompt, {
      model: CLAUDE_SONNET,
      system: SOCIAL_AGENT_SYSTEM,
      temperature: 0.7,
      max_tokens: 300,
    });

    return Array.isArray(result) ? result : [];
  }
}

export const socialAgent = new SocialAgent();
export default socialAgent;

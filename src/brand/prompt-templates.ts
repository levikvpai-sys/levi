// Premium cinematic prompt templates for Smart Medical Ventures (SMV)

export type ProductLine = "JOY" | "CHILL" | "FUN" | "VIBES";
export type PromptStyle =
  | "CINEMATIC_LUXURY"
  | "TIKTOK_VIRAL"
  | "PRODUCT_DEMO"
  | "EMOTIONAL_STORY"
  | "BRAND_FILM"
  | "LIFESTYLE_PRACTICE";

export interface SceneRequest {
  product: ProductLine;
  color?: string;
  style: PromptStyle;
  subject?: string;
  action?: string;
  environment?: string;
  cameraAngle?: string;
  timeOfDay?: "golden_hour" | "midday" | "sunset" | "blue_hour";
  motion?: string;
  showAnchorSystem?: boolean;
}

export interface ShotPrompt {
  shot_number: number;
  shot_type: string;
  full_prompt: string;
  negative_prompt: string;
  camera_specs: string;
  lighting: string;
  motion_notes: string;
  continuity_notes: string;
}

const PRODUCT_DESCRIPTIONS: Record<ProductLine, string> = {
  JOY: "SMV Standard — practice-based dental assisting school launch. Real dental operatory, adult learner in clean navy scrubs at chairside assisting while an instructor guides tray setup. SMV navy panel with gold eyebrow label. Credible clinical training, premium and structured. Small SMV mark legible.",
  CHILL: "SMV Premium — guided launch of a practice-based dental assisting school. Instructor-led skill check in a real operatory, adult learners in navy scrubs at a sterilization or radiography training station. SMV navy/gradient panel with gold eyebrow label. Structured, professional, premium. Small SMV mark legible.",
  FUN: "SMV California Premium — California-tuned launch of a practice-based dental assisting school. Compliant, structured training in a real California dental operatory, learners in navy scrubs, instructor validating readiness, subtle 'State requirements vary' compliance treatment. SMV navy panel with gold eyebrow label. Small SMV mark legible.",
  VIBES: "Clinical Ready(TM) curriculum model — demonstrated-readiness training. Instructor conducting a performance-gate skill check as an adult learner in navy scrubs demonstrates a validated chairside task, clean skill-validation checklist visible. SMV navy/violet-magenta panel with gold eyebrow label. Small SMV mark legible.",
};

const ANCHOR_SYSTEM_PROMPT =
  "SMV brand treatment applied: dark navy or violet-to-magenta gradient panel, uppercase letter-spaced gold eyebrow label, white headline text, gold and violet-magenta only as small accents, clean clinical whites, small SMV mark legible";

const CAMERA_PRESETS: Record<string, string> = {
  ARRI_LUXURY:
    "shot on ARRI Alexa Mini LF look, 35mm lens, cinematic 2.39:1 aspect ratio",
  SONY_CINEMA:
    "shot on Sony Venice look, 50mm spherical lens, clean color science",
  IPHONE_PREMIUM: "shot on iPhone 15 Pro Max Cinematic mode, shallow depth of field",
  DRONE_AERIAL: "elevated establishing shot, clean wide 24mm lens",
};

const STYLE_MODIFIERS: Record<PromptStyle, string> = {
  CINEMATIC_LUXURY:
    "ultra-premium, calm and confident brand aesthetic, editorial-grade clinical photography, outcome-focused, credible and structured",
  TIKTOK_VIRAL:
    "clear strong-hook composition, clean bold framing, instant clarity, social-optimized but still premium and compliance-minded",
  PRODUCT_DEMO:
    "clear demonstration of the launch framework or a Clinical Ready skill, hero framing, clean structured composition",
  EMOTIONAL_STORY:
    "human connection through real training, practice owner and learner journey, warm but professional, feels credible",
  BRAND_FILM:
    "cinematic brand storytelling, premium production value, calm confident authority, timeless and clinical",
  LIFESTYLE_PRACTICE:
    "authentic day-in-the-practice content, real operatory and training moments, professional and aspirational-but-achievable, structured premium energy",
};

const LIGHTING_PRESETS: Record<string, string> = {
  golden_hour:
    "warm professional key light, soft directional fill, clean and flattering, premium DSLR look, no harsh shadows",
  midday:
    "bright even clinical daylight, clean neutral whites, crisp and professional",
  sunset:
    "warm restrained tone, soft gold accent light, calm confident mood",
  blue_hour:
    "cool soft light, serene and clean, controlled premium clarity",
};

export class PromptEngine {
  buildImagePrompt(scene: SceneRequest): string {
    const productDesc = PRODUCT_DESCRIPTIONS[scene.product];
    const styleModifier = STYLE_MODIFIERS[scene.style];
    const lighting = LIGHTING_PRESETS[scene.timeOfDay || "golden_hour"];
    const anchor =
      scene.showAnchorSystem !== false ? `, ${ANCHOR_SYSTEM_PROMPT}` : "";
    const environment =
      scene.environment ||
      "real dental operatory with chairside assisting, clean clinical setting";
    const subject = scene.subject || "adult learner in clean navy scrubs";
    const action = scene.action || "at chairside assisting under instructor guidance";
    const camera =
      CAMERA_PRESETS[
        scene.style === "TIKTOK_VIRAL" ? "IPHONE_PREMIUM" : "ARRI_LUXURY"
      ];
    const color = scene.color ? `${scene.color} accent` : "";

    return `${styleModifier}, ${color} ${productDesc}, ${subject} ${action}${anchor}, ${environment}, ${lighting}, ${camera}, photorealistic, premium commercial photography quality, credible clinical detail, no cartoon icons, no generic stock smiles, ultra high resolution`;
  }

  buildVideoPrompt(scene: SceneRequest): string {
    const basePrompt = this.buildImagePrompt(scene);
    const motion =
      scene.motion || "slow smooth camera push-in, steady intentional movement across the clinical work";
    return `${basePrompt}, ${motion}, cinematic-but-restrained, 24fps professional look, smooth stabilized camera movement, no jerky motion`;
  }

  buildProductShotPrompt(
    product: ProductLine,
    angle: string,
    environment: string,
    color?: string
  ): string {
    const productDesc = PRODUCT_DESCRIPTIONS[product];
    const colorStr = color ? `${color} accent` : "SMV navy and gold";
    const anchor = ANCHOR_SYSTEM_PROMPT;

    return `Hero brand shot, ${colorStr}, ${productDesc}, ${angle} angle, ${environment}, ${anchor}, ARRI Alexa Mini LF look, 50mm lens, clean professional lighting, ultra sharp detail, premium commercial photography, photorealistic, SMV mark perfectly readable, no distortion, no cartoon icons`;
  }

  buildLifestylePrompt(
    product: ProductLine,
    subject: string,
    action: string,
    environment: string,
    color?: string
  ): string {
    const productDesc = PRODUCT_DESCRIPTIONS[product];
    const colorStr = color ? `${color} accent` : "SMV navy and gold";
    const anchor = ANCHOR_SYSTEM_PROMPT;

    return `Premium day-in-the-practice photography, ${colorStr}, ${productDesc}, ${subject} ${action}, ${environment}, ${anchor}, warm professional lighting, ARRI Alexa Mini LF look, 35mm lens, structured composition, calm confident premium mood, photorealistic, authentic professional expressions, no cartoon icons, no stock smiles`;
  }

  buildUnderWaterSplitShot(product: ProductLine, color?: string): string {
    const productDesc = PRODUCT_DESCRIPTIONS[product];
    const colorStr = color ? `${color} accent` : "SMV navy and gold";

    return `Signature split-panel SMV brand shot, top: ${colorStr} ${productDesc} with an adult learner in navy scrubs at chairside assisting in a real operatory, bottom: a dark navy or violet-to-magenta gradient panel with white headline text and an uppercase gold eyebrow label reading the campaign line, ARRI Alexa Mini LF look, 35mm lens, clean professional lighting, photorealistic, premium clinical quality, small SMV mark legible, no cartoon icons`;
  }

  buildTikTokHookShot(product: ProductLine, hookConcept: string, color?: string): string {
    const productDesc = PRODUCT_DESCRIPTIONS[product];
    const colorStr = color ? `${color} accent` : "SMV navy and gold";
    const anchor = ANCHOR_SYSTEM_PROMPT;

    return `High-clarity social hero shot, ${colorStr}, ${productDesc}, ${hookConcept}, ${anchor}, clean clinical setting, bold clear composition, center-frame subject, professional premium vibe, Sony Venice look, 35mm lens, clean lighting, photorealistic, maximum clarity, no cartoon icons, no stock smiles`;
  }

  buildScriptToShotList(
    script: { scenes: Array<{ description: string; shot_type: string; duration: number }> },
    product: ProductLine,
    style: PromptStyle,
    color?: string
  ): ShotPrompt[] {
    return script.scenes.map((scene, index) => ({
      shot_number: index + 1,
      shot_type: scene.shot_type,
      full_prompt: this.buildImagePrompt({
        product,
        color,
        style,
        action: scene.description,
        showAnchorSystem: true,
      }),
      negative_prompt: UNIVERSAL_NEGATIVE_PROMPT,
      camera_specs: CAMERA_PRESETS.ARRI_LUXURY,
      lighting: LIGHTING_PRESETS.golden_hour,
      motion_notes: `${scene.shot_type} — smooth ${scene.duration}s duration`,
      continuity_notes: `Match SMV brand treatment and ${color || "navy/gold"} accent to previous shots`,
    }));
  }
}

export const UNIVERSAL_NEGATIVE_PROMPT =
  "cartoon, cartoon icons, illustration, painting, drawing, CGI look, generic stock smiles, staged fake enthusiasm, licensure guarantee overlay, 'guaranteed licensure' text, passive income text, free money text, side hustle framing, coupon or discount styling, cheap look, hype styling, incorrect SMV plan names, missing compliance note, wrong palette, altered SMV mark, invented credentials or clinical claims, distorted human proportions, blurry, low resolution, watermark, washed out colors";

export const SCRIPT_STYLES = {
  CINEMATIC_LUXURY: {
    name: "Cinematic Luxury",
    description: "Premium brand film quality — calm, confident, authoritative",
    pace: "slow and deliberate",
    hook_style: "credible statement or clear outcome — show the real training",
    music: "understated cinematic or professional ambient",
    example_hook: "Your practice can train the assistants it actually needs.",
  },
  TIKTOK_VIRAL: {
    name: "TikTok Viral",
    description: "Hook-first, clear, practical — still premium and compliance-minded",
    pace: "fast, clear payoff",
    hook_style: "direct question or specific claim in the first line",
    music: "clean upbeat but professional",
    example_hook: "What if your dental practice ran its own assisting school?",
  },
  PRODUCT_DEMO: {
    name: "Program Demo",
    description: "Feature-forward, educational, clear value of the launch framework",
    pace: "measured, clear",
    hook_style: "problem-solution reveal — staffing gap to launch",
    music: "light professional background",
    example_hook: "This is how a practice goes from idea to organized school launch.",
  },
  EMOTIONAL_STORY: {
    name: "Practice Owner Story",
    description: "Human connection — the practice owner and learner journey",
    pace: "steady rhythm, room to breathe",
    hook_style: "relatable practice moment or staffing reality",
    music: "warm restrained score",
    example_hook: "Every practice has felt the assistant shortage.",
  },
  BRAND_FILM: {
    name: "Brand Film",
    description: "60-180 second cinematic brand statement for SMV",
    pace: "cinematic — slow build to payoff",
    hook_style: "atmospheric, credible world-building in a real operatory",
    music: "cinematic score, restrained",
    example_hook: "There is a better way to build your assistant pipeline.",
  },
  LIFESTYLE_PRACTICE: {
    name: "In the Practice",
    description: "Authentic day-in-the-practice content — real, credible, aspirational",
    pace: "natural and candid feeling",
    hook_style: "real training moment — you should see this in action",
    music: "clean professional underscore",
    example_hook: "This is what a practice-based assisting school looks like in real life.",
  },
};

export const promptEngine = new PromptEngine();
export default promptEngine;

// Hollywood-level cinematic prompt templates for Hippo Float

export type ProductLine = "JOY" | "CHILL" | "FUN" | "VIBES";
export type PromptStyle =
  | "CINEMATIC_LUXURY"
  | "TIKTOK_VIRAL"
  | "PRODUCT_DEMO"
  | "EMOTIONAL_STORY"
  | "BRAND_FILM"
  | "LIFESTYLE_BEACH";

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
  JOY: "hippo float Joy luxury inflatable pool recliner/lounger — EXACT SHAPE: semi-reclined chaise lounge with raised backrest at 30-40 degree angle, like a zero-gravity beach chair on water. Clear L-profile from the side: flat seat transitions to elevated curved backrest with integrated headrest rising 12-18 inches above seat. NEVER flat, NEVER a ring — always a reclining chair shape. White 'hippo' logo on backrest.",
  CHILL: "hippo float Chill U-shaped horseshoe ring float — EXACT SHAPE: open horseshoe ring from above, like a circular life ring with front third removed. Ring tube ~8 inches diameter. Person sits INSIDE the U-opening in mesh seat sling, arms on ring sides, legs dangling below water. NEVER a full circle — always U-shaped/open-front. White 'hippo' logo on ring. GREEN anchor bag always.",
  FUN: "hippo float Fun large inflatable cylindrical torpedo tube — EXACT SHAPE: elongated oval-cylinder ~5-6 feet long, 14-16 inches diameter, rounded sealed end caps. Person straddles lengthwise or lies across it. NEVER flat, NEVER a ring, NEVER a chair — always a thick inflatable tube. White 'hippo' logo on cylinder side.",
  VIBES: "hippo float Vibes flat rectangular inflatable mat — EXACT SHAPE: large flat rectangle ~68x30 inches, 4-5 inches thick. DEFINING: rows of raised circular texture dots covering ENTIRE top surface in uniform grid pattern, each ~2 inches diameter. Completely FLAT — no backrest, no raised edges. Person lies flat on top. NEVER a chair, NEVER a ring — always a flat mat. White 'hippo' logo at top end.",
};

const ANCHOR_SYSTEM_PROMPT =
  "connected to blue twisted nylon rope going underwater, small bright yellow buoy sphere at water surface on rope, hippo float anchor dry bag fully submerged underwater below the float, rope taut and visible";

const CAMERA_PRESETS: Record<string, string> = {
  ARRI_LUXURY:
    "shot on ARRI Alexa Mini LF look, 35mm anamorphic lens, 2.39:1 aspect ratio",
  SONY_CINEMA:
    "shot on Sony Venice look, 50mm spherical lens, cinematic color science",
  IPHONE_PREMIUM: "shot on iPhone 15 Pro Max Cinematic mode, shallow depth of field",
  DRONE_AERIAL: "aerial drone shot, DJI Inspire 3 look, 24mm wide lens",
};

const STYLE_MODIFIERS: Record<PromptStyle, string> = {
  CINEMATIC_LUXURY:
    "ultra-premium luxury commercial aesthetic, editorial photography quality, aspirational lifestyle, every frame a print ad",
  TIKTOK_VIRAL:
    "dynamic energetic composition, bold colors, high contrast, instant eye-catch, social media optimized, vibrant and fun",
  PRODUCT_DEMO:
    "crystal clear product visibility, hero product shot, demonstrate features clearly, clean composition",
  EMOTIONAL_STORY:
    "emotional resonance, human connection, storytelling composition, warm and inviting, feels like a memory",
  BRAND_FILM:
    "cinematic brand storytelling, premium production value, Mediterranean luxury atmosphere, timeless quality",
  LIFESTYLE_BEACH:
    "authentic beach lifestyle, sun-soaked joy, effortless luxury, golden summer energy, aspirational but achievable",
};

const LIGHTING_PRESETS: Record<string, string> = {
  golden_hour:
    "warm golden hour sunlight, soft directional side lighting, warm highlights, sun-kissed glow, no harsh shadows",
  midday:
    "bright natural daylight, clear blue sky light, crisp and clean, tropical brightness",
  sunset:
    "dramatic sunset warm tones, orange and pink sky reflections on water, magical golden light",
  blue_hour:
    "early morning blue hour, soft cool light, serene and peaceful, crystal clarity",
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
      "crystal clear turquoise tropical beach water, white sand beach, palm trees";
    const subject = scene.subject || "attractive fit model in premium swimwear";
    const action = scene.action || "relaxing effortlessly";
    const camera =
      CAMERA_PRESETS[
        scene.style === "TIKTOK_VIRAL" ? "IPHONE_PREMIUM" : "ARRI_LUXURY"
      ];
    const color = scene.color ? `${scene.color} colored` : "";

    return `${styleModifier}, ${color} ${productDesc}, ${subject} ${action} on the float${anchor}, ${environment}, ${lighting}, ${camera}, photorealistic, sharp detail, no AI artifacts, exact product geometry preserved, no shape alterations, authentic water physics, ultra high resolution commercial photography quality`;
  }

  buildVideoPrompt(scene: SceneRequest): string {
    const basePrompt = this.buildImagePrompt(scene);
    const motion =
      scene.motion || "slow smooth camera push-in, gentle water movement, natural float drift arrested by anchor";
    return `${basePrompt}, ${motion}, cinematic motion blur, 24fps cinematic look, smooth stabilized camera movement, no jerky motion`;
  }

  buildProductShotPrompt(
    product: ProductLine,
    angle: string,
    environment: string,
    color?: string
  ): string {
    const productDesc = PRODUCT_DESCRIPTIONS[product];
    const colorStr = color ? `${color}` : "vibrant";
    const anchor = ANCHOR_SYSTEM_PROMPT;

    return `Hero product shot, ${colorStr} ${productDesc}, ${angle} angle, ${environment}, ${anchor}, ARRI Alexa Mini LF look, 85mm lens, natural daylight with soft reflector fill, ultra sharp product detail, crystal clear water, premium commercial product photography, photorealistic, exact product shape preserved, 'hippo' logo perfectly readable, no distortion`;
  }

  buildLifestylePrompt(
    product: ProductLine,
    subject: string,
    action: string,
    environment: string,
    color?: string
  ): string {
    const productDesc = PRODUCT_DESCRIPTIONS[product];
    const colorStr = color ? `${color} colored` : "vibrant";
    const anchor = ANCHOR_SYSTEM_PROMPT;

    return `Luxury lifestyle photography, ${colorStr} ${productDesc}, ${subject} ${action}, ${environment}, ${anchor}, golden hour natural sunlight, ARRI Alexa Mini LF look, 35mm lens, rule of thirds composition, sun-kissed warm tones, aspirational premium beach lifestyle mood, photorealistic, authentic expressions, no AI artifacts, exact product geometry preserved`;
  }

  buildUnderWaterSplitShot(product: ProductLine, color?: string): string {
    const productDesc = PRODUCT_DESCRIPTIONS[product];
    const colorStr = color ? `${color} colored` : "vibrant";

    return `Dramatic split underwater/surface shot, above waterline: attractive model relaxing on ${colorStr} ${productDesc} in crystal clear turquoise water, below waterline: hippo float waterproof dry bag anchor fully submerged hanging from blue twisted rope, small yellow buoy sphere at water surface level on rope between float and anchor, underwater visibility shows coral sand bottom, ARRI Alexa Mini LF look, 24mm wide lens, natural tropical sunlight penetrating water, photorealistic water refraction, exact product geometry preserved, ultra premium commercial quality`;
  }

  buildTikTokHookShot(product: ProductLine, hookConcept: string, color?: string): string {
    const productDesc = PRODUCT_DESCRIPTIONS[product];
    const colorStr = color ? `${color}` : "vibrant bright";
    const anchor = ANCHOR_SYSTEM_PROMPT;

    return `High-energy social media hero shot, ${colorStr} ${productDesc}, ${hookConcept}, ${anchor}, crystal clear tropical water, bright saturated colors, bold composition, center frame product placement, sunny tropical vibes, Sony Venice cinematic look, 35mm lens, natural sunlight, photorealistic, maximum visual impact, no AI artifacts, product shape exact`;
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
      continuity_notes: `Match color grade and product ${color || ""} to previous shots`,
    }));
  }
}

export const UNIVERSAL_NEGATIVE_PROMPT =
  "wrong product shape, modified product shape, altered product geometry, shape distortion, wrong float type, mixing product lines, flat when should be reclined, ring when should be tube, tube when should be mat, mat when should be chair, missing rope, disconnected anchor rope, anchor bag above water surface, anchor bag floating at surface, floating anchor bag, wrong logo text, altered hippo logo, missing logo, extra accessories, invented product features, cartoon, illustration, painting, drawing, render, CGI look, plastic toy look, cheap quality, AI artifacts, distorted human proportions, blurry, low resolution, watermark, generic stock photo, washed out colors, unrealistic water, missing yellow buoy, yellow buoy wrong color, blue rope wrong color";

export const SCRIPT_STYLES = {
  CINEMATIC_LUXURY: {
    name: "Cinematic Luxury",
    description: "Premium brand film quality — Apple/Nike level production",
    pace: "slow and deliberate",
    hook_style: "visual intrigue — show before tell",
    music: "ambient electronic or cinematic orchestral",
    example_hook: "The ocean remembers where you stopped drifting.",
  },
  TIKTOK_VIRAL: {
    name: "TikTok Viral",
    description: "Hook-first, energetic, trend-aware but premium",
    pace: "fast cuts, instant payoff",
    hook_style: "question or shocking statement in first 2 words",
    music: "trending audio or upbeat beach vibes",
    example_hook: "POV: you're the only one not drifting away at the beach",
  },
  PRODUCT_DEMO: {
    name: "Product Demo",
    description: "Feature-forward, educational, clear value demonstration",
    pace: "measured, clear",
    hook_style: "problem-solution reveal",
    music: "light positive background music",
    example_hook: "This bag is the reason you'll never chase your float again.",
  },
  EMOTIONAL_STORY: {
    name: "Emotional Story",
    description: "Human connection, memory-making, feeling over feature",
    pace: "emotional rhythm, breathe between moments",
    hook_style: "relatable moment or universal truth",
    music: "warm acoustic or gentle piano",
    example_hook: "Some summers stay with you forever.",
  },
  BRAND_FILM: {
    name: "Brand Film",
    description: "60-180 second cinematic brand statement",
    pace: "cinematic — slow build to payoff",
    hook_style: "atmospheric world-building",
    music: "cinematic score",
    example_hook: "There is a place where the water is always clear.",
  },
  LIFESTYLE_BEACH: {
    name: "Lifestyle Beach",
    description: "Authentic summer lifestyle content — feels real, aspirational",
    pace: "natural and candid feeling",
    hook_style: "FOMO trigger — you should be here",
    music: "summer indie or chill beach vibes",
    example_hook: "This is what your summer was supposed to look like.",
  },
};

export const promptEngine = new PromptEngine();
export default promptEngine;

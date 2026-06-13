import { generateCompletion, generateStructuredOutput, createSystemPrompt } from "@/lib/openai";
import { PRODUCT_RULES_TEXT } from "@/brand/product-bible";
import { BRAND_VOICE_TEXT } from "@/brand/brand-bible";
import { UNIVERSAL_NEGATIVE_PROMPT, promptEngine } from "@/brand/prompt-templates";
import type { Script } from "./script-studio";

export interface ShotPrompt {
  shot_number: number;
  shot_name: string;
  shot_type: string;
  duration_seconds: number;
  full_prompt: string;
  negative_prompt: string;
  camera_specs: string;
  lens: string;
  lighting: string;
  motion_notes: string;
  continuity_notes: string;
  product_rules_applied: string[];
  generation_tool: "midjourney" | "dalle3" | "kling" | "runway" | "veo" | "sora";
}

export interface PromptPackage {
  campaign_title: string;
  product: string;
  color: string;
  style: string;
  shots: ShotPrompt[];
  continuity_guide: string;
  color_grade_direction: string;
}

const PROMPT_DIRECTOR_SYSTEM = createSystemPrompt([
  `You are the Cinematic Prompt Director AI for Hippo Float — a visual storytelling expert who translates scripts and concepts into precise AI generation prompts that produce Hollywood-quality results.

You think like a Director of Photography (DP) on a luxury commercial shoot.

${PRODUCT_RULES_TEXT}

${BRAND_VOICE_TEXT}

## THE 4 HIPPO FLOAT PRODUCTS — EXACT SHAPE DESCRIPTIONS FOR PROMPTS:

### JOY — Use exactly:
"hippo float Joy luxury inflatable pool lounger recliner — semi-reclined chaise lounge shape with elevated backrest and headrest, [COLOR] colored with 'hippo' logo"

### CHILL — Use exactly:
"hippo float Chill U-shaped horseshoe ring float — [COLOR] inflatable ring with open center, person sits in center opening with arms resting on the ring, 'hippo' logo on ring surface"

### FUN — Use exactly:
"hippo float Fun large inflatable cylinder torpedo tube — [COLOR] elongated oval inflatable, person straddling or hugging it, 'hippo' logo visible"

### VIBES — Use exactly:
"hippo float Vibes flat rectangular inflatable mat — [COLOR] wide flat float with circular texture drainage holes across entire surface, person lying flat on top, 'hippo' logo at top"

## ANCHOR SYSTEM — ALWAYS INCLUDE WHEN IN WATER:
"blue twisted nylon rope connected from float going underwater, small bright yellow buoy sphere at water surface level on rope, hippo float waterproof dry bag anchor fully submerged underwater hanging below float, rope visibly taut"

## CAMERA LANGUAGE TOOLKIT:
- Wide establishing: "cinematic wide shot, 24mm lens, horizon line composition"
- Product hero: "medium hero shot, 50mm lens, product center frame, shallow depth of field"
- Lifestyle: "35mm handheld-feel stabilized, intimate lifestyle framing"
- Aerial: "drone aerial shot, 24mm wide, bird's eye or 45-degree angle"
- Underwater split: "split underwater/surface shot, waterline bisects frame, above and below water simultaneously"
- Close detail: "85mm macro detail shot, razor-thin depth of field, bokeh background"

## CAMERA LOOKS:
- Premium: "ARRI Alexa Mini LF cinematic look, 2.39:1 anamorphic"
- Social: "Sony Venice look, spherical lens, social-optimized 9:16"
- Natural: "RED Komodo look, natural color science"

## LIGHTING PRESETS:
- Golden hour: "warm golden hour sunlight, 5600K directional sun, soft wrap, warm highlights, long shadows"
- Tropical noon: "bright natural tropical sunlight, 6500K, crystal clear visibility, no harsh shadows (softbox cloud)"
- Sunset: "dramatic sunset, orange-pink sky, warm 3200K, backlit silhouette potential"
- Pool luxury: "luxury resort pool lighting, soft reflected light from turquoise water, even and flattering"

## ENVIRONMENTS (Hippo Float approved):
- "crystal clear turquoise tropical beach water, white sand bottom visible, palm trees background"
- "luxury resort infinity pool, white stone surround, tropical garden backdrop, mountain or ocean view"
- "tropical lagoon with rock formations, crystal clear blue-green water, lush vegetation"
- "pristine white sand beach shoreline, gentle turquoise waves, cloudless blue sky"

## OUTPUT FORMAT:
Return JSON PromptPackage with all shots fully detailed.`,
]);

export class PromptDirectorAgent {
  async scriptToPrompts(
    script: Script,
    product: string,
    color: string
  ): Promise<PromptPackage> {
    const prompt = `Convert this Hippo Float ${product} script into a complete shot prompt package for AI image/video generation.

PRODUCT: ${product}
COLOR: ${color}
SCRIPT: ${JSON.stringify(script, null, 2)}

For each scene in the script, generate a complete ShotPrompt with:
- Full cinematic image/video generation prompt (Hollywood quality)
- Proper camera specs and lens
- Lighting direction
- Motion notes
- Continuity rules to maintain across shots
- Which AI tool to use (kling/runway for video, dalle3/midjourney for images)
- Product accuracy checklist applied

Return complete JSON PromptPackage.`;

    return await generateStructuredOutput<PromptPackage>(prompt, {
      system: PROMPT_DIRECTOR_SYSTEM,
      temperature: 0.5,
      max_tokens: 3000,
    });
  }

  async buildSingleImagePrompt(
    product: string,
    color: string,
    concept: string,
    style: string
  ): Promise<ShotPrompt> {
    const prompt = `Build a single Hollywood-quality AI image generation prompt for:

PRODUCT: ${product} (${color})
CONCEPT: ${concept}
STYLE: ${style}

Create a complete ShotPrompt with maximum detail for photorealistic commercial quality.
The prompt must enforce all product rules and include the anchor system if in water.
Return JSON ShotPrompt object.`;

    return await generateStructuredOutput<ShotPrompt>(prompt, {
      system: PROMPT_DIRECTOR_SYSTEM,
      temperature: 0.5,
      max_tokens: 1000,
    });
  }

  async buildVideoPromptSequence(
    product: string,
    color: string,
    sceneDescriptions: string[],
    platform: string
  ): Promise<ShotPrompt[]> {
    const prompt = `Build a complete video prompt sequence for ${platform} for Hippo Float ${product} (${color}).

SCENES: ${sceneDescriptions.map((s, i) => `${i + 1}. ${s}`).join("\n")}

For each scene create a ShotPrompt optimized for AI video generation (Kling/Runway/Sora).
Ensure visual continuity — same product, same color, same lighting across all shots.
Return JSON array of ShotPrompt objects.`;

    return await generateStructuredOutput<ShotPrompt[]>(prompt, {
      system: PROMPT_DIRECTOR_SYSTEM,
      temperature: 0.5,
      max_tokens: 3000,
    });
  }

  async buildSignatureShot(product: string, color: string): Promise<ShotPrompt> {
    const concept = `Signature hero shot — the iconic underwater split shot showing the ${product} on surface with person enjoying it, and the anchor system visible underwater. This is Hippo Float's most distinctive shot.`;

    return await this.buildSingleImagePrompt(product, color, concept, "CINEMATIC_LUXURY");
  }

  getNegativePrompt(): string {
    return UNIVERSAL_NEGATIVE_PROMPT;
  }

  buildQuickPrompt(product: string, color: string, environment: string): string {
    return promptEngine.buildImagePrompt({
      product: product as "JOY" | "CHILL" | "FUN" | "VIBES",
      color,
      style: "LIFESTYLE_BEACH",
      environment,
      showAnchorSystem: true,
    });
  }
}

export const promptDirector = new PromptDirectorAgent();
export default promptDirector;

import { generateStructuredOutput, createSystemPrompt } from "@/lib/openai";
import {
  ANCHOR_SYSTEM_RULES_TEXT,
  getPromptShapeText,
  getShapeNegative,
  detectProductLine,
  getColorDescription,
  PRODUCT_SHAPES_REFERENCE,
} from "@/brand/product-bible";
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

// Locked anchor system text — used verbatim in every water shot
const ANCHOR_LOCKED =
  "blue twisted nylon rope connecting float to anchor bag going underwater, small bright yellow buoy sphere at water surface level on rope, hippo float waterproof dry bag anchor FULLY SUBMERGED underwater below float, rope visibly taut";

// Locked negative additions for the anchor system
const ANCHOR_NEGATIVE =
  "anchor bag above water surface, anchor bag visible at surface level, rope disconnected, missing rope, missing yellow buoy, yellow buoy wrong color, anchor bag floating";

const PROMPT_DIRECTOR_SYSTEM = createSystemPrompt([
  `You are the Cinematic Prompt Director AI for Hippo Float.
You think like a Director of Photography on a luxury commercial shoot.

YOUR ONLY JOB: Add the creative scene layer around a LOCKED product description.
The product shape text is always provided verbatim — you MUST copy it exactly into the full_prompt. Do NOT rephrase, summarize, or change it. It is the ground truth.

${PRODUCT_SHAPES_REFERENCE}

## CAMERA LANGUAGE:
- Wide establishing: "cinematic wide shot, 24mm lens, horizon line composition"
- Product hero: "medium hero shot, 50mm lens, product center frame, shallow depth of field f/1.8"
- Lifestyle intimate: "35mm handheld-feel stabilized, intimate lifestyle framing"
- Aerial: "drone aerial shot, 24mm wide, bird's eye or 45-degree angle"
- Underwater split: "split underwater/surface shot, waterline bisects frame exactly, above and below water simultaneously visible"
- Close detail: "85mm macro detail shot, razor-thin depth of field f/1.4, smooth bokeh background"

## CAMERA LOOKS:
- Premium: "ARRI Alexa Mini LF cinematic look, 2.39:1 anamorphic widescreen"
- Social: "Sony Venice look, spherical 9:16 vertical format"
- Natural: "RED Komodo look, natural color science, organic feel"

## LIGHTING PRESETS:
- Golden hour: "warm golden hour sunlight 5600K, directional side lighting, long shadows, sun-kissed skin, warm highlights"
- Tropical noon: "bright tropical daylight 6500K, even soft light, crystal clear water visibility, soft cloud diffusion"
- Sunset: "dramatic sunset orange-pink sky 3200K, backlit potential, warm reflections on water"
- Pool luxury: "luxury resort soft pool light, turquoise water reflected light, even flattering fill"

## APPROVED ENVIRONMENTS:
- "crystal clear turquoise tropical beach water, white sand visible below, palm trees in background"
- "luxury infinity pool overlooking ocean, white stone surround, tropical garden, 5-star resort"
- "tropical lagoon with natural rock formations, crystal clear blue-green water, lush palm vegetation"
- "pristine white sand beach, gentle turquoise waves, cloudless Mediterranean blue sky"

## SUBJECT DIRECTION:
- "attractive fit model in premium designer swimwear, sun-kissed skin, relaxed natural expression"
- "group of friends, diverse, premium swimwear, genuine laughter, candid lifestyle moment"
- "product-only hero shot, no people, pure product beauty shot"

## OUTPUT FORMAT:
Return JSON ShotPrompt or PromptPackage. CRITICAL: the full_prompt field MUST include the exact locked product description text provided to you — do not alter it.`,
]);

export class PromptDirectorAgent {
  async buildSingleImagePrompt(
    product: string,
    color: string,
    concept: string,
    style: string
  ): Promise<ShotPrompt> {
    const productLine = detectProductLine(product);
    const colorDesc = getColorDescription(color);
    const lockedShapeText = getPromptShapeText(productLine, color);
    const shapeNegative = getShapeNegative(productLine);
    const productNegative = `${shapeNegative}, ${ANCHOR_NEGATIVE}, ${UNIVERSAL_NEGATIVE_PROMPT}`;

    const userPrompt = `Build a Hollywood-quality AI image prompt for this Hippo Float shot.

══ LOCKED PRODUCT SHAPE TEXT (copy verbatim into full_prompt — do not change) ══
${lockedShapeText}
══ END LOCKED TEXT ══

══ LOCKED ANCHOR SYSTEM (include verbatim in full_prompt for all water shots) ══
${ANCHOR_LOCKED}
══ END LOCKED ══

CREATIVE BRIEF:
- Color: ${colorDesc}
- Concept/Scene: ${concept}
- Style: ${style}

BUILD THE full_prompt by:
1. Start with the exact locked product shape text above
2. Add: the model/subject description
3. Add: the scene environment (crystal clear water, resort, beach, etc.)
4. Add: the locked anchor system text
5. Add: camera specs, lens, lighting, style modifier
6. End with quality anchors: "photorealistic, commercial photography quality, 8K, sharp product detail, exact product geometry preserved, no AI shape distortion"

Return a JSON ShotPrompt. The negative_prompt must include: "${productNegative}"`;

    const shot = await generateStructuredOutput<ShotPrompt>(userPrompt, {
      system: PROMPT_DIRECTOR_SYSTEM,
      temperature: 0.4,
      max_tokens: 1200,
    });

    // Safety net: if AI didn't include the locked shape text, inject it
    if (!shot.full_prompt.includes("hippo float")) {
      shot.full_prompt = `${lockedShapeText}, ${ANCHOR_LOCKED}, ${shot.full_prompt}`;
    }
    if (!shot.negative_prompt || shot.negative_prompt.length < 20) {
      shot.negative_prompt = productNegative;
    }
    shot.product_rules_applied = shot.product_rules_applied ?? [];
    if (!shot.product_rules_applied.includes("shape locked")) {
      shot.product_rules_applied.push("shape locked", "anchor system", "color verified");
    }

    return shot;
  }

  async scriptToPrompts(
    script: Script,
    product: string,
    color: string
  ): Promise<PromptPackage> {
    const productLine = detectProductLine(product);
    const colorDesc = getColorDescription(color);
    const lockedShapeText = getPromptShapeText(productLine, color);
    const shapeNegative = getShapeNegative(productLine);

    const userPrompt = `Convert this Hippo Float script into a complete shot prompt package.

══ LOCKED PRODUCT SHAPE TEXT (must appear verbatim in every shot's full_prompt) ══
${lockedShapeText}
══ END LOCKED ══

══ LOCKED ANCHOR SYSTEM (include in every water shot) ══
${ANCHOR_LOCKED}
══ END LOCKED ══

PRODUCT: ${product} (${colorDesc})
SCRIPT:
${JSON.stringify(script, null, 2)}

For EACH scene, build a ShotPrompt where:
- full_prompt STARTS with the locked product shape text, then adds scene/lighting/camera
- negative_prompt includes: "${shapeNegative}, ${ANCHOR_NEGATIVE}"
- generation_tool: use kling or runway for video scenes, midjourney for hero stills, dalle3 for product shots
- Maintain visual continuity — same product, same color, same lighting style across all shots

Return complete JSON PromptPackage with all shots.`;

    const pkg = await generateStructuredOutput<PromptPackage>(userPrompt, {
      system: PROMPT_DIRECTOR_SYSTEM,
      temperature: 0.4,
      max_tokens: 4000,
    });

    // Safety net: ensure every shot has the locked shape text
    if (pkg.shots) {
      pkg.shots = pkg.shots.map((shot) => {
        if (!shot.full_prompt.includes("hippo float")) {
          shot.full_prompt = `${lockedShapeText}, ${ANCHOR_LOCKED}, ${shot.full_prompt}`;
        }
        shot.product_rules_applied = shot.product_rules_applied ?? [];
        if (!shot.product_rules_applied.includes("shape locked")) {
          shot.product_rules_applied.push("shape locked", "anchor system", "color verified");
        }
        return shot;
      });
    }

    return pkg;
  }

  async buildVideoPromptSequence(
    product: string,
    color: string,
    sceneDescriptions: string[],
    platform: string
  ): Promise<ShotPrompt[]> {
    const productLine = detectProductLine(product);
    const colorDesc = getColorDescription(color);
    const lockedShapeText = getPromptShapeText(productLine, color);
    const shapeNegative = getShapeNegative(productLine);

    const userPrompt = `Build a ${platform} video prompt sequence for Hippo Float ${product} (${colorDesc}).

══ LOCKED SHAPE TEXT (verbatim in each shot) ══
${lockedShapeText}
══ END ══

SCENES:
${sceneDescriptions.map((s, i) => `${i + 1}. ${s}`).join("\n")}

For each scene, build a ShotPrompt optimized for AI video (Kling/Runway).
All shots must maintain visual continuity — same product color, same lighting, same location.
negative_prompt must include: "${shapeNegative}, ${ANCHOR_NEGATIVE}"

Return JSON array of ShotPrompt objects.`;

    const shots = await generateStructuredOutput<ShotPrompt[]>(userPrompt, {
      system: PROMPT_DIRECTOR_SYSTEM,
      temperature: 0.4,
      max_tokens: 4000,
    });

    return (Array.isArray(shots) ? shots : []).map((shot) => {
      if (!shot.full_prompt.includes("hippo float")) {
        shot.full_prompt = `${lockedShapeText}, ${ANCHOR_LOCKED}, ${shot.full_prompt}`;
      }
      return shot;
    });
  }

  async buildSignatureShot(product: string, color: string): Promise<ShotPrompt> {
    return this.buildSingleImagePrompt(
      product,
      color,
      "Signature underwater split shot — above waterline: model relaxing on float, below waterline: anchor system fully visible with blue rope, yellow buoy, submerged anchor bag. The most iconic Hippo Float shot.",
      "CINEMATIC_LUXURY"
    );
  }

  getNegativePrompt(product?: string): string {
    if (product) {
      const line = detectProductLine(product);
      return `${getShapeNegative(line)}, ${ANCHOR_NEGATIVE}, ${UNIVERSAL_NEGATIVE_PROMPT}`;
    }
    return `${ANCHOR_NEGATIVE}, ${UNIVERSAL_NEGATIVE_PROMPT}`;
  }

  buildQuickPrompt(product: string, color: string, environment: string): string {
    const line = detectProductLine(product);
    return promptEngine.buildImagePrompt({
      product: line,
      color,
      style: "LIFESTYLE_BEACH",
      environment,
      showAnchorSystem: true,
    });
  }
}

export const promptDirector = new PromptDirectorAgent();
export default promptDirector;

import { claudeStructured, createSystemPrompt, CLAUDE_SONNET } from "@/lib/claude";
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

// Locked SMV brand-treatment text — used verbatim in every shot
const ANCHOR_LOCKED =
  "SMV brand treatment applied: dark navy or violet-to-magenta gradient panel, uppercase letter-spaced gold eyebrow label, white headline text, gold and violet-magenta only as small accents, clean clinical whites, small SMV mark legible";

// Locked negative additions for SMV compliance and brand integrity
const ANCHOR_NEGATIVE =
  "cartoon icons, generic stock smiles, licensure guarantee overlay, passive income text, side hustle framing, wrong palette, altered SMV mark, invented credentials or clinical claims";

const PROMPT_DIRECTOR_SYSTEM = createSystemPrompt([
  `You are the Cinematic Prompt Director AI for Smart Medical Ventures (SMV).
You think like a Director of Photography on a premium clinical-education commercial shoot.

YOUR ONLY JOB: Add the creative scene layer around a LOCKED brand/scene description.
The locked scene text is always provided verbatim — you MUST copy it exactly into the full_prompt. Do NOT rephrase, summarize, or change it. It is the ground truth.

${PRODUCT_SHAPES_REFERENCE}

## CAMERA LANGUAGE:
- Wide establishing: "cinematic wide shot, 24mm lens, clean operatory composition"
- Hero: "medium hero shot, 50mm lens, subject center frame, shallow depth of field f/1.8"
- Intimate: "35mm handheld-feel stabilized, intimate training framing"
- Overhead: "top-down shot of a tray setup or skill check, 35mm, clean composition"
- Split panel: "split-panel brand shot, top clinical scene, bottom navy/gradient text panel"
- Close detail: "85mm macro detail shot, razor-thin depth of field f/1.4, smooth bokeh background"

## CAMERA LOOKS:
- Premium: "ARRI Alexa Mini LF cinematic look, clean 2.39:1 widescreen"
- Social: "Sony Venice look, spherical 9:16 vertical format"
- Natural: "RED Komodo look, natural color science, organic feel"

## LIGHTING PRESETS:
- Warm key: "warm professional key light 5600K, soft directional fill, flattering, premium DSLR look"
- Clinical noon: "bright even clinical daylight 6500K, clean neutral whites, crisp visibility"
- Restrained gold: "warm restrained tone 3200K, soft gold accent light, calm confident mood"
- Studio panel: "clean studio light on a dark navy or gradient brand panel, even flattering fill"

## APPROVED ENVIRONMENTS:
- "real dental operatory with chairside assisting in progress, clean clinical setting"
- "sterilization and instrument reprocessing area, professional and organized"
- "radiography / imaging training station with adult learners in navy scrubs"
- "tray setup and instrument identification station, instructor-led skill check"

## SUBJECT DIRECTION:
- "adult learner in clean navy scrubs, focused and competent, natural professional expression"
- "instructor validating a chairside skill with a small group of learners, candid training moment"
- "brand-only shot, no people, dark navy or gradient panel with white headline text and gold eyebrow"

## OUTPUT FORMAT:
Return JSON ShotPrompt or PromptPackage. CRITICAL: the full_prompt field MUST include the exact locked scene description text provided to you — do not alter it.`,
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

    const userPrompt = `Build a premium AI image prompt for this Smart Medical Ventures (SMV) shot.

══ LOCKED SCENE TEXT (copy verbatim into full_prompt — do not change) ══
${lockedShapeText}
══ END LOCKED TEXT ══

══ LOCKED SMV BRAND TREATMENT (include verbatim in full_prompt) ══
${ANCHOR_LOCKED}
══ END LOCKED ══

CREATIVE BRIEF:
- Accent: ${colorDesc}
- Concept/Scene: ${concept}
- Style: ${style}

BUILD THE full_prompt by:
1. Start with the exact locked scene text above
2. Add: the subject description (adult learners / instructors in navy scrubs)
3. Add: the clinical environment (real operatory, sterilization, radiography, tray setup)
4. Add: the locked SMV brand treatment text
5. Add: camera specs, lens, lighting, style modifier
6. End with quality anchors: "photorealistic, premium commercial photography quality, 8K, credible clinical detail, no cartoon icons, no generic stock smiles"

Return a JSON ShotPrompt. The negative_prompt must include: "${productNegative}"`;

    const shot = await claudeStructured<ShotPrompt>(userPrompt, {
      model: CLAUDE_SONNET,
      system: PROMPT_DIRECTOR_SYSTEM,
      temperature: 0.4,
      max_tokens: 1200,
    });

    // Safety net: if AI didn't include the locked shape text, inject it
    if (!shot.full_prompt.toLowerCase().includes("smv")) {
      shot.full_prompt = `${lockedShapeText}, ${ANCHOR_LOCKED}, ${shot.full_prompt}`;
    }
    if (!shot.negative_prompt || shot.negative_prompt.length < 20) {
      shot.negative_prompt = productNegative;
    }
    shot.product_rules_applied = shot.product_rules_applied ?? [];
    if (!shot.product_rules_applied.includes("shape locked")) {
      shot.product_rules_applied.push("scene locked", "SMV brand treatment", "compliance verified");
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

    const userPrompt = `Convert this Smart Medical Ventures (SMV) script into a complete shot prompt package.

══ LOCKED SCENE TEXT (must appear verbatim in every shot's full_prompt) ══
${lockedShapeText}
══ END LOCKED ══

══ LOCKED SMV BRAND TREATMENT (include in every shot) ══
${ANCHOR_LOCKED}
══ END LOCKED ══

PROGRAM: ${product} (${colorDesc})
SCRIPT:
${JSON.stringify(script, null, 2)}

For EACH scene, build a ShotPrompt where:
- full_prompt STARTS with the locked scene text, then adds subject/environment/lighting/camera
- negative_prompt includes: "${shapeNegative}, ${ANCHOR_NEGATIVE}"
- generation_tool: use kling or runway for video scenes, midjourney for hero stills, dalle3 for brand/detail shots
- Maintain visual continuity — same SMV brand treatment, same accent, same lighting style across all shots

Return complete JSON PromptPackage with all shots.`;

    const pkg = await claudeStructured<PromptPackage>(userPrompt, {
      model: CLAUDE_SONNET,
      system: PROMPT_DIRECTOR_SYSTEM,
      temperature: 0.4,
      max_tokens: 4000,
    });

    // Safety net: ensure every shot has the locked shape text
    if (pkg.shots) {
      pkg.shots = pkg.shots.map((shot) => {
        if (!shot.full_prompt.toLowerCase().includes("smv")) {
          shot.full_prompt = `${lockedShapeText}, ${ANCHOR_LOCKED}, ${shot.full_prompt}`;
        }
        shot.product_rules_applied = shot.product_rules_applied ?? [];
        if (!shot.product_rules_applied.includes("shape locked")) {
          shot.product_rules_applied.push("scene locked", "SMV brand treatment", "compliance verified");
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

    const userPrompt = `Build a ${platform} video prompt sequence for Smart Medical Ventures (SMV) ${product} (${colorDesc}).

══ LOCKED SCENE TEXT (verbatim in each shot) ══
${lockedShapeText}
══ END ══

SCENES:
${sceneDescriptions.map((s, i) => `${i + 1}. ${s}`).join("\n")}

For each scene, build a ShotPrompt optimized for AI video (Kling/Runway).
All shots must maintain visual continuity — same SMV brand treatment, same accent, same lighting, same setting.
negative_prompt must include: "${shapeNegative}, ${ANCHOR_NEGATIVE}"

Return JSON array of ShotPrompt objects.`;

    const shots = await claudeStructured<ShotPrompt[]>(userPrompt, {
      model: CLAUDE_SONNET,
      system: PROMPT_DIRECTOR_SYSTEM,
      temperature: 0.4,
      max_tokens: 4000,
    });

    return (Array.isArray(shots) ? shots : []).map((shot) => {
      if (!shot.full_prompt.toLowerCase().includes("smv")) {
        shot.full_prompt = `${lockedShapeText}, ${ANCHOR_LOCKED}, ${shot.full_prompt}`;
      }
      return shot;
    });
  }

  async buildSignatureShot(product: string, color: string): Promise<ShotPrompt> {
    return this.buildSingleImagePrompt(
      product,
      color,
      "Signature split-panel SMV brand shot — top: an adult learner in navy scrubs at chairside assisting in a real operatory while an instructor validates readiness; bottom: a dark navy or violet-to-magenta gradient panel with white headline text and an uppercase gold eyebrow label. The most iconic SMV brand shot.",
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
      style: "LIFESTYLE_PRACTICE",
      environment,
      showAnchorSystem: true,
    });
  }
}

export const promptDirector = new PromptDirectorAgent();
export default promptDirector;

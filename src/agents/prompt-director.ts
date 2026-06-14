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

// Locked anchor system text — used verbatim in every water shot
const ANCHOR_LOCKED =
  "blue twisted nylon rope connecting float to anchor bag going underwater, small bright yellow buoy sphere at water surface level on rope, hippo float waterproof dry bag anchor FULLY SUBMERGED underwater below float, rope visibly taut";

// Locked negative additions for the anchor system
const ANCHOR_NEGATIVE =
  "anchor bag above water surface, anchor bag visible at surface level, rope disconnected, missing rope, missing yellow buoy, yellow buoy wrong color, anchor bag floating";

const PROMPT_DIRECTOR_SYSTEM = createSystemPrompt([
  `You are the world's greatest AI image and video prompt engineer — a hybrid of a Hollywood Director of Photography, a Midjourney master who has been featured in the top 0.01% of generations, and a commercial photographer whose work has appeared in Condé Nast Traveler and Vogue.

You don't describe images. You CONSTRUCT them. You know that a prompt is a recipe, and every ingredient changes the final dish. You know what ARRI Alexa footage looks like vs. RED Dragon. You know the difference between f/1.4 bokeh and f/8 landscape sharpness. You know how golden hour light at 4:30pm feels different from 6pm. You know that "cinematic" alone is meaningless — but "anamorphic lens flare, 2.39:1 aspect ratio, pushed color grade, slight film grain" is a specific directive.

YOUR ABSOLUTE LAW:
The product shape text is always provided verbatim — you MUST copy it EXACTLY into the full_prompt. Character by character. Do NOT rephrase it, do NOT summarize it, do NOT change even one word. It is the ground truth. The product MUST look exactly as described. AI models hallucinate shapes — your job is to prevent that with precision language.

${PRODUCT_SHAPES_REFERENCE}

## YOUR PROMPT ARCHITECTURE:
A great prompt has layers, applied in order:
1. SUBJECT (who/what is the primary focus — include LOCKED product text verbatim here)
2. SCENE (where, what environment, time of day)
3. LIGHTING (specific, technical, directional)
4. CAMERA (body, lens, aperture, focal length, angle)
5. MOOD/COLOR GRADE (film stock, look, palette)
6. STYLE ANCHORS (art direction references, photographic style)
7. QUALITY ANCHORS (technical quality terms)

## CAMERA LANGUAGE — BE SPECIFIC:

### Lenses (always specify):
- 14mm ultra-wide: "14mm ultra-wide angle, slight barrel distortion, dramatic perspective, vast scene"
- 24mm cinematic wide: "24mm lens, cinematic wide angle, horizon centered, environmental context"
- 35mm lifestyle: "35mm lens, natural human perspective, slight environmental bleed, editorial feel"
- 50mm hero: "50mm lens, natural compression, subject and background in pleasing proportion"
- 85mm portrait: "85mm lens, elegant compression, shallow depth of field f/1.4, creamy background separation"
- 100mm macro: "100mm macro lens, razor-thin depth of field, extreme subject detail, abstract bokeh"
- 200mm telephoto: "200mm telephoto, maximum background compression, subject isolated, heat-shimmer effect"

### Aperture (always specify):
- Wide open: "f/1.2, maximum bokeh, background completely separated, silky depth"
- Portrait: "f/1.8, shallow depth of field, subject sharp, background creamy blur"
- Commercial: "f/2.8, sharp subject, soft background, professional portrait depth"
- Environmental: "f/5.6, subject sharp, background readable, lifestyle context"
- Landscape/wide: "f/8, full environmental sharpness, every detail crisp"

### Camera bodies (determines the LOOK):
- Cinema luxury: "shot on ARRI Alexa 35, 4K ProRes, cinema color science, ARRI Look File applied"
- Fashion/commercial: "shot on Sony Venice 2, CineAlt-Venice2 color, luxury skin tones"
- Cinematic social: "shot on RED Dragon 8K, DragonColor2, Redgamma4, organic highlights"
- Authentic lifestyle: "shot on Canon EOS R5, natural color science, Dual Pixel AF smooth"
- Editorial still: "shot on Hasselblad X2D, medium format rendering, unmatched tonal gradation"
- TikTok native: "shot on iPhone 15 Pro, ProRes Log, cinematic mode, shallow depth"

### Shot types:
- Wide establishing: "cinematic wide establishing shot, 24mm, scene-setting, product in environment"
- Product hero: "product hero shot, 50mm, center frame, shallow depth f/2.8, commercial quality"
- Lifestyle intimate: "35mm lifestyle, handheld-feel (stabilized), intimate framing, natural moment"
- Aerial: "DJI Inspire 3 drone, 24mm, bird's eye 90° OR 45° Dutch angle"
- Underwater split: "split waterline shot, waterline bisects frame EXACTLY horizontally at center, above-water world and underwater world simultaneously visible, UW housing anamorphic"
- Close product detail: "85mm macro, razor-thin depth, product texture and material detail, abstract"
- Dynamic action: "follow shot, gimbal, smooth tracking, subject moving through environment"
- POV first-person: "first-person POV, handheld feel, immersive, looking down at float from rider's perspective"

## LIGHTING — THE SOUL OF EVERY SHOT:

### Golden Hour (the signature Hippo Float look):
"warm golden hour sunlight, 45-minute-before-sunset, 2700K-3200K warm tone, directional side lighting from camera-left, long shadows stretching across water, sun-kissed skin glow, catchlights in eyes, warm highlights on water surface, specular glints, deep rich shadows"

### Tropical Noon (product detail hero):
"tropical midday sun, 6500K daylight balanced, overhead soft light diffused by thin clouds, crystal-clear water visibility down to 10 meters, even fill light, minimal shadows, vibrant color saturation, no harsh shadows"

### Sunset (emotional/brand film):
"dramatic sunset, orange-to-pink gradient sky, 3000K warm orange tone, strong backlit subject, rim light on model, water reflections catching sunset colors, moody atmosphere, slight lens flare from direct sun, silhouette potential"

### Pool Luxury (resort shots):
"luxury resort pool, turquoise-teal water reflected light from below, even flattering fill from sky, soft white-balance neutral, crisp white stone pool surround, subtle caustics from water movement on subjects"

### Underwater:
"underwater photography, blue-green water column, sunbeams penetrating from surface (god rays), particles in water, SCUBA or freedive perspective, wide angle 10.5mm fisheye, vivid colors, underwater strobe fill"

## APPROVED HERO ENVIRONMENTS:

### Ocean:
"crystal clear turquoise-to-cobalt Caribbean water, white sand seabed visible 3 meters below, palm trees in soft background bokeh, horizon line, few white clouds, no other swimmers in frame"

### Infinity Pool:
"luxury 5-star resort infinity pool, black-tiled pool edge, ocean merging with pool at horizon, tropical jungle in background, white sun loungers, architecture suggesting Maldives or Bali, late afternoon light"

### Lagoon:
"secluded natural tropical lagoon, freshwater-meets-sea, green volcanic rock formations, lush palm and tropical foliage, glass-smooth water surface, no tourists, private paradise feeling"

### Mediterranean:
"Mediterranean sea, deep blue-to-turquoise, white cliffside in background, Greek island or Amalfi coast architecture visible, warm afternoon light"

## SUBJECT DIRECTION:

### Single person:
"attractive fit woman/man, 28-35, sun-kissed naturally tan skin, effortlessly styled wet hair, premium designer swimwear, completely relaxed expression, zero tension in body, genuine ease, natural — not posed"

### Group/social:
"group of 3-4 friends, diverse representation, 25-35 age, premium swimwear, genuine mid-laugh candid moment, no one looking at camera, natural social energy"

### Product-only hero (no people):
"product-only beauty shot, no human subjects, pure product photography, magazine-quality commercial still, product as sculpture"

## FOR VIDEO GENERATION (Kling AI / Runway Gen-3 / Sora):
Motion direction is everything. Specify:
- Camera motion: "slow push in", "orbit left", "pull back and reveal", "static locked off", "slight camera drift", "parallax movement"
- Subject motion: "model slowly turns toward camera", "gentle float rocking", "hair moves in light breeze", "water ripples from gentle movement"
- Environment motion: "palm fronds moving in wind", "water shimmer", "clouds drifting slowly"
- Speed: "ultra-slow motion 240fps", "real-time", "slightly undercranked 22fps film look"
- Duration: specify seconds for each motion beat

## COLOR GRADING LANGUAGE:
- Premium luxury: "lifted blacks, controlled highlights, warm midtones, teal-orange split tone, film emulation, subtle grain"
- Natural vibrant: "clean whites, punchy saturation, clean shadows, warm skin tones, Caribbean palette"
- Moody cinematic: "crushed blacks, desaturated midtones, warm skin only color, teal shadows, orange highlights"
- Social/bright: "bright exposure, airy feel, warm tone, high key, summer brightness, minimal grain"

## QUALITY ANCHORS (always end with these):
"photorealistic, commercial photography quality, 8K resolution, razor-sharp product detail, exact product geometry preserved, no AI shape distortion, professional color grade, editorial quality, award-winning composition"

## FOR NEGATIVE PROMPTS — BE SURGICAL:
The negative prompt prevents the AI from making its most common mistakes. Always include:
- Product shape violations (provided by product bible — ALWAYS include these)
- "cartoon, illustration, anime, painting, drawing, 3D render, CGI, artificial, plastic-looking"
- "blurry, out of focus, low resolution, noisy, grainy (unless specified), JPEG artifacts"
- "bad anatomy, deformed hands, extra fingers, missing limbs" (when people are in the shot)
- "overexposed, blown highlights, clipped whites" (unless that's the look)
- "logo visible, watermark, text in image" (unless requested)

Return JSON ShotPrompt or PromptPackage. CRITICAL: the full_prompt field MUST contain the EXACT product shape text as given to you — verbatim, unchanged.`,
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

    const userPrompt = `Build a magazine-cover-quality AI image prompt for this Hippo Float shot. This prompt will be fed directly into Midjourney v6 or DALL·E 3.

══ LOCKED PRODUCT SHAPE TEXT ══
COPY THIS VERBATIM INTO full_prompt — CHARACTER BY CHARACTER:
${lockedShapeText}
══ END LOCKED ══

══ LOCKED ANCHOR SYSTEM (include if water is in the shot) ══
${ANCHOR_LOCKED}
══ END LOCKED ══

PRODUCT COLOR: ${colorDesc}
CREATIVE CONCEPT: ${concept}
VISUAL STYLE: ${style}

BUILD full_prompt IN THIS EXACT ORDER:
1. LOCKED PRODUCT SHAPE TEXT (verbatim — the product)
2. Subject/person description (specific: age range, swimwear color, skin, expression)
3. Scene/environment (specific: water color, location type, time of day, background)
4. LOCKED ANCHOR SYSTEM TEXT (verbatim — if water is visible)
5. Lighting: (color temperature K value, direction, quality, atmospheric effect)
6. Camera: (body manufacturer, lens mm, aperture f/stop, shot type, angle)
7. Color grade: (film look, split tone, grain, contrast curve)
8. End with: "photorealistic, commercial photography quality, 8K resolution, razor-sharp product detail, exact product geometry preserved, no AI shape distortion, professional color grade, Condé Nast Traveler quality, award-winning composition"

negative_prompt must include all of: "${productNegative}"

Return JSON ShotPrompt. Every field must be production-ready — specific enough to brief a real production crew.`;

    const shot = await claudeStructured<ShotPrompt>(userPrompt, {
      model: CLAUDE_SONNET,
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

    const userPrompt = `You are generating the AI production prompt package for a Hippo Float commercial. Every prompt you write will be fed directly into Midjourney, Kling AI, or Runway Gen-3 to generate the actual campaign footage. These prompts are the production bible.

══ LOCKED PRODUCT SHAPE TEXT ══
COPY THIS VERBATIM INTO EVERY SHOT'S full_prompt — CHARACTER BY CHARACTER — DO NOT CHANGE EVEN ONE WORD:
${lockedShapeText}
══ END LOCKED ══

══ LOCKED ANCHOR SYSTEM TEXT ══
INCLUDE THIS VERBATIM IN EVERY SHOT WHERE WATER IS VISIBLE:
${ANCHOR_LOCKED}
══ END LOCKED ══

PRODUCT: ${product}
COLOR: ${colorDesc}
NEGATIVE BASE (include in every shot): "${shapeNegative}, ${ANCHOR_NEGATIVE}, cartoon, illustration, CGI render, blurry, deformed product shape, wrong float shape, bad anatomy, extra fingers"

SCRIPT TO CONVERT:
${JSON.stringify(script, null, 2)}

FOR EACH SCENE, build a production-ready ShotPrompt:

full_prompt CONSTRUCTION ORDER:
1. LOCKED PRODUCT SHAPE TEXT (verbatim above) — never skip this
2. Subject/model description (specific: skin tone, swimwear, expression, body language)
3. Environment (specific location type, water color, background elements)
4. LOCKED ANCHOR SYSTEM TEXT (verbatim, if water is in the shot)
5. Lighting (color temperature K, direction, quality, time of day — be specific)
6. Camera (body, lens mm, aperture f/stop, shot angle)
7. Color grade / film look (teal-orange, warm luxury, natural, etc.)
8. Quality anchors: "photorealistic, commercial photography quality, 8K, razor-sharp product detail, exact product geometry preserved, no AI shape distortion, professional color grade, editorial quality"

generation_tool selection:
- Video scenes (movement specified in script) → "kling" (preferred) or "runway"
- Hero product still (product centered, no motion) → "midjourney"
- Product beauty shot (close detail, no people) → "dalle3"
- Aerial / drone shots → "runway"
- Underwater shots → "kling"

color_grade_direction: one unified look for the entire campaign (e.g., "warm teal-orange split grade, lifted blacks, golden hour warmth, slight film grain overlay, ARRI look")

continuity_guide: describe what stays identical across all shots (product color, swimwear color on model, water environment type, lighting temperature) so AI generations feel like one cohesive shoot.

Return complete JSON PromptPackage. Every field in every ShotPrompt must be filled — no placeholders, no "TBD", no empty strings.`;

    const pkg = await claudeStructured<PromptPackage>(userPrompt, {
      model: CLAUDE_SONNET,
      system: PROMPT_DIRECTOR_SYSTEM,
      temperature: 0.5,
      max_tokens: 6000,
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

    const shots = await claudeStructured<ShotPrompt[]>(userPrompt, {
      model: CLAUDE_SONNET,
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

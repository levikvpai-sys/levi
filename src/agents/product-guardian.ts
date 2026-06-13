import { generateCompletion, generateStructuredOutput, createSystemPrompt } from "@/lib/openai";
import { PRODUCT_RULES_TEXT } from "@/brand/product-bible";

export interface ProductValidationResult {
  passed: boolean;
  score: number;
  violations: string[];
  warnings: string[];
  corrections: string[];
  approved_concept?: string;
}

const PRODUCT_GUARDIAN_SYSTEM = createSystemPrompt([
  `You are the Product Guardian AI for Hippo Float — the most critical agent in the creative system.

Your ONLY job is to protect the accuracy and integrity of Hippo Float products in all creative content.

${PRODUCT_RULES_TEXT}

## THE 4 HIPPO FLOAT PRODUCT LINES:

### 1. HIPPO FLOAT JOY (HFJOY) — Luxury Recliner/Lounger
- Shape: Semi-reclined pool chair/chaise lounge with elevated backrest and headrest
- NOT a flat mat, NOT a ring — it has a distinct L/chaise shape
- Colors: Pink, Blue, Flower Print Orange, Citrus Print Green
- MSRP $89.99

### 2. HIPPO FLOAT CHILL (HFCHILL) — U-Shape Ring Float
- Shape: U-shaped horseshoe ring — person sits IN the center hole, legs dangling
- Has mesh/fabric seat in center opening
- Colors: Pink, Orange, Blue, Flower Print Orange, Citrus Print Green
- Anchor bag is always GREEN regardless of float color
- MSRP $69.99

### 3. HIPPO FLOAT FUN (HFFUN) — Cylindrical Torpedo Tube
- Shape: Large elongated oval cylinder — like a giant premium pool noodle
- You straddle or hug it, not lie flat on it
- Colors: Pink, Blue, Green, Flower Print Orange
- MSRP $49.99

### 4. HIPPO FLOAT VIBES (HFVIBES) — Flat Mat with Texture
- Shape: Wide flat rectangular mat with circular drainage holes/texture dots across surface
- You lie FLAT on top — it's a mat, not a chair or ring
- Colors: Pink, Orange, Flower Print Orange, Blue, Citrus Print Green
- MSRP $69.99

## UNIVERSAL ANCHOR SYSTEM (ALL PRODUCTS):
- 2-in-1 Carry Bag & Anchor — waterproof dry bag fills with water/sand = anchor weight
- Blue twisted nylon rope connects float to anchor bag
- Small bright yellow buoy sphere marks rope at water surface
- Carabiner clips at connection points
- Anchor bag ALWAYS underwater — NEVER on surface
- Yellow buoy ALWAYS at water surface level on the rope

## YOUR VALIDATION CHECKLIST:
For every creative brief or prompt, check:
1. Is the product shape described correctly for the specific product line?
2. Is the anchor system correctly depicted (bag underwater, rope visible, yellow buoy present)?
3. Are the colors accurate and not changed?
4. Is the 'hippo' logo preserved?
5. Are there any invented accessories or modifications?
6. Is the product mixed up with another product line?
7. Are physical connections physically possible and accurate?

## OUTPUT FORMAT:
Always respond with a JSON object:
{
  "passed": boolean,
  "score": 1-10,
  "violations": ["list of rule violations"],
  "warnings": ["list of potential issues"],
  "corrections": ["specific corrections to apply"],
  "approved_concept": "corrected version of the concept if fixable"
}`,
]);

export class ProductGuardianAgent {
  async validateConcept(brief: string): Promise<ProductValidationResult> {
    const prompt = `Validate this creative concept against Hippo Float product rules:

BRIEF: ${brief}

Check for product accuracy, anchor system accuracy, color accuracy, shape accuracy, and any violations. Return JSON validation result.`;

    const result = await generateStructuredOutput<ProductValidationResult>(prompt, {
      system: PRODUCT_GUARDIAN_SYSTEM,
      temperature: 0.1,
      max_tokens: 1000,
    });

    return result;
  }

  async validatePrompt(imagePrompt: string): Promise<ProductValidationResult> {
    const prompt = `Validate this AI image generation prompt for Hippo Float product accuracy:

PROMPT: ${imagePrompt}

Specifically check:
1. Is the product shape/type correctly described?
2. Is the anchor system correctly described (bag underwater, blue rope, yellow buoy)?
3. Are colors accurate?
4. Are there any forbidden modifications?

Return JSON validation result.`;

    return await generateStructuredOutput<ProductValidationResult>(prompt, {
      system: PRODUCT_GUARDIAN_SYSTEM,
      temperature: 0.1,
      max_tokens: 1000,
    });
  }

  async enforceRules(concept: string, product: string): Promise<string> {
    const prompt = `Rewrite this creative concept to be 100% compliant with Hippo Float product rules.

PRODUCT: ${product}
CONCEPT: ${concept}

Fix any product inaccuracies, add missing anchor system details, correct shape descriptions, ensure all visual rules are met. Return ONLY the corrected concept text.`;

    return await generateCompletion(prompt, {
      system: PRODUCT_GUARDIAN_SYSTEM,
      temperature: 0.2,
      max_tokens: 500,
    });
  }

  async getProductRules(product: string): Promise<string> {
    const prompt = `Provide a concise list of the most critical visual rules for the ${product} product line that must be followed in all creative content. Format as a numbered list.`;

    return await generateCompletion(prompt, {
      system: PRODUCT_GUARDIAN_SYSTEM,
      temperature: 0.1,
      max_tokens: 500,
    });
  }
}

export const productGuardian = new ProductGuardianAgent();
export default productGuardian;

import { generateCompletion, generateStructuredOutput, createSystemPrompt } from "@/lib/openai";
import { PRODUCT_RULES_TEXT, PRODUCT_SHAPES_REFERENCE, ANCHOR_SYSTEM_RULES_TEXT } from "@/brand/product-bible";

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

## YOUR VALIDATION CHECKLIST:
For every creative brief or prompt, check:
1. Is the correct product LINE specified (Joy/Chill/Fun/Vibes)?
2. Is the product SHAPE described correctly for the specific line?
   - Joy = reclined chaise lounge (NOT flat, NOT ring)
   - Chill = U-shaped horseshoe ring (person sits IN center hole)
   - Fun = elongated cylinder tube (straddle/hug it)
   - Vibes = flat rectangular mat with circular texture holes
3. Is the anchor system correctly depicted?
   - Bag UNDERWATER (never on surface)
   - Blue rope visible and connected
   - Yellow buoy at water surface level
4. Are the colors accurate and from the approved list for that product line?
5. Is the 'hippo' logo preserved exactly?
6. Are there any invented accessories not on the real product?
7. For Chill: is the anchor bag correctly GREEN (not matching float color)?
8. Are physical rope connections physically possible?

## OUTPUT FORMAT — STRICT JSON:
{
  "passed": boolean,
  "score": number (1-10),
  "violations": ["exact description of each rule violation"],
  "warnings": ["potential issues that should be watched"],
  "corrections": ["specific text corrections to apply"],
  "approved_concept": "corrected version of the concept if fixable, null if not"
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

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
  `You are the Product Guardian AI for Smart Medical Ventures (SMV) — the most critical agent in the creative system.

Your ONLY job is to protect the accuracy, positioning, and compliance integrity of SMV in all creative content.

${PRODUCT_RULES_TEXT}

## YOUR VALIDATION CHECKLIST:
For every creative brief or prompt, check:
1. Is SMV positioned correctly — a practice-based dental assisting school launch system (subscription model), NOT a course, franchise-with-royalties, or "side hustle school"?
2. Is the correct launch path named?
   - Standard = low-entry subscription launch path
   - Premium = expanded guided implementation
   - California Premium = Premium tuned for California (State requirements vary)
   - Clinical Ready(TM) = demonstrated-readiness curriculum model
3. Is Clinical Ready(TM) described correctly — students advance by performance gates, skill validation, documented remediation, externship readiness (NOT grade averages alone, NOT "perfect assistants")?
4. Are the revenue facts correct — the school keeps tuition, NO SMV royalties, NO per-student SMV fees?
5. Are compliance guardrails respected — no licensure guarantees; "State requirements vary" and "Practice verification required" available; "guided launch support" / "Done-for-You state requirements" instead of guarantees?
6. Is the SMV mark and palette (navy/violet-magenta/gold) preserved, with no cartoon icons or generic stock smiles?
7. Are there any invented clinical claims or credentials?
8. Is any forbidden language present (passive income, free money, side hustle, get-rich-quick)?

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
    const prompt = `Validate this creative concept against Smart Medical Ventures (SMV) rules:

BRIEF: ${brief}

Check for correct SMV positioning, correct plan names, Clinical Ready(TM) accuracy, revenue facts (no royalties/per-student fees), compliance guardrails (no licensure guarantees), and any violations. Return JSON validation result.`;

    const result = await generateStructuredOutput<ProductValidationResult>(prompt, {
      system: PRODUCT_GUARDIAN_SYSTEM,
      temperature: 0.1,
      max_tokens: 1000,
    });

    return result;
  }

  async validatePrompt(imagePrompt: string): Promise<ProductValidationResult> {
    const prompt = `Validate this AI image generation prompt for Smart Medical Ventures (SMV) accuracy:

PROMPT: ${imagePrompt}

Specifically check:
1. Is the scene an appropriate, credible SMV setting (real dental operatory / training, navy scrubs, SMV navy/gold treatment)?
2. Is SMV positioned correctly (practice-based dental assisting school launch), with no licensure guarantees?
3. Is the palette / SMV mark correct, with no cartoon icons or generic stock smiles?
4. Are there any forbidden elements (passive-income/side-hustle framing, guarantee overlays)?

Return JSON validation result.`;

    return await generateStructuredOutput<ProductValidationResult>(prompt, {
      system: PRODUCT_GUARDIAN_SYSTEM,
      temperature: 0.1,
      max_tokens: 1000,
    });
  }

  async enforceRules(concept: string, product: string): Promise<string> {
    const prompt = `Rewrite this creative concept to be 100% compliant with Smart Medical Ventures (SMV) rules.

PROGRAM: ${product}
CONCEPT: ${concept}

Fix any positioning inaccuracies, correct plan names and Clinical Ready(TM) descriptions, add missing compliance notes ("State requirements vary", "Practice verification required"), remove any licensure guarantees or passive-income/side-hustle language, and ensure the revenue facts (no royalties, no per-student fees) are correct. Return ONLY the corrected concept text.`;

    return await generateCompletion(prompt, {
      system: PRODUCT_GUARDIAN_SYSTEM,
      temperature: 0.2,
      max_tokens: 500,
    });
  }

  async getProductRules(product: string): Promise<string> {
    const prompt = `Provide a concise list of the most critical positioning and compliance rules for the ${product} program that must be followed in all creative content. Format as a numbered list.`;

    return await generateCompletion(prompt, {
      system: PRODUCT_GUARDIAN_SYSTEM,
      temperature: 0.1,
      max_tokens: 500,
    });
  }
}

export const productGuardian = new ProductGuardianAgent();
export default productGuardian;

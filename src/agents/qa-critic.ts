import { generateStructuredOutput, createSystemPrompt } from "@/lib/openai";
import { PRODUCT_RULES_TEXT } from "@/brand/product-bible";
import { BRAND_VOICE_TEXT } from "@/brand/brand-bible";
import type { Script } from "./script-studio";
import type { ShotPrompt } from "./prompt-director";
import type { Caption } from "./social-agent";

export interface QAReport {
  passed: boolean;
  overall_score: number;
  product_accuracy_score: number;
  brand_alignment_score: number;
  creative_quality_score: number;
  issues: QAIssue[];
  suggestions: string[];
  verdict: "approve" | "revise" | "reject";
  revision_notes?: string;
}

export interface QAIssue {
  severity: "critical" | "major" | "minor";
  category: "product" | "brand" | "creative" | "technical";
  issue: string;
  fix: string;
}

const QA_SYSTEM = createSystemPrompt([
  `You are the Quality Assurance Critic AI for Hippo Float — the last line of defense before anything goes public.

You are RUTHLESS and PRECISE. You catch every mistake before it damages the brand.

${PRODUCT_RULES_TEXT}

${BRAND_VOICE_TEXT}

## HIPPO FLOAT PRODUCTS — SHAPE QUICK REFERENCE:
- **JOY**: Semi-reclined CHAISE LOUNGE shape — NOT flat, has distinct backrest
- **CHILL**: U-SHAPE horseshoe ring — person sits in center opening
- **FUN**: CYLINDER torpedo tube — elongated oval, you straddle it
- **VIBES**: FLAT RECTANGULAR MAT — has circular texture holes, you lie flat on it

## YOUR QA CHECKLIST:

### PRODUCT ACCURACY (weight: 40%):
□ Product shape correctly described?
□ Product line not confused with another? (JOY ≠ VIBES ≠ CHILL ≠ FUN)
□ Anchor system correctly depicted?
  - Anchor bag underwater? (NEVER on surface)
  - Blue rope visible and connected?
  - Yellow buoy at water surface?
□ Colors accurate? (not changed without authorization)
□ 'hippo' logo preserved?
□ No invented accessories?
□ Physical connections physically possible?

### BRAND ALIGNMENT (weight: 30%):
□ Tone is premium, not discount?
□ No forbidden words (cheap, affordable, discount, kids toy)?
□ Environment is appropriate (crystal clear water, luxury setting)?
□ Models/subjects look premium and aspirational?
□ Copy/script sounds like a luxury brand?
□ Emotional arc is appropriate?

### CREATIVE QUALITY (weight: 30%):
□ Hook is strong enough to stop scrolling?
□ Message is clear?
□ CTA is present and effective?
□ Pacing makes sense?
□ Visual ideas are achievable?
□ Platform-appropriate format?

## SCORING:
- 9-10: Approve immediately
- 7-8: Approve with minor notes
- 5-6: Revise — specific issues noted
- 1-4: Reject — fundamental problems

## OUTPUT FORMAT:
Return JSON QAReport with all fields.

SEVERITY LEVELS:
- critical: Must fix before publishing — product accuracy errors, brand violations
- major: Should fix — quality significantly impacted
- minor: Nice to fix — small improvements`,
]);

export class QACriticAgent {
  async reviewScript(script: Script): Promise<QAReport> {
    const prompt = `QA REVIEW: Hippo Float Video Script

SCRIPT TO REVIEW:
${JSON.stringify(script, null, 2)}

Perform full QA review. Check:
1. Does the script accurately describe the product?
2. Is the anchor system depicted correctly in relevant scenes?
3. Is the brand tone premium and appropriate?
4. Is the hook strong enough for the platform?
5. Is the creative concept strong and achievable?

Return complete JSON QAReport.`;

    return await generateStructuredOutput<QAReport>(prompt, {
      system: QA_SYSTEM,
      temperature: 0.2,
      max_tokens: 1500,
    });
  }

  async reviewPrompt(shotPrompt: ShotPrompt | string): Promise<QAReport> {
    const promptText = typeof shotPrompt === "string" ? shotPrompt : shotPrompt.full_prompt;

    const prompt = `QA REVIEW: Hippo Float AI Generation Prompt

PROMPT TO REVIEW:
${promptText}

Check:
1. Is the product shape correctly described?
2. Is the anchor system correctly included?
3. Are colors specified correctly?
4. Are there any instructions that would produce wrong product?
5. Is the visual direction appropriate for the brand?

Return complete JSON QAReport.`;

    return await generateStructuredOutput<QAReport>(prompt, {
      system: QA_SYSTEM,
      temperature: 0.2,
      max_tokens: 1000,
    });
  }

  async reviewCaption(caption: Caption): Promise<QAReport> {
    const prompt = `QA REVIEW: Hippo Float Social Media Caption

CAPTION TO REVIEW:
Platform: ${caption.platform}
Text: ${caption.text}
Hashtags: ${caption.hashtags.join(" ")}
Full post: ${caption.full_post}

Check:
1. Is the tone premium and brand-appropriate?
2. Are there any forbidden words?
3. Is the hook strong?
4. Is the CTA clear?
5. Are hashtags appropriate?
6. Is the character count appropriate for the platform?

Return complete JSON QAReport.`;

    return await generateStructuredOutput<QAReport>(prompt, {
      system: QA_SYSTEM,
      temperature: 0.2,
      max_tokens: 1000,
    });
  }

  async reviewCampaignBrief(brief: string, product: string): Promise<QAReport> {
    const prompt = `QA REVIEW: Campaign Brief

PRODUCT: ${product}
BRIEF: ${brief}

Check if this brief will result in compliant, high-quality Hippo Float content.
Flag any red flags before production begins.

Return complete JSON QAReport.`;

    return await generateStructuredOutput<QAReport>(prompt, {
      system: QA_SYSTEM,
      temperature: 0.2,
      max_tokens: 1000,
    });
  }

  isPassingScore(report: QAReport): boolean {
    return report.overall_score >= 7 && report.verdict !== "reject";
  }

  hasCriticalIssues(report: QAReport): boolean {
    return report.issues.some((issue) => issue.severity === "critical");
  }
}

export const qaCritic = new QACriticAgent();
export default qaCritic;

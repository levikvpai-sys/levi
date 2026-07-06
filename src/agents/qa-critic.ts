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
  `You are the Quality Assurance Critic AI for Smart Medical Ventures (SMV) — the last line of defense before anything goes public.

You are RUTHLESS and PRECISE. You catch every mistake before it damages the brand or creates compliance risk.

${PRODUCT_RULES_TEXT}

${BRAND_VOICE_TEXT}

## SMV LAUNCH PATHS — QUICK REFERENCE:
- **Standard (SMV-STD)**: low-entry subscription launch path
- **Premium (SMV-PREM)**: expanded guided implementation
- **California Premium (SMV-CAPREM)**: Premium tuned for California (State requirements vary)
- **Clinical Ready(TM) (SMV-CR)**: demonstrated-readiness curriculum model

## YOUR QA CHECKLIST:

### COMPLIANCE (weight: 40%) — maps to product_accuracy_score:
□ No licensure guarantees anywhere?
□ Compliance notes present/permitted: "State requirements vary" and "Practice verification required"?
□ No "passive income", "free money", or "side hustle" language?
□ Revenue stated correctly (school keeps tuition; NO SMV royalties; NO per-student SMV fees)?
□ Clinical Ready(TM) described by demonstrated readiness (no "perfect assistants" / grade-average-only claims)?
□ Correct plan names used (Standard / Premium / California Premium)?
□ No invented clinical claims or credentials?

### BRAND ALIGNMENT (weight: 30%):
□ Voice is calm, confident, premium, and compliance-minded (not hype, not discount)?
□ No forbidden words (guaranteed licensure, passive income, side hustle, cheap, coupon)?
□ Setting is appropriate (real operatory / training, navy scrubs, clean clinical)?
□ Subjects look credible and professional (no staged stock smiles)?
□ Copy sounds like a premium clinical-education launch partner?
□ Correct SMV terminology used throughout?

### CREATIVE QUALITY (weight: 30%):
□ Hook is strong and clear?
□ Message is clear?
□ CTA is present and effective (e.g. Start Subscription Intake, Run the ROI, Explore Clinical Ready, Compare Plans)?
□ Pacing makes sense?
□ Visual ideas are achievable and clinically realistic?
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
    const prompt = `QA REVIEW: SMV Video Script

SCRIPT TO REVIEW:
${JSON.stringify(script, null, 2)}

Perform full QA review. Check:
1. Is SMV positioned accurately (practice-based dental assisting school launch) with correct plan names?
2. Is Clinical Ready(TM) / compliance handled correctly (no licensure guarantees; "State requirements vary" available; no passive-income/side-hustle language)?
3. Is the brand voice calm, confident, premium, and compliance-minded?
4. Is the hook strong and clear for the platform?
5. Is the creative concept strong, credible, and achievable?

Return complete JSON QAReport.`;

    return await generateStructuredOutput<QAReport>(prompt, {
      system: QA_SYSTEM,
      temperature: 0.2,
      max_tokens: 1500,
    });
  }

  async reviewPrompt(shotPrompt: ShotPrompt | string): Promise<QAReport> {
    const promptText = typeof shotPrompt === "string" ? shotPrompt : shotPrompt.full_prompt;

    const prompt = `QA REVIEW: SMV AI Generation Prompt

PROMPT TO REVIEW:
${promptText}

Check:
1. Is the scene a credible SMV setting (real operatory / training, navy scrubs)?
2. Is the SMV brand treatment correct (navy/violet-magenta/gold, SMV mark, no cartoon icons or stock smiles)?
3. Is the accent/palette specified correctly?
4. Are there any instructions that would produce off-brand or non-compliant imagery (e.g. licensure-guarantee overlays)?
5. Is the visual direction appropriate for the SMV brand?

Return complete JSON QAReport.`;

    return await generateStructuredOutput<QAReport>(prompt, {
      system: QA_SYSTEM,
      temperature: 0.2,
      max_tokens: 1000,
    });
  }

  async reviewCaption(caption: Caption): Promise<QAReport> {
    const prompt = `QA REVIEW: SMV Social Media Caption

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

PROGRAM: ${product}
BRIEF: ${brief}

Check if this brief will result in compliant, high-quality Smart Medical Ventures (SMV) content.
Flag any red flags before production begins — especially licensure guarantees, passive-income/side-hustle framing, or incorrect plan names.

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

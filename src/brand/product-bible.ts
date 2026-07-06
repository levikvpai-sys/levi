// Smart Medical Ventures (SMV) — Complete Product Bible (Launch Programs 2026)
// All SMV launch paths — authoritative source for all AI agents.
// NOTE: The ProductLine keys (JOY/CHILL/FUN/VIBES) are retained as stable internal
// identifiers so types and imports do not break. They map to SMV launch paths:
//   JOY = SMV Standard, CHILL = SMV Premium,
//   FUN = SMV California Premium, VIBES = Clinical Ready(TM) Curriculum Model.

export type ProductLine = "JOY" | "CHILL" | "FUN" | "VIBES";

export interface ProductColor {
  name: string;
  hex: string;
  sku: string;
  pattern?: string;
}

export interface ProductPricing {
  unit_cost: number;
  retail: number;
  msrp: number;
  margin: string;
  case_qty: number;
}

export interface ProductSpec {
  id: ProductLine;
  style_code: string;
  full_name: string;
  shape: string;
  shape_description: string;
  colors: ProductColor[];
  anchor_bag_color: string;
  pricing: ProductPricing;
  taglines: string[];
  features: string[];
  prompt_shape_text: string;
}

export interface AnchorSystem {
  name: string;
  dry_bag: string;
  rope: string;
  rope_color: string;
  buoy: string;
  buoy_color: string;
  carabiner: string;
  mechanics: string;
}

export interface ProductBible {
  brand: string;
  brand_logo_note: string;
  main_tagline: string;
  collection: string;
  anchor_system: AnchorSystem;
  products: Record<ProductLine, ProductSpec>;
  universal_forbidden: string[];
  universal_required_in_water: string[];
  photography_style: {
    signature_shot: string;
    environments: string[];
    lighting: string;
    mood: string;
  };
}

// The core system that powers every SMV launch path (kept under the ANCHOR_SYSTEM
// export name for import stability). For SMV this is the Clinical Ready(TM) framework.
export const ANCHOR_SYSTEM: AnchorSystem = {
  name: "Clinical Ready(TM) Curriculum & Launch Framework",
  dry_bag:
    "Clinical Ready(TM) curriculum ecosystem mapped to real practice workflow",
  rope: "Student and instructor platforms connecting coursework, tracking, and skill validation",
  rope_color: "performance gates and demonstrated readiness",
  buoy: "Launch documents, onboarding, compliance, and enrollment paperwork",
  buoy_color: "guided launch support",
  carabiner:
    "Guided launch support across compliance, marketing, enrollment, and operations",
  mechanics:
    "Path: subscription intake -> guided launch setup -> curriculum + platform live -> students advance through performance gates -> documented remediation -> externship readiness",
};

export const PRODUCTS: Record<ProductLine, ProductSpec> = {
  JOY: {
    id: "JOY",
    style_code: "SMV-STD",
    full_name: "SMV Standard",
    shape: "Low-entry subscription launch path",
    shape_description:
      "The core launch path for a practice-based dental assisting school: Clinical Ready(TM) curriculum, student and instructor platforms, launch documents, and guided launch support. Takes a practice from idea to organized school launch. NOT a course, NOT a franchise with royalties.",
    anchor_bag_color: "No SMV royalties and no per-student SMV fees",
    colors: [
      { name: "navy", hex: "#0B1B32", sku: "SMV-STD-CORE" },
      { name: "violet", hex: "#34147A", sku: "SMV-STD-CURRICULUM" },
      { name: "gold", hex: "#C7983D", sku: "SMV-STD-LAUNCH" },
    ],
    pricing: {
      unit_cost: 0,
      retail: 0,
      msrp: 0,
      margin: "No SMV royalties or per-student fees — the school keeps tuition",
      case_qty: 0,
    },
    taglines: [
      "Launch the school. Build the pipeline. Keep the tuition.",
      "A structured, low-entry path to your own assisting school.",
      "Curriculum, platform, and launch support in one framework.",
      "Idea to organized school launch.",
    ],
    features: [
      "Clinical Ready(TM) curriculum ecosystem",
      "Student and instructor platforms",
      "Launch documents and guided launch support",
      "Builds a local dental assistant staffing pipeline",
    ],
    prompt_shape_text:
      "SMV Standard — practice-based dental assisting school launch. SCENE: real dental operatory, an adult learner in clean navy scrubs at chairside assisting while an instructor guides tray setup, credible clinical training in progress. [COLOR] brand accent framing with SMV navy panel and gold eyebrow label. Bright-but-controlled premium DSLR look, clean clinical whites. NO cartoon icons, NO generic stock smiles, NO licensure-guarantee claims. Small SMV mark legible.",
  },

  CHILL: {
    id: "CHILL",
    style_code: "SMV-PREM",
    full_name: "SMV Premium",
    shape: "Premium subscription launch path with deeper guided implementation",
    shape_description:
      "Everything in Standard plus expanded guided implementation across compliance, onboarding, marketing, enrollment, operations, and platform workflows. A more hands-on launch of the practice-based dental assisting school.",
    anchor_bag_color: "No SMV royalties and no per-student SMV fees",
    colors: [
      { name: "navy", hex: "#0B1B32", sku: "SMV-PREM-CORE" },
      { name: "violet", hex: "#34147A", sku: "SMV-PREM-CURRICULUM" },
      { name: "magenta", hex: "#B11872", sku: "SMV-PREM-MARKETING" },
      { name: "gold", hex: "#C7983D", sku: "SMV-PREM-LAUNCH" },
    ],
    pricing: {
      unit_cost: 0,
      retail: 0,
      msrp: 0,
      margin: "No SMV royalties or per-student fees — the school keeps tuition",
      case_qty: 0,
    },
    taglines: [
      "Guided implementation from compliance to enrollment.",
      "A premium, structured launch for your practice-based school.",
      "Build the pipeline with full launch support.",
      "Own the school. Keep the tuition.",
    ],
    features: [
      "Everything in Standard, expanded",
      "Guided implementation across compliance, onboarding, and operations",
      "Marketing and enrollment workflow support",
      "Full platform workflow setup",
    ],
    prompt_shape_text:
      "SMV Premium — guided launch of a practice-based dental assisting school. SCENE: instructor-led skill check in a real operatory, adult learners in navy scrubs at a sterilization or radiography training station, structured and professional. [COLOR] brand accent with SMV navy/gradient panel and gold eyebrow label. Bright-but-controlled premium DSLR look. NO cartoon icons, NO stock smiles, NO passive-income or side-hustle framing, NO licensure guarantees. Small SMV mark legible.",
  },

  FUN: {
    id: "FUN",
    style_code: "SMV-CAPREM",
    full_name: "SMV California Premium",
    shape: "Premium launch path tuned for California requirements",
    shape_description:
      "The Premium launch framework adapted for California, with Done-for-You attention to California state licensure and requirements. State requirements vary and practice verification is required.",
    anchor_bag_color: "No SMV royalties and no per-student SMV fees",
    colors: [
      { name: "navy", hex: "#0B1B32", sku: "SMV-CA-CORE" },
      { name: "violet", hex: "#34147A", sku: "SMV-CA-CURRICULUM" },
      { name: "magenta", hex: "#B11872", sku: "SMV-CA-COMPLIANCE" },
      { name: "gold", hex: "#C7983D", sku: "SMV-CA-LAUNCH" },
    ],
    pricing: {
      unit_cost: 0,
      retail: 0,
      msrp: 0,
      margin: "No SMV royalties or per-student fees — the school keeps tuition",
      case_qty: 0,
    },
    taglines: [
      "Built for California practice requirements.",
      "Done-for-You attention to California licensure and requirements.",
      "A premium California launch — structured and compliant.",
      "State requirements vary — we help you navigate them.",
    ],
    features: [
      "Premium launch framework adapted for California",
      "Done-for-You state licensure and requirements support",
      "Compliance-minded onboarding and enrollment",
      "Practice verification required",
    ],
    prompt_shape_text:
      "SMV California Premium — California-tuned launch of a practice-based dental assisting school. SCENE: compliant, structured training in a real California dental operatory, adult learners in navy scrubs, instructor validating readiness, front-office enrollment detail in background. [COLOR] brand accent with SMV navy panel and gold eyebrow label. Bright-but-controlled premium DSLR look. Include a subtle 'State requirements vary' compliance note treatment. NO cartoon icons, NO stock smiles, NO licensure guarantees. Small SMV mark legible.",
  },

  VIBES: {
    id: "VIBES",
    style_code: "SMV-CR",
    full_name: "Clinical Ready(TM) Curriculum Model",
    shape: "Curriculum and readiness model powering every SMV launch path",
    shape_description:
      "Clinical Ready(TM) is the curriculum ecosystem where students advance by demonstrated readiness — performance gates, skill validation, documented remediation, and externship readiness — mapped to real practice workflow. Not grade averages alone.",
    anchor_bag_color: "No SMV royalties and no per-student SMV fees",
    colors: [
      { name: "violet", hex: "#34147A", sku: "SMV-CR-GATES" },
      { name: "magenta", hex: "#B11872", sku: "SMV-CR-VALIDATION" },
      { name: "green", hex: "#16856B", sku: "SMV-CR-EXTERNSHIP" },
      { name: "gold", hex: "#C7983D", sku: "SMV-CR-READY" },
    ],
    pricing: {
      unit_cost: 0,
      retail: 0,
      msrp: 0,
      margin: "Included in every SMV launch path",
      case_qty: 0,
    },
    taglines: [
      "Students advance by proven readiness.",
      "Performance gates. Skill validation. Externship readiness.",
      "Validated readiness — not grade averages alone.",
      "Clinical Ready(TM): trained around real practice workflow.",
    ],
    features: [
      "Performance gates and skill validation",
      "Documented remediation, not grade averages alone",
      "Externship readiness mapped to practice workflow",
      "Powers Standard, Premium, and California Premium paths",
    ],
    prompt_shape_text:
      "Clinical Ready(TM) curriculum model — demonstrated-readiness training. SCENE: instructor conducting a performance-gate skill check while an adult learner in navy scrubs demonstrates a validated chairside task; clean skill-validation checklist visible. [COLOR] brand accent with SMV navy/violet-magenta panel and gold eyebrow label. Bright-but-controlled premium DSLR look. Emphasize competence and validation, NOT perfection claims. NO cartoon icons, NO stock smiles, NO licensure guarantees. Small SMV mark legible.",
  },
};

// ─── Agent-ready text blocks ─────────────────────────────────────────────────

// Core system + compliance rules that must appear in SMV content (kept under the
// ANCHOR_SYSTEM_RULES_TEXT export name for import stability).
export const ANCHOR_SYSTEM_RULES_TEXT = `
CLINICAL READY(TM) & COMPLIANCE — MANDATORY IN ALL SMV CONTENT:
- SMV positioning: a practice-based dental assisting school launch system, NOT a "side hustle school"
- Clinical Ready(TM): students advance by demonstrated readiness — performance gates, skill validation, documented remediation, externship readiness
- Revenue: the school keeps tuition — NO SMV royalties, NO per-student SMV fees
- Compliance notes always available: "State requirements vary" and "Practice verification required"
- Use "guided launch support" and "Done-for-You state requirements" — never "guaranteed licensure"

FORBIDDEN:
✗ Guaranteeing licensure or clinical/legal outcomes
✗ "Passive income", "free money", or "side hustle" framing
✗ Claiming students will be "perfect assistants" (use validated readiness)
✗ Implying SMV takes royalties or per-student fees (there are none)
`.trim();

// SMV launch-path reference (kept under the PRODUCT_SHAPES_REFERENCE export name).
export const PRODUCT_SHAPES_REFERENCE = `
SMV LAUNCH PATHS — NEVER MIX THESE UP:
- STANDARD (SMV-STD): low-entry subscription launch path — curriculum, platform, documents, guided support
- PREMIUM (SMV-PREM): expanded guided implementation across compliance, marketing, enrollment, operations
- CALIFORNIA PREMIUM (SMV-CAPREM): Premium framework tuned for California licensure/requirements (State requirements vary)
- CLINICAL READY(TM) (SMV-CR): the demonstrated-readiness curriculum model that powers all paths
`.trim();

export const PRODUCT_RULES_TEXT = `
SMART MEDICAL VENTURES — PRODUCT BIBLE (MANDATORY ENFORCEMENT)

Brand: "Smart Medical Ventures" (short mark: SMV)
Programs: SMV Launch Programs 2026
Master Line: "Launch the school. Build the pipeline. Keep the tuition."

${PRODUCT_SHAPES_REFERENCE}

${ANCHOR_SYSTEM_RULES_TEXT}

UNIVERSAL RULES FOR ALL SMV CONTENT:
- SMV is a practice-based dental assisting school launch system (subscription model)
- Correct plan names only: Standard, Premium, California Premium (+ Clinical Ready curriculum model)
- Keep the SMV mark clean; palette navy/violet-magenta/gold with gold eyebrow labels
- Do NOT guarantee licensure
- Do NOT use passive income / free money / side hustle language
- Do NOT claim SMV royalties or per-student fees (there are none)
- Do NOT drop compliance notes ("State requirements vary", "Practice verification required")
- Do NOT invent clinical claims, credentials, or accessories
- Do NOT use cartoon icons or generic stock smiles

PLANS:
- SMV Standard (SMV-STD): low-entry subscription path — curriculum, platform, documents, guided launch support
- SMV Premium (SMV-PREM): expanded guided implementation across the full launch framework
- SMV California Premium (SMV-CAPREM): Premium adapted for California requirements — State requirements vary
- Clinical Ready(TM) (SMV-CR): performance gates, skill validation, remediation, externship readiness
`.trim();

// Per-path negative guidance (kept under the PRODUCT_SHAPE_NEGATIVES export name).
export const PRODUCT_SHAPE_NEGATIVES: Record<ProductLine, string> = {
  JOY: "licensure guarantee, passive income, free money, side hustle framing, cartoon icons, generic stock smiles, cheap or discount tone, vague transformation claims",
  CHILL: "licensure guarantee, passive income, side hustle framing, royalty or per-student fee implication, cartoon icons, stock smiles, hype tone, coupon or discount language",
  FUN: "licensure guarantee, missing 'State requirements vary' note, ignoring practice verification, passive income, side hustle framing, cartoon icons, stock smiles, non-California claims presented as California",
  VIBES: "perfection claims, 'students will be perfect assistants', grade-average-only advancement, licensure guarantee, cartoon icons, stock smiles, hype language",
};

// Accent / brand-treatment descriptions (kept under the COLOR_DESCRIPTIONS export name).
export const COLOR_DESCRIPTIONS: Record<string, string> = {
  "navy": "deep SMV navy (#0B1B32) brand panel with white headline text",
  "ink": "SMV ink (#07111F) near-black panel with white text",
  "violet": "SMV violet (#34147A) accent, part of the violet-to-magenta gradient",
  "purple": "SMV purple (#7046A2) accent within the signature gradient",
  "magenta": "SMV magenta (#B11872) accent, part of the violet-to-magenta gradient",
  "crimson": "SMV crimson (#A00F3D) deep accent at the end of the signature gradient",
  "gold": "SMV gold (#C7983D) eyebrow label and small accent detail",
  "green": "SMV green (#16856B) success/validation accent",
  "cream": "SMV cream (#F6F3EC) light background panel",
};

export function getColorDescription(colorName: string): string {
  const key = colorName.toLowerCase();
  return COLOR_DESCRIPTIONS[key] || colorName;
}

export function getProductSpec(line: ProductLine): ProductSpec {
  return PRODUCTS[line];
}

export function getPromptShapeText(line: ProductLine, color: string): string {
  const colorDesc = getColorDescription(color);
  return PRODUCTS[line].prompt_shape_text.replace(/\[COLOR\]/g, colorDesc);
}

export function getShapeNegative(line: ProductLine): string {
  return PRODUCT_SHAPE_NEGATIVES[line];
}

export function getAllColors(line: ProductLine): ProductColor[] {
  return PRODUCTS[line].colors;
}

export function detectProductLine(productStr: string): ProductLine {
  const s = productStr.toLowerCase();
  // Order matters: check "california" before "premium" (California Premium contains "premium").
  if (s.includes("california")) return "FUN";
  if (s.includes("clinical")) return "VIBES";
  if (s.includes("premium")) return "CHILL";
  if (s.includes("standard")) return "JOY";
  return "JOY";
}

export default PRODUCTS;

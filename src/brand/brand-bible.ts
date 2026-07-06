// SMART MEDICAL VENTURES (SMV) — Brand Bible
// Authoritative brand identity rules for all AI agents

export interface BrandTone {
  keywords: string[];
  forbidden: string[];
}

export interface ColorPalette {
  primary: string;
  primary_name: string;
  secondary: string;
  secondary_name: string;
  accent: string;
  accent_name: string;
  violet: string;
  violet_name: string;
  magenta: string;
  magenta_name: string;
  green: string;
  green_name: string;
}

export interface PhotographyStyle {
  lighting: string;
  composition: string;
  models: string;
  environment: string;
  mood: string;
  color_grade: string;
  skin_tones: string;
  wardrobe: string;
}

export interface VideoStyle {
  pacing: string;
  cuts: string;
  music_mood: string;
  camera_movement: string;
  edit_style: string;
  duration: Record<string, string>;
}

export interface BrandBible {
  brand_name: string;
  brand_voice: string;
  brand_tier: string;
  brand_statement: string;
  brand_promise: string;
  tone: BrandTone;
  color_palette: ColorPalette;
  photography_style: PhotographyStyle;
  video_style: VideoStyle;
  approved_environments: string[];
  hero_lines: string[];
}

export const BRAND_BIBLE: BrandBible = {
  brand_name: "SMART MEDICAL VENTURES",
  brand_voice:
    "Authoritative, calm and confident — clear, structured, and clinically informed. SMV speaks like a premium dental-education launch partner, never hype",
  brand_tier: "premium practice-based dental assisting school launch system",
  brand_statement:
    "Smart Medical Ventures exists at the intersection of clinical education and practice growth. We don't sell a course — we help a dental practice launch and operate a real dental assisting school.",
  brand_promise:
    "We take a practice from idea to organized school launch — curriculum, platform, documents, training workflow, and launch support",
  tone: {
    keywords: [
      "authoritative",
      "calm and confident",
      "practical",
      "premium",
      "compliance-minded",
      "clinically informed",
      "structured",
      "outcome-focused",
      "credible",
      "clear",
      "guided",
      "professional",
    ],
    forbidden: [
      "hype",
      "guaranteed licensure",
      "passive income",
      "free money",
      "side hustle",
      "get rich quick",
      "cheap",
      "discount",
      "coupon",
      "vague transformation language",
      "students will be perfect assistants",
      "legal or clinical overpromising",
    ],
  },
  color_palette: {
    primary: "#0B1B32",
    primary_name: "SMV Navy",
    secondary: "#FFFFFF",
    secondary_name: "Pure White",
    accent: "#C7983D",
    accent_name: "SMV Gold",
    violet: "#34147A",
    violet_name: "SMV Violet",
    magenta: "#B11872",
    magenta_name: "SMV Magenta",
    green: "#16856B",
    green_name: "SMV Green",
  },
  photography_style: {
    lighting:
      "Bright-but-controlled premium DSLR look — clean, professional, never flat or gimmicky",
    composition:
      "Structured framing on real clinical work; white text on dark navy/ink/gradient panels",
    models:
      "Adult learners and instructors in clean navy/charcoal scrubs — focused, competent, real",
    environment:
      "Real dental operatories, sterilization, radiography training, tray setup, chairside assisting",
    mood: "Credible, premium, clinically serious — you are watching real training happen",
    color_grade:
      "Neutral clinical whites, deep navy shadows, gold and violet-magenta only as small accents",
    skin_tones: "Natural, diverse, professional",
    wardrobe:
      "Navy or charcoal scrubs, clean and consistent — no logos competing with SMV",
  },
  video_style: {
    pacing: "Measured and structured — confident build, no hype cuts",
    cuts: "Purposeful cuts that follow a training or launch step, never random",
    music_mood:
      "Understated, professional, cinematic-but-restrained — never pop or party",
    camera_movement:
      "Steady, intentional moves — slow push-in, clean pans across clinical work",
    edit_style: "Premium educational commercial — every frame reads as credible and clinical",
    duration: {
      tiktok: "7-15 seconds hook + 15-30 seconds total",
      instagram_reel: "15-30 seconds",
      instagram_story: "10-15 seconds",
      youtube: "30-90 seconds",
      brand_film: "60-180 seconds",
    },
  },
  approved_environments: [
    "Real dental operatory with chairside assisting in progress",
    "Sterilization and instrument reprocessing area",
    "Radiography / imaging training station",
    "Tray setup and instrument identification station",
    "Instructor-led skill check with performance gate validation",
    "Clean classroom / simulation lab with adult learners in scrubs",
    "Front-office / enrollment and onboarding setting",
    "Dark navy or gradient brand panel with white headline text",
  ],
  hero_lines: [
    "Launch the school. Build the pipeline. Keep the tuition.",
    "Turn your practice into a dental assisting school.",
    "Train the assistants your practice actually needs.",
    "A structured launch — curriculum, platform, and support.",
    "Clinical Ready(TM): students advance by proven readiness.",
    "Own the school. Own the tuition. Build the pipeline.",
  ],
};

export const BRAND_VOICE_TEXT = `
SMART MEDICAL VENTURES (SMV) — BRAND BIBLE (MANDATORY RULES)

BRAND: ${BRAND_BIBLE.brand_name}
TIER: ${BRAND_BIBLE.brand_tier}
VOICE: ${BRAND_BIBLE.brand_voice}

BRAND STATEMENT: ${BRAND_BIBLE.brand_statement}
MASTER BRAND LINE: "Launch the school. Build the pipeline. Keep the tuition."

WHAT SMV IS:
A dental education launch company for practice owners. SMV helps a dental practice launch and operate a practice-based dental assisting school — to build a local assistant pipeline, add a tuition revenue stream, and operate with a structured Clinical Ready(TM) curriculum and support ecosystem.

TONE — USE THESE WORDS AND FEELINGS:
${BRAND_BIBLE.tone.keywords.map((k) => `• ${k}`).join("\n")}

FORBIDDEN TONE — NEVER USE:
${BRAND_BIBLE.tone.forbidden.map((f) => `• ${f}`).join("\n")}

COMPLIANCE (ALWAYS):
• Keep "State requirements vary" and "Practice verification required" available
• Never guarantee licensure — say "guided launch support" / "Done-for-You state requirements"
• Never use passive income / free money / side hustle framing
• The school keeps tuition — NO SMV royalties, NO per-student SMV fees

PHOTOGRAPHY RULES:
• Lighting: ${BRAND_BIBLE.photography_style.lighting}
• Models: ${BRAND_BIBLE.photography_style.models}
• Environment: ${BRAND_BIBLE.photography_style.environment}
• Mood: ${BRAND_BIBLE.photography_style.mood}

VIDEO RULES:
• Pacing: ${BRAND_BIBLE.video_style.pacing}
• Music: ${BRAND_BIBLE.video_style.music_mood}
• Camera: ${BRAND_BIBLE.video_style.camera_movement}

APPROVED ENVIRONMENTS:
${BRAND_BIBLE.approved_environments.map((e) => `• ${e}`).join("\n")}

HERO LINES (approved):
${BRAND_BIBLE.hero_lines.map((l) => `• "${l}"`).join("\n")}
`.trim();

export default BRAND_BIBLE;

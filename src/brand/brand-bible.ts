// HIPPO FLOAT — Brand Bible
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
  ocean: string;
  ocean_name: string;
  sand: string;
  sand_name: string;
  coral: string;
  coral_name: string;
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
  brand_name: "HIPPO FLOAT",
  brand_voice:
    "Confident, aspirational, sun-soaked luxury — the brand speaks like a premium lifestyle magazine come to life",
  brand_tier: "premium luxury beach lifestyle",
  brand_statement:
    "HIPPO FLOAT exists at the intersection of effortless luxury and the perfect summer day. We don't sell floats — we sell the feeling of having arrived.",
  brand_promise:
    "Every float is a first-class seat in the most beautiful place on earth",
  tone: {
    keywords: [
      "effortless luxury",
      "sun-soaked",
      "aspirational",
      "premium",
      "cinematic",
      "editorial",
      "Mediterranean",
      "Riviera",
      "golden hour",
      "elevated",
      "timeless",
      "iconic",
    ],
    forbidden: [
      "cheap",
      "discount",
      "generic",
      "AI-looking",
      "cartoon",
      "plastic-looking",
      "budget",
      "sale",
      "affordable",
      "kids toy",
      "inflatable toy",
      "basic",
    ],
  },
  color_palette: {
    primary: "#0A1628",
    primary_name: "Deep Navy",
    secondary: "#FFFFFF",
    secondary_name: "Pure White",
    accent: "#C9A84C",
    accent_name: "Champagne Gold",
    ocean: "#1B6CA8",
    ocean_name: "Mediterranean Blue",
    sand: "#F5E6C8",
    sand_name: "Golden Sand",
    coral: "#E8816A",
    coral_name: "Sunset Coral",
  },
  photography_style: {
    lighting:
      "Golden hour magic — warm, directional, cinematic. Never flat, never harsh flash",
    composition:
      "Rule of thirds, negative space, leading lines toward the float",
    models:
      "Sun-kissed, effortlessly glamorous — looks like they live there, not posing",
    environment:
      "Crystal-clear water required — teal, turquoise, Mediterranean blue",
    mood: "You're supposed to be there right now — immediate aspiration, zero friction",
    color_grade:
      "Warm highlights, cool midtones, rich shadows — editorial not Instagram filter",
    skin_tones: "Sun-kissed, glowing, diverse but unified by lifestyle",
    wardrobe:
      "Minimal luxury — designer swimwear, no logos competing with HIPPO FLOAT",
  },
  video_style: {
    pacing: "Slow reveal builds to confident cut — Mediterranean rhythm",
    cuts: "Motivated cuts on music, never random",
    music_mood:
      "Deep house, ambient electronic, or cinematic orchestral — never pop",
    camera_movement:
      "Smooth drone, slow push-in, gentle pan — always intentional",
    edit_style: "Premium commercial — every frame could be a print ad",
    duration: {
      tiktok: "7-15 seconds hook + 15-30 seconds total",
      instagram_reel: "15-30 seconds",
      instagram_story: "10-15 seconds",
      youtube: "30-90 seconds",
      brand_film: "60-180 seconds",
    },
  },
  approved_environments: [
    "Infinity pool at luxury resort (Bali, Mykonos, Santorini)",
    "Mediterranean sea — crystal clear turquoise water",
    "Private villa pool — white stone, minimal architecture",
    "Maldives — overwater bungalow setting",
    "Ibiza beach club — golden hour",
    "Miami Beach — Art Deco luxury hotel pool",
    "French Riviera — Cap d'Antibes style",
    "Tulum — cenote or infinity pool with jungle",
    "Amalfi Coast — cliffside pool",
  ],
  hero_lines: [
    "Float Like Royalty",
    "Your throne awaits",
    "This is what summer feels like",
    "Effortless. Luxury. Float.",
    "The ocean is your living room",
    "Float into your best life",
  ],
};

export const BRAND_VOICE_TEXT = `
HIPPO FLOAT — BRAND BIBLE (MANDATORY RULES)

BRAND: ${BRAND_BIBLE.brand_name}
TIER: ${BRAND_BIBLE.brand_tier}
VOICE: ${BRAND_BIBLE.brand_voice}

BRAND STATEMENT: ${BRAND_BIBLE.brand_statement}

TONE — USE THESE WORDS AND FEELINGS:
${BRAND_BIBLE.tone.keywords.map((k) => `• ${k}`).join("\n")}

FORBIDDEN TONE — NEVER USE:
${BRAND_BIBLE.tone.forbidden.map((f) => `• ${f}`).join("\n")}

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

// Hippo Float — Complete Product Bible (Summer Collection 2026)
// All 4 product lines — authoritative source for all AI agents

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

export const ANCHOR_SYSTEM: AnchorSystem = {
  name: "2-in-1 Carry Bag & Anchor",
  dry_bag:
    "Waterproof dry bag — fills with water or sand when submerged to anchor the float",
  rope: "Royal blue twisted nylon rope connecting float to anchor bag",
  rope_color: "royal blue / navy blue twisted nylon",
  buoy: "Small bright yellow sphere — marks the rope at water surface level",
  buoy_color: "bright yellow",
  carabiner: "Metal carabiner clips at float and bag connection points",
  mechanics:
    "Rope path: float attachment point → down through water → yellow buoy (at surface) → continues down → anchor bag (fully submerged)",
};

export const PRODUCTS: Record<ProductLine, ProductSpec> = {
  JOY: {
    id: "JOY",
    style_code: "HFJOY",
    full_name: "hippo float Joy",
    shape: "Luxury recliner / chaise lounge",
    shape_description:
      "Semi-reclined inflatable pool chair with elevated backrest and raised headrest. Looks like a premium chaise lounge on water — the backrest is reclined at ~30-40°. NOT flat, NOT a ring. Has a distinct L-shape or chaise profile from the side.",
    anchor_bag_color: "matches float color",
    colors: [
      { name: "pink", hex: "#FF69B4", sku: "850077236112" },
      { name: "blue", hex: "#4FC3F7", sku: "850077236129" },
      {
        name: "flower print orange",
        hex: "#FF8C00",
        sku: "850077236143",
        pattern: "orange with floral/flower pattern",
      },
      {
        name: "citrus print green",
        hex: "#7FBA00",
        sku: "850077236136",
        pattern: "green with citrus/lemon slice pattern",
      },
    ],
    pricing: {
      unit_cost: 19.99,
      retail: 39.99,
      msrp: 89.99,
      margin: "50.6%",
      case_qty: 10,
    },
    taglines: [
      "Float Your Way to Paradise",
      "Effortless comfort. Endless escape.",
      "Designed to Indulge. Built to Stay.",
      "Escape Beautifully.",
    ],
    features: [
      "Luxury recliner shape — like a first-class seat on water",
      "2-in-1 anchor bag keeps you perfectly in place",
      "Drift-free — stay exactly where you want",
      "Premium inflatable PVC construction",
    ],
    prompt_shape_text:
      "hippo float Joy luxury inflatable pool recliner/lounger — semi-reclined chaise lounge shape with elevated backrest and headrest, approximately 30-40 degree reclined angle, [COLOR] colored, 'hippo' logo visible on surface",
  },

  CHILL: {
    id: "CHILL",
    style_code: "HFCHILL",
    full_name: "hippo float Chill",
    shape: "U-shaped horseshoe ring float",
    shape_description:
      "Open U-shape / horseshoe ring. Person sits IN the center opening with arms resting on the ring sides and legs dangling through the opening. Has a mesh or fabric seat in the center hole. Think of a life preserver ring but U-shaped/open at the front.",
    anchor_bag_color: "green (always green regardless of float color)",
    colors: [
      { name: "pink", hex: "#FF69B4", sku: "850077263037" },
      { name: "orange", hex: "#FF6600", sku: "850077263013" },
      { name: "blue", hex: "#4FC3F7", sku: "850077263020" },
      {
        name: "flower print orange",
        hex: "#FF8C00",
        sku: "850077263044",
        pattern: "orange with floral pattern",
      },
      {
        name: "citrus print green",
        hex: "#7FBA00",
        sku: "850077263051",
        pattern: "green with citrus pattern",
      },
    ],
    pricing: {
      unit_cost: 14.99,
      retail: 29.99,
      msrp: 69.99,
      margin: "50%",
      case_qty: 10,
    },
    taglines: [
      "Designed to Lounge. Built to Stay Put.",
      "Float The Party. Lose The Drift.",
      "Float Together. Stay in Place.",
      "Stay Anchored. Stay Social.",
    ],
    features: [
      "Stay Anchored — zero drift technology",
      "Stay Social — U-shape keeps you facing friends",
      "Portable — anchor bag is the carry bag",
      "Mesh seat for all-day comfort",
    ],
    prompt_shape_text:
      "hippo float Chill U-shaped horseshoe ring float — [COLOR] inflatable U/horseshoe ring shape, person sitting in center opening with arms resting on both sides of the ring, legs dangling through, 'hippo' logo on ring surface, green anchor bag underwater",
  },

  FUN: {
    id: "FUN",
    style_code: "HFFUN",
    full_name: "hippo float Fun",
    shape: "Large elongated cylindrical torpedo tube",
    shape_description:
      "Long oval-cylinder inflatable — like an oversized premium pool noodle but much thicker with oval cross-section. You straddle it like a log, lie across it, or hug it while floating. NOT a mat, NOT a ring, NOT a chair — it's a thick elongated tube.",
    anchor_bag_color: "matches float color",
    colors: [
      { name: "pink", hex: "#FF69B4", sku: "850077263150" },
      { name: "blue", hex: "#4FC3F7", sku: "850077263167" },
      { name: "green", hex: "#7FBA00", sku: "850077263174" },
      {
        name: "flower print orange",
        hex: "#FF8C00",
        sku: "850077263181",
        pattern: "orange with floral pattern",
      },
    ],
    pricing: {
      unit_cost: 12.5,
      retail: 24.99,
      msrp: 49.99,
      margin: "50%",
      case_qty: 20,
    },
    taglines: [
      "Float Together. Stay in Place.",
      "Have Some Fun.",
      "Float The Party. Lose The Drift.",
    ],
    features: [
      "Cylindrical torpedo shape — straddle or hug it",
      "2-in-1 anchor bag system",
      "Vibrant solid and print colors",
      "Social float — great for groups",
    ],
    prompt_shape_text:
      "hippo float Fun large inflatable cylindrical torpedo tube — [COLOR] elongated oval cylinder shape like a giant premium pool noodle, person straddling it or leaning on it, 'hippo' logo visible on side",
  },

  VIBES: {
    id: "VIBES",
    style_code: "HFVIBES",
    full_name: "hippo float Vibes",
    shape: "Flat rectangular mat with circular texture pattern",
    shape_description:
      "Wide flat rectangular inflatable mat — like a premium pool lilo/air mattress but with distinctive circular drainage holes/texture dots covering the entire top surface. Very flat and wide. You lie FLAT on top of it. NOT a chair, NOT a ring, NOT a tube.",
    anchor_bag_color: "matches float color",
    colors: [
      { name: "pink", hex: "#FF69B4", sku: "850077263068" },
      { name: "orange", hex: "#FF6600", sku: "850077263082" },
      {
        name: "flower print orange",
        hex: "#FF8C00",
        sku: "850077263099",
        pattern: "orange with floral pattern",
      },
      { name: "blue", hex: "#4FC3F7", sku: "850077263075" },
      {
        name: "citrus print green",
        hex: "#7FBA00",
        sku: "850077263105",
        pattern: "green with citrus pattern",
      },
    ],
    pricing: {
      unit_cost: 14.99,
      retail: 29.99,
      msrp: 69.99,
      margin: "51.7%",
      case_qty: 10,
    },
    taglines: [
      "Summer in Full Bloom.",
      "Bold color. Pure comfort.",
      "Stay Where You Float.",
    ],
    features: [
      "Flat mat design — full body sunbathing",
      "Distinctive circular texture/drainage holes across surface",
      "Bold vibrant colors and prints",
      "2-in-1 anchor bag keeps mat in place",
    ],
    prompt_shape_text:
      "hippo float Vibes flat rectangular inflatable mat — [COLOR] wide flat float with distinctive circular drainage holes/texture dots covering entire top surface, person lying flat on top, 'hippo' logo at top of mat",
  },
};

// ─── Agent-ready text blocks ─────────────────────────────────────────────────

export const ANCHOR_SYSTEM_RULES_TEXT = `
ANCHOR SYSTEM — MANDATORY IN ALL WATER SHOTS:
- Component: 2-in-1 Carry Bag & Anchor
- Rope: royal blue twisted nylon — always visible connecting float to anchor bag
- Buoy: small bright YELLOW sphere — always visible at water surface level on the rope
- Anchor bag: waterproof dry bag — ALWAYS FULLY SUBMERGED UNDERWATER, never on surface
- Carabiner: metal clip visible at connection points

FORBIDDEN:
✗ Anchor bag above water or at surface
✗ Rope disconnected from float or bag
✗ Yellow buoy removed or wrong color
✗ Anchor system missing when float is in water
`.trim();

export const PRODUCT_SHAPES_REFERENCE = `
HIPPO FLOAT PRODUCT SHAPES — NEVER MIX THESE UP:
- JOY: Semi-reclined CHAISE LOUNGE / RECLINER — has backrest and headrest, NOT flat
- CHILL: U-SHAPE HORSESHOE RING — person sits in center hole, NOT a full ring
- FUN: CYLINDER TORPEDO TUBE — elongated oval tube, NOT a mat or ring
- VIBES: FLAT RECTANGULAR MAT — has circular texture holes, completely flat, NOT a chair
`.trim();

export const PRODUCT_RULES_TEXT = `
HIPPO FLOAT — PRODUCT BIBLE (MANDATORY ENFORCEMENT)

Brand: "hippo float" (lowercase, logo has wave in second 'o')
Collection: Summer Collection 2026
Main Tagline: "STAY WHERE YOU FLOAT"

${PRODUCT_SHAPES_REFERENCE}

${ANCHOR_SYSTEM_RULES_TEXT}

UNIVERSAL RULES FOR ALL PRODUCTS:
- 'hippo' logo text always visible on float in contrasting color (white on colored floats)
- Do NOT change product shape or silhouette
- Do NOT alter 'hippo' logo
- Do NOT change rope color from blue
- Do NOT change buoy color from yellow
- Do NOT invent accessories not on real product
- Do NOT mix product lines (Joy ≠ Chill ≠ Fun ≠ Vibes)
- Do NOT change product colors without authorization

PRODUCTS & COLORS:
- Joy (HFJOY, $89.99 MSRP): Pink, Blue, Flower Print Orange, Citrus Print Green
- Chill (HFCHILL, $69.99 MSRP): Pink, Orange, Blue, Flower Print Orange, Citrus Print Green — GREEN anchor bag always
- Fun (HFFUN, $49.99 MSRP): Pink, Blue, Green, Flower Print Orange
- Vibes (HFVIBES, $69.99 MSRP): Pink, Orange, Flower Print Orange, Blue, Citrus Print Green
`.trim();

export function getProductSpec(line: ProductLine): ProductSpec {
  return PRODUCTS[line];
}

export function getPromptShapeText(line: ProductLine, color: string): string {
  return PRODUCTS[line].prompt_shape_text.replace(/\[COLOR\]/g, color);
}

export function getAllColors(line: ProductLine): ProductColor[] {
  return PRODUCTS[line].colors;
}

export default PRODUCTS;

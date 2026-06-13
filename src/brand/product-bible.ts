// HIPPO FLOAT JOY — Product Bible
// Authoritative product rules for all AI agents

export interface ProductDimensions {
  length: number;
  width: number;
  description: string;
}

export interface ProductColors {
  main: string;
  accent: string;
  rope: string;
  buoy: string;
  anchor_bag: string;
  cup_holder_insert: string;
  logo_color: string;
}

export interface StrictRules {
  never_change_shape: string;
  rope_always_visible: string;
  anchor_bag_underwater: string;
  buoy_always_yellow: string;
  cup_holders_right_side_only: string;
  no_invented_accessories: string;
  logo_exact: string;
  no_text_alterations: string;
  color_preservation: string;
  geometry_preservation: string;
}

export interface CameraAngles {
  approved: string[];
  preferred: string;
  avoid: string[];
}

export interface ProductBible {
  product_name: string;
  brand: string;
  tagline: string;
  product_type: string;
  dimensions_cm: ProductDimensions;
  colors: ProductColors;
  materials: Record<string, string>;
  features: string[];
  strict_rules: StrictRules;
  visual_anchors: string[];
  camera_angles: CameraAngles;
  reference_keywords: string[];
  approved_environments: string[];
}

export const PRODUCT_BIBLE: ProductBible = {
  product_name: "HIPPO FLOAT JOY",
  brand: "HIPPO FLOAT",
  tagline: "Float Like Royalty",
  product_type: "Luxury Inflatable Pool & Beach Float",
  dimensions_cm: {
    length: 175,
    width: 85,
    description: "Full body float - fits most adults comfortably",
  },
  colors: {
    main: "white",
    accent: "navy blue",
    rope: "blue",
    buoy: "yellow",
    anchor_bag: "navy blue",
    cup_holder_insert: "navy blue",
    logo_color: "navy blue on white",
  },
  materials: {
    main_body: "Premium thick-gauge PVC, 0.4mm reinforced",
    rope: "Marine-grade braided nylon, navy/blue",
    anchor_bag: "Heavy-duty mesh nylon, navy blue",
    cup_holders: "Integrated PVC, right side only",
    finish: "Matte white with gloss navy accents",
  },
  features: [
    "Ultra-durable 0.4mm reinforced PVC construction",
    "Built-in rope system with integrated buoy marker",
    "Underwater anchor bag system (navy mesh)",
    "Two premium cup holders - right side only",
    "Full body support - 175cm length",
    "Non-slip texture base",
    "Military-grade air valve system",
    "UV-resistant coating",
    "Weight capacity: 150kg",
    "Integrated carry handles",
    "Deflates and rolls for travel",
  ],
  strict_rules: {
    never_change_shape:
      "The float silhouette must remain exactly rectangular with rounded corners — never alter proportions or shape",
    rope_always_visible:
      "The blue/navy rope system must always be visible and connected to the float — never hidden or removed",
    anchor_bag_underwater:
      "The navy anchor bag must always appear underwater, connected to the rope — shows the float is anchored",
    buoy_always_yellow:
      "The buoy marker is always small and yellow — never change its color or make it large",
    cup_holders_right_side_only:
      "Cup holders appear only on the right side of the float — never left, never front, never back",
    no_invented_accessories:
      "Never add accessories, attachments, or modifications not present on the actual product",
    logo_exact:
      "The HIPPO FLOAT logo must appear exactly as designed — navy text on white, never altered",
    no_text_alterations:
      "Never add, remove, or modify any text that appears on the product",
    color_preservation:
      "Main body stays white, accents stay navy blue — no color variations permitted",
    geometry_preservation:
      "All physical connections (rope-to-float, rope-to-buoy, rope-to-anchor) must be physically accurate",
  },
  visual_anchors: [
    "White body with navy blue trim clearly visible",
    "Blue rope extending from float edge",
    "Small yellow buoy at rope midpoint",
    "Navy anchor bag visible below waterline",
    "Cup holders on right side",
    "HIPPO FLOAT logo centered on float surface",
    "Rope attachment points at float corners",
  ],
  camera_angles: {
    approved: [
      "aerial_45_degree",
      "side_profile",
      "front_three_quarter",
      "underwater_looking_up",
      "close_up_detail",
      "lifestyle_wide",
    ],
    preferred: "aerial_45_degree",
    avoid: ["straight_down_flat", "extreme_close_up_logo_only"],
  },
  reference_keywords: [
    "luxury inflatable pool float",
    "white rectangular float",
    "navy blue accents",
    "blue rope connected",
    "yellow buoy marker",
    "navy anchor bag underwater",
    "cup holders right side",
    "premium beach float",
    "HIPPO FLOAT JOY",
    "exact product geometry",
  ],
  approved_environments: [
    "Infinity pool at luxury resort",
    "Mediterranean sea crystal clear water",
    "Private villa pool",
    "Maldives overwater bungalow",
    "Ibiza beach club",
    "Miami beach luxury hotel pool",
    "Santorini cliff pool",
    "Bali resort pool",
    "French Riviera",
  ],
};

// Quick access rules for agent system prompts
export const PRODUCT_RULES_TEXT = `
HIPPO FLOAT JOY — PRODUCT BIBLE (MANDATORY RULES)

PRODUCT: ${PRODUCT_BIBLE.product_name}
DIMENSIONS: ${PRODUCT_BIBLE.dimensions_cm.length}cm × ${PRODUCT_BIBLE.dimensions_cm.width}cm

COLORS (NEVER CHANGE):
- Main body: WHITE
- Accents: NAVY BLUE
- Rope: BLUE
- Buoy: YELLOW (small)
- Anchor bag: NAVY BLUE

MANDATORY VISUAL ELEMENTS (must appear in all product shots):
${PRODUCT_BIBLE.visual_anchors.map((a, i) => `${i + 1}. ${a}`).join("\n")}

STRICT RULES (FORBIDDEN TO VIOLATE):
${Object.entries(PRODUCT_BIBLE.strict_rules)
  .map(([k, v]) => `• ${v}`)
  .join("\n")}

APPROVED CAMERA ANGLES: ${PRODUCT_BIBLE.camera_angles.approved.join(", ")}
PREFERRED ANGLE: ${PRODUCT_BIBLE.camera_angles.preferred}
`.trim();

export default PRODUCT_BIBLE;

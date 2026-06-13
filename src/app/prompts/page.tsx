"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const PRODUCTS = [
  { id: "JOY", label: "Joy", shape: "Luxury Lounger", emoji: "🛋️" },
  { id: "CHILL", label: "Chill", shape: "U-Ring Float", emoji: "💎" },
  { id: "FUN", label: "Fun", shape: "Cylinder Tube", emoji: "🎯" },
  { id: "VIBES", label: "Vibes", shape: "Flat Mat", emoji: "🌊" },
];

const COLORS: Record<string, string[]> = {
  JOY: ["Pink", "Blue", "Flower Print Orange", "Citrus Print Green"],
  CHILL: ["Pink", "Orange", "Blue", "Flower Print Orange", "Citrus Print Green"],
  FUN: ["Pink", "Blue", "Green", "Flower Print Orange"],
  VIBES: ["Pink", "Orange", "Flower Print Orange", "Blue", "Citrus Print Green"],
};

const STYLES = [
  { id: "CINEMATIC_LUXURY", label: "Cinematic Luxury", emoji: "🎞️" },
  { id: "TIKTOK_VIRAL", label: "TikTok Viral", emoji: "📱" },
  { id: "PRODUCT_DEMO", label: "Product Demo", emoji: "⚓" },
  { id: "LIFESTYLE_BEACH", label: "Lifestyle Beach", emoji: "🏖️" },
];

const SHOT_TYPES = [
  { id: "underwater_split", label: "Underwater Split Shot", emoji: "🌊", desc: "Signature shot — above and below water" },
  { id: "aerial_45", label: "Aerial 45°", emoji: "🚁", desc: "Drone overhead lifestyle shot" },
  { id: "lifestyle_medium", label: "Lifestyle Medium", emoji: "👤", desc: "Person enjoying the float" },
  { id: "product_hero", label: "Product Hero", emoji: "⭐", desc: "Clean product shot no people" },
  { id: "close_detail", label: "Close Detail", emoji: "🔍", desc: "Anchor system / logo detail" },
  { id: "social_tiktok", label: "Social / TikTok", emoji: "📱", desc: "9:16 vertical, hook composition" },
];

const MOCK_PROMPTS = [
  {
    shot_number: 1,
    shot_name: "Signature Underwater Split",
    full_prompt: "Cinematic luxury lifestyle shot, DRAMATIC UNDERWATER SPLIT SHOT — waterline bisects frame exactly in half. ABOVE WATER: attractive female model in white premium swimwear lying back on hippo float Joy luxury inflatable pool lounger recliner (pink, semi-reclined chaise lounge shape with backrest), completely relaxed, sunglasses on, crystal clear turquoise tropical water surrounding the float, palm trees and white sand beach in background, 'hippo' logo clearly visible on float surface. BELOW WATER: blue twisted nylon rope descending from float through perfect turquoise water, small bright yellow buoy sphere at waterline on rope, hippo float waterproof dry bag anchor (pink matching float) fully submerged hanging stationary on sandy bottom, rope taut. Shot on ARRI Alexa Mini LF look, 35mm anamorphic lens, warm golden hour sunlight, premium commercial luxury aesthetic, photorealistic, ultra high resolution, no AI artifacts, exact product geometry preserved.",
    negative_prompt: "wrong product shape, flat mat instead of lounger, anchor bag above water, floating anchor bag, disconnected rope, missing yellow buoy, altered logo, invented accessories, cartoon style, cheap looking, blurry, low quality, stock photo aesthetic",
    camera_specs: "ARRI Alexa Mini LF look, 35mm anamorphic lens, 2.39:1",
    lighting: "Golden hour — warm directional sun, soft wrap, long shadows",
    motion_notes: "Static or very slow push in — let the water movement do the work",
    continuity_notes: "Pink product, same model, same golden hour throughout sequence",
    generation_tool: "midjourney" as const,
  },
  {
    shot_number: 2,
    shot_name: "Aerial Lifestyle",
    full_prompt: "Aerial drone shot, 45-degree angle downward, hippo float Joy luxury inflatable pool lounger (pink, reclined chaise shape with backrest and headrest), model in white swimwear lying relaxed on float in crystal clear turquoise water, blue twisted rope visible going underwater, yellow buoy at surface, anchor bag visible below surface, white sand beach visible through water, tropical setting, shot on DJI Inspire 3 look, 24mm wide lens, bright natural tropical sunlight, vivid saturated colors, birds eye luxury lifestyle, photorealistic, product shape exactly preserved — semi-reclined chaise lounge not flat mat.",
    negative_prompt: "wrong product shape, flat mat, disconnected anchor, missing rope, wrong color, poor composition",
    camera_specs: "Drone aerial, DJI Inspire 3, 24mm wide",
    lighting: "Bright natural midday tropical sun",
    motion_notes: "Slow orbital drone movement",
    continuity_notes: "Match pink product and model from shot 1",
    generation_tool: "kling" as const,
  },
];

export default function PromptsPage() {
  const [product, setProduct] = useState("JOY");
  const [color, setColor] = useState("Pink");
  const [style, setStyle] = useState("CINEMATIC_LUXURY");
  const [shotType, setShotType] = useState("underwater_split");
  const [concept, setConcept] = useState("");
  const [generating, setGenerating] = useState(false);
  const [prompts, setPrompts] = useState<typeof MOCK_PROMPTS | null>(null);
  const [copied, setCopied] = useState<number | null>(null);

  const handleGenerate = async () => {
    setGenerating(true);
    await new Promise((r) => setTimeout(r, 2000));
    setPrompts(MOCK_PROMPTS);
    setGenerating(false);
  };

  const copyPrompt = (index: number, text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(index);
    setTimeout(() => setCopied(null), 2000);
  };

  const TOOL_COLORS: Record<string, string> = {
    midjourney: "text-violet-400",
    dalle3: "text-emerald-400",
    kling: "text-sky-400",
    runway: "text-orange-400",
    sora: "text-pink-400",
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors text-sm">← Dashboard</Link>
            <span className="text-border">/</span>
            <span className="text-sm font-medium">📷 Prompt Studio</span>
          </div>
          <Badge variant="gold">Cinematic Prompt Engine</Badge>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

          {/* Left: Controls (2/5) */}
          <div className="lg:col-span-2 space-y-5">
            <div>
              <h2 className="text-xl font-bold mb-1">Prompt Studio</h2>
              <p className="text-sm text-muted-foreground">Hollywood-quality AI prompts for any generation tool</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Product</label>
              <div className="grid grid-cols-2 gap-2">
                {PRODUCTS.map((p) => (
                  <button key={p.id} onClick={() => { setProduct(p.id); setColor(COLORS[p.id][0]); }}
                    className={`p-2 rounded-lg border text-left text-sm transition-all ${product === p.id ? "border-sky-500 bg-sky-500/10" : "border-border"}`}>
                    <span>{p.emoji}</span> <span className="font-medium">Joy → {p.label}</span>
                    <p className="text-xs text-muted-foreground mt-0.5">{p.shape}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Color</label>
              <div className="flex flex-wrap gap-2">
                {COLORS[product]?.map((c) => (
                  <button key={c} onClick={() => setColor(c)}
                    className={`px-2.5 py-1 rounded-full text-xs border transition-all ${color === c ? "border-sky-500 bg-sky-500/20 text-sky-400" : "border-border text-muted-foreground"}`}>
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Style</label>
              <div className="grid grid-cols-2 gap-2">
                {STYLES.map((s) => (
                  <button key={s.id} onClick={() => setStyle(s.id)}
                    className={`flex items-center gap-1.5 p-2 rounded-lg border text-sm transition-all ${style === s.id ? "border-sky-500 bg-sky-500/10 text-sky-400" : "border-border text-muted-foreground"}`}>
                    <span>{s.emoji}</span> {s.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Shot Type</label>
              <div className="space-y-1.5">
                {SHOT_TYPES.map((s) => (
                  <button key={s.id} onClick={() => setShotType(s.id)}
                    className={`w-full flex items-center gap-2 p-2.5 rounded-lg border text-sm transition-all ${shotType === s.id ? "border-sky-500 bg-sky-500/10" : "border-border"}`}>
                    <span>{s.emoji}</span>
                    <div className="text-left">
                      <p className="font-medium text-xs">{s.label}</p>
                      <p className="text-xs text-muted-foreground">{s.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Additional context <span className="text-muted-foreground font-normal">(optional)</span></label>
              <Textarea
                placeholder="e.g. couple on floats, sunset lighting, Mykonos setting, celebratory mood..."
                value={concept}
                onChange={(e) => setConcept(e.target.value)}
                className="h-20"
              />
            </div>

            <Button className="w-full gap-2" onClick={handleGenerate} disabled={generating}>
              {generating ? (
                <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Generating...</>
              ) : (
                <><span>📷</span> Generate Prompts</>
              )}
            </Button>
          </div>

          {/* Right: Output (3/5) */}
          <div className="lg:col-span-3 space-y-4">
            {!prompts && !generating && (
              <div className="h-full flex items-center justify-center border border-dashed border-border/50 rounded-xl min-h-[500px]">
                <div className="text-center text-muted-foreground">
                  <p className="text-4xl mb-3">📷</p>
                  <p className="font-medium">Your prompts will appear here</p>
                  <p className="text-sm mt-1">Configure options and click Generate</p>
                </div>
              </div>
            )}

            {generating && (
              <div className="h-full flex items-center justify-center min-h-[500px]">
                <div className="text-center space-y-3">
                  <div className="text-4xl animate-pulse">🎞️</div>
                  <p className="font-medium">Prompt Director is building your shots...</p>
                  <p className="text-sm text-muted-foreground">Applying product rules, camera specs, lighting</p>
                </div>
              </div>
            )}

            {prompts && (
              <div className="space-y-4 animate-fade-in">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold">hippo float {product.charAt(0) + product.slice(1).toLowerCase()} — {color} — {style.replace(/_/g, " ")}</h3>
                  <Badge variant="success">{prompts.length} shots</Badge>
                </div>

                {prompts.map((shot, i) => (
                  <Card key={i} className="glass-card">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="default" className="text-xs">Shot {shot.shot_number}</Badge>
                          <span className="text-sm font-medium">{shot.shot_name}</span>
                        </div>
                        <span className={`text-xs font-medium ${TOOL_COLORS[shot.generation_tool]}`}>
                          {shot.generation_tool}
                        </span>
                      </div>

                      <div className="bg-background/50 rounded-lg p-3 relative group">
                        <p className="text-xs text-muted-foreground leading-relaxed font-mono">{shot.full_prompt}</p>
                        <button
                          onClick={() => copyPrompt(i, shot.full_prompt)}
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-sky-500 text-white text-xs px-2 py-1 rounded"
                        >
                          {copied === i ? "Copied!" : "Copy"}
                        </button>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div>
                          <p className="text-muted-foreground">Camera</p>
                          <p className="text-foreground/80">{shot.camera_specs}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Lighting</p>
                          <p className="text-foreground/80">{shot.lighting}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Motion</p>
                          <p className="text-foreground/80">{shot.motion_notes}</p>
                        </div>
                      </div>

                      <div className="border-t border-border/50 pt-2">
                        <p className="text-xs text-red-400/80"><span className="font-medium">Negative: </span>{shot.negative_prompt}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ShotPrompt } from "@/agents/prompt-director";

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

const TOOL_BADGE: Record<string, string> = {
  midjourney: "text-violet-400 border-violet-500/30 bg-violet-500/10",
  dalle3: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
  kling: "text-sky-400 border-sky-500/30 bg-sky-500/10",
  runway: "text-orange-400 border-orange-500/30 bg-orange-500/10",
  sora: "text-pink-400 border-pink-500/30 bg-pink-500/10",
};

export default function PromptsPage() {
  const [product, setProduct] = useState("JOY");
  const [color, setColor] = useState("Pink");
  const [style, setStyle] = useState("CINEMATIC_LUXURY");
  const [concept, setConcept] = useState("");
  const [generating, setGenerating] = useState(false);
  const [shotPrompt, setShotPrompt] = useState<ShotPrompt | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<"prompt" | "negative" | null>(null);
  const [generatingImage, setGeneratingImage] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!concept.trim()) return;
    setGenerating(true);
    setError(null);
    setShotPrompt(null);

    const response = await fetch("/api/agents/prompt-director", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        product: `hippo float ${product.charAt(0) + product.slice(1).toLowerCase()}`,
        color,
        concept,
        style,
      }),
    });

    const json = await response.json();

    if (!response.ok || !json.success) {
      setError(json.error ?? "Failed to generate prompt. Make sure ANTHROPIC_API_KEY is set in your Vercel environment variables.");
      setGenerating(false);
      return;
    }

    setShotPrompt(json.data as ShotPrompt);
    setGeneratedImageUrl(null);
    setImageError(null);
    setGenerating(false);
  };

  const handleGenerateImage = async () => {
    if (!shotPrompt?.full_prompt) return;
    setGeneratingImage(true);
    setImageError(null);

    const res = await fetch("/api/agents/generate-image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: shotPrompt.full_prompt, size: "1792x1024" }),
    });
    const json = await res.json();

    if (!res.ok || !json.success) {
      setImageError(json.error ?? "Image generation failed. Make sure OPENAI_API_KEY is set in your Vercel environment variables.");
      setGeneratingImage(false);
      return;
    }

    setGeneratedImageUrl(json.url);
    setGeneratingImage(false);
  };

  const copyText = (text: string, key: "prompt" | "negative") => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const selectedProductSpec = PRODUCTS.find((p) => p.id === product);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-muted-foreground hover:text-foreground transition-colors text-sm"
            >
              ← Dashboard
            </Link>
            <span className="text-border">/</span>
            <span className="text-sm font-medium">📷 Prompt Studio</span>
          </div>
          <Badge variant="gold">Cinematic Prompt Engine</Badge>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

          {/* ── Left: Controls (2/5) ── */}
          <div className="lg:col-span-2 space-y-5">
            <div>
              <h2 className="text-xl font-bold mb-1">Prompt Studio</h2>
              <p className="text-sm text-muted-foreground">
                Hollywood-quality AI prompts — enforces all product rules automatically
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Product</label>
              <div className="grid grid-cols-2 gap-2">
                {PRODUCTS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      setProduct(p.id);
                      setColor(COLORS[p.id][0]);
                    }}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      product === p.id
                        ? "border-sky-500 bg-sky-500/10"
                        : "border-border hover:border-border/80"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="text-base">{p.emoji}</span>
                      <span className="font-medium text-sm">{p.label}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{p.shape}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Color</label>
              <div className="flex flex-wrap gap-1.5">
                {COLORS[product]?.map((c) => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    className={`px-2.5 py-1 rounded-full text-xs border transition-all ${
                      color === c
                        ? "border-sky-500 bg-sky-500/20 text-sky-400"
                        : "border-border text-muted-foreground hover:border-border/80"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Style</label>
              <div className="grid grid-cols-2 gap-2">
                {STYLES.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setStyle(s.id)}
                    className={`flex items-center gap-1.5 p-2.5 rounded-lg border text-sm transition-all ${
                      style === s.id
                        ? "border-sky-500 bg-sky-500/10 text-sky-400"
                        : "border-border text-muted-foreground hover:border-border/80"
                    }`}
                  >
                    <span>{s.emoji}</span> {s.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Scene Description</label>
              <Textarea
                placeholder={`Describe the shot. Example: Woman floating on ${selectedProductSpec?.label ?? "Joy"} in crystal clear water at a luxury resort pool, anchor system visible underwater, golden hour light...`}
                value={concept}
                onChange={(e) => setConcept(e.target.value)}
                className="h-28"
              />
            </div>

            <Button
              className="w-full gap-2"
              onClick={handleGenerate}
              disabled={generating || !concept.trim()}
            >
              {generating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Prompt Director building...
                </>
              ) : (
                <><span>📷</span> Generate Prompt</>
              )}
            </Button>

            {error && (
              <div className="p-3 rounded-lg border border-red-500/30 bg-red-500/10 text-red-400 text-sm">
                {error}
              </div>
            )}

            <Card className="glass-card border-amber-500/20">
              <CardContent className="p-4">
                <p className="text-xs text-amber-400 font-medium mb-2">
                  Product rules enforced automatically:
                </p>
                <ul className="space-y-1 text-xs text-muted-foreground">
                  <li>✓ Correct shape for {selectedProductSpec?.label} ({selectedProductSpec?.shape})</li>
                  <li>✓ Anchor bag always underwater</li>
                  <li>✓ Blue rope always visible</li>
                  <li>✓ Yellow buoy at water surface</li>
                  <li>✓ hippo logo preserved</li>
                  <li>✓ {color} color specified</li>
                  {product === "CHILL" && (
                    <li className="text-emerald-400">✓ Green anchor bag (Chill rule)</li>
                  )}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* ── Right: Output (3/5) ── */}
          <div className="lg:col-span-3 space-y-4">
            {!shotPrompt && !generating && !error && (
              <div className="h-full flex items-center justify-center border border-dashed border-border/50 rounded-xl min-h-[500px]">
                <div className="text-center text-muted-foreground">
                  <p className="text-4xl mb-3">📷</p>
                  <p className="font-medium">Your prompt will appear here</p>
                  <p className="text-sm mt-1">
                    Prompt Director enforces all product rules automatically
                  </p>
                </div>
              </div>
            )}

            {generating && (
              <div className="h-full flex items-center justify-center min-h-[500px]">
                <div className="text-center space-y-3">
                  <div className="text-4xl animate-pulse">🎞️</div>
                  <p className="font-medium">Prompt Director building your shot...</p>
                  <p className="text-sm text-muted-foreground">
                    Applying product shape rules, anchor system, camera specs, lighting
                  </p>
                </div>
              </div>
            )}

            {shotPrompt && (
              <div className="space-y-4 animate-fade-in">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold">
                    {shotPrompt.shot_name ?? `Shot ${shotPrompt.shot_number}`}
                  </h3>
                  <div className="flex items-center gap-2">
                    {shotPrompt.generation_tool && (
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full border ${
                          TOOL_BADGE[shotPrompt.generation_tool] ?? "text-muted-foreground"
                        }`}
                      >
                        {shotPrompt.generation_tool}
                      </span>
                    )}
                    <Badge variant="success">Ready</Badge>
                  </div>
                </div>

                {/* Main prompt */}
                <Card className="glass-card">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
                        Generation Prompt
                      </p>
                      <button
                        onClick={() => copyText(shotPrompt.full_prompt, "prompt")}
                        className="text-xs px-3 py-1 rounded bg-sky-500 text-white hover:bg-sky-400 transition-colors"
                      >
                        {copied === "prompt" ? "Copied!" : "Copy"}
                      </button>
                    </div>
                    <p className="text-sm text-foreground/80 leading-relaxed font-mono bg-background/60 rounded-lg p-3">
                      {shotPrompt.full_prompt}
                    </p>
                  </CardContent>
                </Card>

                {/* DALL-E 3 Generate Image */}
                <div className="space-y-3">
                  <button
                    onClick={handleGenerateImage}
                    disabled={generatingImage}
                    className="w-full h-11 bg-[#00d4ff] text-background font-mono text-sm font-bold tracking-wider uppercase hover:bg-[#00d4ff]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {generatingImage ? (
                      <>
                        <div className="w-4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin" />
                        Generating with DALL-E 3...
                      </>
                    ) : (
                      "Generate Image with DALL-E 3"
                    )}
                  </button>

                  {imageError && (
                    <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 p-3 rounded-sm">
                      {imageError}
                    </p>
                  )}

                  {generatedImageUrl && (
                    <div className="relative border border-border rounded-sm overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={generatedImageUrl}
                        alt="DALL-E 3 generated Hippo Float"
                        className="w-full"
                      />
                      <div className="absolute top-3 right-3 flex gap-2">
                        <a
                          href={generatedImageUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 bg-background/80 backdrop-blur text-foreground text-xs font-mono hover:bg-background transition-colors border border-border"
                        >
                          Open Full Size
                        </a>
                        <a
                          href={generatedImageUrl}
                          download="hippo-float-dalle3.jpg"
                          className="px-3 py-1.5 bg-[#00d4ff] text-background text-xs font-mono font-bold hover:bg-[#00d4ff]/90 transition-colors"
                        >
                          Download
                        </a>
                      </div>
                      <div className="absolute bottom-3 left-3">
                        <span className="px-2 py-1 bg-background/80 backdrop-blur text-xs font-mono text-[#00d4ff] border border-[#00d4ff]/30">
                          DALL-E 3 HD · 1792×1024
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Negative prompt */}
                {shotPrompt.negative_prompt && (
                  <Card className="glass-card border-red-500/20">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs text-red-400 uppercase tracking-wide font-medium">
                          Negative Prompt
                        </p>
                        <button
                          onClick={() => copyText(shotPrompt.negative_prompt!, "negative")}
                          className="text-xs px-3 py-1 rounded bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors border border-red-500/30"
                        >
                          {copied === "negative" ? "Copied!" : "Copy"}
                        </button>
                      </div>
                      <p className="text-xs text-muted-foreground font-mono leading-relaxed">
                        {shotPrompt.negative_prompt}
                      </p>
                    </CardContent>
                  </Card>
                )}

                {/* Technical specs */}
                <Card className="glass-card">
                  <CardContent className="p-4">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-3">
                      Technical Specs
                    </p>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                      {shotPrompt.camera_specs && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-0.5">Camera</p>
                          <p className="text-foreground/80">{shotPrompt.camera_specs}</p>
                        </div>
                      )}
                      {shotPrompt.lighting && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-0.5">Lighting</p>
                          <p className="text-foreground/80">{shotPrompt.lighting}</p>
                        </div>
                      )}
                      {shotPrompt.motion_notes && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-0.5">Motion</p>
                          <p className="text-foreground/80">{shotPrompt.motion_notes}</p>
                        </div>
                      )}
                      {shotPrompt.continuity_notes && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-0.5">Continuity</p>
                          <p className="text-foreground/80">{shotPrompt.continuity_notes}</p>
                        </div>
                      )}
                    </div>
                    {(shotPrompt.product_rules_applied ?? []).length > 0 && (
                      <div className="mt-3 pt-3 border-t border-border/50">
                        <p className="text-xs text-muted-foreground mb-2">Rules enforced:</p>
                        <div className="flex flex-wrap gap-1">
                          {shotPrompt.product_rules_applied.map((rule) => (
                            <span
                              key={rule}
                              className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full px-2 py-0.5"
                            >
                              ✓ {rule}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

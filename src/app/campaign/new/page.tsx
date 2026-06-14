"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { Script } from "@/agents/script-studio";
import type { PostPackage } from "@/agents/social-agent";

const PRODUCTS = [
  { id: "Joy", label: "hippo float Joy", shape: "Luxury Lounger/Recliner", msrp: "$89.99", emoji: "🛋️" },
  { id: "Chill", label: "hippo float Chill", shape: "U-Shape Ring Float", msrp: "$69.99", emoji: "💎" },
  { id: "Fun", label: "hippo float Fun", shape: "Cylinder Torpedo Tube", msrp: "$49.99", emoji: "🎯" },
  { id: "Vibes", label: "hippo float Vibes", shape: "Flat Mat with Texture", msrp: "$69.99", emoji: "🌊" },
];

const COLORS: Record<string, string[]> = {
  Joy: ["Pink", "Blue", "Flower Print Orange", "Citrus Print Green"],
  Chill: ["Pink", "Orange", "Blue", "Flower Print Orange", "Citrus Print Green"],
  Fun: ["Pink", "Blue", "Green", "Flower Print Orange"],
  Vibes: ["Pink", "Orange", "Flower Print Orange", "Blue", "Citrus Print Green"],
};

const STYLES = [
  { id: "CINEMATIC_LUXURY", label: "Cinematic Luxury", desc: "Apple/Nike level — aspirational and premium", emoji: "🎞️" },
  { id: "TIKTOK_VIRAL", label: "TikTok Viral", desc: "Hook-first, energetic, scroll-stopping", emoji: "📱" },
  { id: "PRODUCT_DEMO", label: "Product Demo", desc: "Feature-forward anchor system showcase", emoji: "⚓" },
  { id: "EMOTIONAL_STORY", label: "Emotional Story", desc: "Human connection and memory-making", emoji: "❤️" },
  { id: "BRAND_FILM", label: "Brand Film", desc: "60-180 second cinematic brand statement", emoji: "🎬" },
  { id: "LIFESTYLE_BEACH", label: "Lifestyle Beach", desc: "Authentic summer lifestyle content", emoji: "🏖️" },
];

const PLATFORMS = [
  { id: "tiktok", label: "TikTok", emoji: "🎵" },
  { id: "instagram", label: "Instagram", emoji: "📸" },
  { id: "youtube", label: "YouTube", emoji: "▶️" },
  { id: "facebook", label: "Facebook", emoji: "📘" },
];

interface FormData {
  name: string;
  product: string;
  color: string;
  style: string;
  platforms: string[];
  objective: string;
  keyMessage: string;
  tone: string;
}

interface CampaignResult {
  title: string;
  product: string;
  script: Script | null;
  captions: PostPackage | null;
  status: "success" | "partial" | "failed";
  errors: string[];
}

export default function NewCampaignPage() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormData>({
    name: "",
    product: "",
    color: "",
    style: "",
    platforms: [],
    objective: "",
    keyMessage: "",
    tone: "",
  });
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<CampaignResult | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const totalSteps = 4;
  const progress = (step / totalSteps) * 100;

  const togglePlatform = (id: string) => {
    setForm((f) => ({
      ...f,
      platforms: f.platforms.includes(id)
        ? f.platforms.filter((p) => p !== id)
        : [...f.platforms, id],
    }));
  };

  const canProceed = () => {
    if (step === 1) return !!form.product;
    if (step === 2) return !!form.style && form.platforms.length > 0;
    if (step === 3) return !!form.name && !!form.objective;
    return true;
  };

  const copyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleGenerate = async () => {
    setGenerating(true);
    setApiError(null);
    setResult(null);

    const response = await fetch("/api/campaign/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: form.name,
        product: `hippo float ${form.product}`,
        productColor: form.color || undefined,
        platforms: form.platforms,
        style: form.style,
        objective: form.objective,
        keyMessage: form.keyMessage || undefined,
      }),
    });

    const json = await response.json();

    if (!response.ok || !json.success) {
      setApiError(json.error ?? "Campaign generation failed. Check your OPENAI_API_KEY.");
      setGenerating(false);
      return;
    }

    setResult(json.data as CampaignResult);
    setGenerating(false);
  };

  if (apiError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="max-w-lg w-full space-y-4 text-center">
          <p className="text-4xl">⚠️</p>
          <h2 className="text-xl font-bold">Generation Failed</h2>
          <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg p-4">{apiError}</p>
          <button onClick={() => setApiError(null)} className="text-sm text-sky-400 hover:underline">
            ← Try again
          </button>
        </div>
      </div>
    );
  }

  if (generating) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="max-w-lg w-full space-y-6 text-center">
          <div className="text-5xl animate-pulse">🎬</div>
          <h2 className="text-2xl font-bold">Generating Campaign</h2>
          <p className="text-muted-foreground text-sm">
            Script Studio + Social Agent working in parallel...
          </p>
          <div className="space-y-3 text-left">
            {[
              { emoji: "🎬", name: "Script Studio", desc: "Writing Hollywood-quality script..." },
              { emoji: "📱", name: "Social Agent", desc: "Crafting platform-optimized captions..." },
            ].map((a) => (
              <div key={a.name} className="flex items-center gap-3 p-3 rounded-lg border border-sky-500/50 bg-sky-500/5">
                <span className="text-xl">{a.emoji}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium">{a.name}</p>
                  <p className="text-xs text-muted-foreground">{a.desc}</p>
                </div>
                <div className="w-4 h-4 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (result) {
    const { script, captions } = result;
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
          <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                ← Dashboard
              </Link>
              <span className="text-border">/</span>
              <span className="text-sm font-medium">{result.title}</span>
            </div>
            <Badge variant="success">Campaign Ready</Badge>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-6 py-8 space-y-6">
          {result.errors.length > 0 && (
            <div className="p-3 rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-400 text-sm">
              Partial results — some agents failed: {result.errors.join("; ")}
            </div>
          )}

          {/* Script */}
          {script && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold">🎬 Script: {script.title}</h2>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{script.platform}</Badge>
                  <Badge variant="outline">{script.total_duration_seconds}s</Badge>
                </div>
              </div>

              <Card className="glass-card border-sky-500/20">
                <CardContent className="p-4 space-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-1">Hook</p>
                    <p className="text-sm font-medium text-sky-400">{script.hook}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-1">Concept</p>
                    <p className="text-sm text-foreground/80">{script.concept}</p>
                  </div>
                  {script.emotional_arc && (
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-1">Emotional Arc</p>
                      <p className="text-sm text-foreground/80">{script.emotional_arc}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {script.beat_sheet && script.beat_sheet.length > 0 && (
                <Card className="glass-card">
                  <CardContent className="p-4">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-3">Beat Sheet</p>
                    <div className="space-y-2">
                      {script.beat_sheet.map((beat, i) => (
                        <div key={i} className="flex items-start gap-2 text-sm">
                          <span className="text-sky-400 font-bold shrink-0">{i + 1}.</span>
                          <span className="text-foreground/80">{beat}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {script.scenes && script.scenes.length > 0 && (
                <Card className="glass-card">
                  <CardContent className="p-4">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-3">
                      Scenes ({script.scenes.length})
                    </p>
                    <div className="space-y-4">
                      {script.scenes.map((scene, i) => (
                        <div key={i} className="border-l-2 border-sky-500/30 pl-3 space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-sky-400 font-bold">SCENE {scene.scene_number}</span>
                            <span className="text-xs text-muted-foreground">{scene.shot_type}</span>
                            <span className="text-xs text-muted-foreground">{scene.duration_seconds}s</span>
                          </div>
                          <p className="text-sm text-foreground/80">{scene.visual}</p>
                          {scene.audio && (
                            <p className="text-xs text-muted-foreground italic">{scene.audio}</p>
                          )}
                          {scene.on_screen_text && (
                            <p className="text-xs text-amber-400">&quot;{scene.on_screen_text}&quot;</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {script.music_direction && (
                  <Card className="glass-card">
                    <CardContent className="p-4">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-2">Music</p>
                      <p className="text-sm text-foreground/80">{script.music_direction}</p>
                    </CardContent>
                  </Card>
                )}
                {script.cta && (
                  <Card className="glass-card border-emerald-500/20">
                    <CardContent className="p-4">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-2">CTA</p>
                      <p className="text-sm text-emerald-400 font-medium">{script.cta}</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}

          {/* Captions */}
          {captions && captions.posts && captions.posts.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold">📱 Social Media Captions</h2>
              <div className="space-y-3">
                {captions.posts.map((post, i) => (
                  <Card key={i} className="glass-card">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm">
                            {post.platform === "tiktok" ? "🎵" : post.platform === "instagram" ? "📸" : post.platform === "youtube" ? "▶️" : "📘"}
                          </span>
                          <span className="text-sm font-medium capitalize">{post.platform}</span>
                        </div>
                        <button
                          onClick={() => copyText(post.full_post, `post-${i}`)}
                          className="text-xs px-3 py-1 rounded bg-sky-500 text-white hover:bg-sky-400 transition-colors"
                        >
                          {copied === `post-${i}` ? "Copied!" : "Copy"}
                        </button>
                      </div>
                      {post.hook_line && (
                        <p className="text-xs text-sky-400 font-medium mb-2">Hook: {post.hook_line}</p>
                      )}
                      <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap font-mono bg-background/60 rounded-lg p-3">
                        {post.full_post}
                      </p>
                      {post.cta && (
                        <p className="text-xs text-emerald-400 mt-2">CTA: {post.cta}</p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Link href="/" className="flex-1">
              <Button variant="outline" className="w-full">Back to Dashboard</Button>
            </Link>
            <Button className="flex-1" onClick={() => {
              setResult(null);
              setStep(1);
              setForm({ name: "", product: "", color: "", style: "", platforms: [], objective: "", keyMessage: "", tone: "" });
            }}>
              New Campaign
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
              ← Dashboard
            </Link>
            <span className="text-border">/</span>
            <span className="text-sm font-medium">New Campaign</span>
          </div>
          <Badge variant="outline">Step {step} of {totalSteps}</Badge>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8 space-y-6">
        <Progress value={progress} className="h-1" />

        {/* Step 1: Product */}
        {step === 1 && (
          <div className="space-y-4 animate-fade-in">
            <div>
              <h2 className="text-2xl font-bold mb-1">Choose Product</h2>
              <p className="text-muted-foreground text-sm">Which Hippo Float are you promoting?</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {PRODUCTS.map((product) => (
                <button
                  key={product.id}
                  onClick={() => setForm((f) => ({ ...f, product: product.id, color: "" }))}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    form.product === product.id
                      ? "border-sky-500 bg-sky-500/10 glow-blue"
                      : "border-border hover:border-border/80 bg-card"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{product.emoji}</span>
                    <span className="font-semibold">{product.label}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{product.shape}</p>
                  <p className="text-xs text-amber-400 mt-1 font-medium">MSRP {product.msrp}</p>
                </button>
              ))}
            </div>

            {form.product && (
              <div className="space-y-2 animate-fade-in">
                <p className="text-sm font-medium text-muted-foreground">Select color variant:</p>
                <div className="flex flex-wrap gap-2">
                  {COLORS[form.product]?.map((color) => (
                    <button
                      key={color}
                      onClick={() => setForm((f) => ({ ...f, color }))}
                      className={`px-3 py-1.5 rounded-full text-sm border transition-all ${
                        form.color === color
                          ? "border-sky-500 bg-sky-500/20 text-sky-400"
                          : "border-border text-muted-foreground hover:border-border/80"
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Style & Platforms */}
        {step === 2 && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="text-2xl font-bold mb-1">Campaign Style</h2>
              <p className="text-muted-foreground text-sm">Choose the creative direction and target platforms</p>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Style</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {STYLES.map((style) => (
                  <button
                    key={style.id}
                    onClick={() => setForm((f) => ({ ...f, style: style.id }))}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      form.style === style.id
                        ? "border-sky-500 bg-sky-500/10 glow-blue"
                        : "border-border hover:border-border/80 bg-card"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span>{style.emoji}</span>
                      <span className="font-medium text-sm">{style.label}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{style.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Platforms</p>
              <div className="flex flex-wrap gap-2">
                {PLATFORMS.map((platform) => (
                  <button
                    key={platform.id}
                    onClick={() => togglePlatform(platform.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm transition-all ${
                      form.platforms.includes(platform.id)
                        ? "border-sky-500 bg-sky-500/20 text-sky-400"
                        : "border-border text-muted-foreground hover:border-border/80"
                    }`}
                  >
                    <span>{platform.emoji}</span>
                    <span>{platform.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Brief */}
        {step === 3 && (
          <div className="space-y-4 animate-fade-in">
            <div>
              <h2 className="text-2xl font-bold mb-1">Campaign Brief</h2>
              <p className="text-muted-foreground text-sm">Tell the AI agents what you want to achieve</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Campaign Name</label>
                <Input
                  placeholder="e.g. Summer 2026 Joy Launch"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Objective</label>
                <Textarea
                  placeholder="e.g. Launch hippo float Joy to beach lifestyle audience. Show the anchor system in action at a tropical location. Create FOMO..."
                  value={form.objective}
                  onChange={(e) => setForm((f) => ({ ...f, objective: e.target.value }))}
                  className="h-28"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Key Message <span className="text-muted-foreground font-normal">(optional)</span></label>
                <Input
                  placeholder="e.g. Never drift again — drift-free luxury starts here"
                  value={form.keyMessage}
                  onChange={(e) => setForm((f) => ({ ...f, keyMessage: e.target.value }))}
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Review */}
        {step === 4 && (
          <div className="space-y-4 animate-fade-in">
            <div>
              <h2 className="text-2xl font-bold mb-1">Review & Launch</h2>
              <p className="text-muted-foreground text-sm">Confirm your campaign details</p>
            </div>

            <Card className="glass-card">
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Campaign</p>
                    <p className="font-medium">{form.name}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Product</p>
                    <p className="font-medium">hippo float {form.product} {form.color && `(${form.color})`}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Style</p>
                    <p className="font-medium">{STYLES.find((s) => s.id === form.style)?.label}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Platforms</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {form.platforms.map((p) => (
                        <Badge key={p} variant="secondary" className="text-xs">{p}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="border-t border-border/50 pt-4">
                  <p className="text-muted-foreground text-sm">Objective</p>
                  <p className="text-sm mt-1">{form.objective}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-sky-500/20">
              <CardContent className="p-4">
                <p className="text-sm font-medium mb-3">Will run these agents in parallel:</p>
                <div className="flex gap-6">
                  <div className="flex items-center gap-2 text-sm">
                    <span>🎬</span>
                    <span className="text-muted-foreground">Script Studio</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span>📱</span>
                    <span className="text-muted-foreground">Social Agent</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">Estimated time: 20-30 seconds</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Navigation */}
        <div className="flex gap-3 pt-4">
          {step > 1 && (
            <Button variant="outline" onClick={() => setStep((s) => s - 1)}>
              Back
            </Button>
          )}
          <div className="flex-1" />
          {step < totalSteps ? (
            <Button onClick={() => setStep((s) => s + 1)} disabled={!canProceed()}>
              Continue
            </Button>
          ) : (
            <Button size="lg" onClick={handleGenerate} className="gap-2">
              <span>🚀</span> Generate Campaign
            </Button>
          )}
        </div>
      </main>
    </div>
  );
}

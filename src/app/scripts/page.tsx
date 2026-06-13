"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Script } from "@/agents/script-studio";

const STYLES = [
  { id: "CINEMATIC_LUXURY", label: "Cinematic", emoji: "🎞️" },
  { id: "TIKTOK_VIRAL", label: "TikTok Viral", emoji: "📱" },
  { id: "PRODUCT_DEMO", label: "Product Demo", emoji: "⚓" },
  { id: "EMOTIONAL_STORY", label: "Emotional", emoji: "❤️" },
  { id: "BRAND_FILM", label: "Brand Film", emoji: "🎬" },
  { id: "LIFESTYLE_BEACH", label: "Lifestyle", emoji: "🏖️" },
];

const PLATFORMS = [
  { id: "tiktok", label: "TikTok", emoji: "🎵", duration: "25s" },
  { id: "instagram", label: "Instagram", emoji: "📸", duration: "30s" },
  { id: "youtube", label: "YouTube", emoji: "▶️", duration: "60s" },
];

const PRODUCTS = ["Joy", "Chill", "Fun", "Vibes"];

export default function ScriptsPage() {
  const [selectedStyle, setSelectedStyle] = useState("CINEMATIC_LUXURY");
  const [selectedPlatform, setSelectedPlatform] = useState("instagram");
  const [selectedProduct, setSelectedProduct] = useState("Joy");
  const [brief, setBrief] = useState("");
  const [generating, setGenerating] = useState(false);
  const [script, setScript] = useState<Script | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!brief.trim()) return;
    setGenerating(true);
    setError(null);
    setScript(null);

    const response = await fetch("/api/agents/script-studio", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        product: `hippo float ${selectedProduct}`,
        platform: selectedPlatform,
        style: selectedStyle,
        objective: brief,
      }),
    });

    const json = await response.json();

    if (!response.ok || !json.success) {
      setError(json.error ?? "Failed to generate script. Check your OPENAI_API_KEY.");
      setGenerating(false);
      return;
    }

    setScript(json.data as Script);
    setGenerating(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
              ← Dashboard
            </Link>
            <span className="text-border">/</span>
            <span className="text-sm font-medium">🎬 Script Studio</span>
          </div>
          <Badge variant="gold">Hollywood Script Engine</Badge>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* ── Left: Controls ── */}
          <div className="space-y-5">
            <div>
              <h2 className="text-xl font-bold mb-1">Script Studio</h2>
              <p className="text-sm text-muted-foreground">
                Hollywood-quality commercial scripts — powered by Script Studio AI agent
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Product</label>
              <div className="flex flex-wrap gap-2">
                {PRODUCTS.map((p) => (
                  <button
                    key={p}
                    onClick={() => setSelectedProduct(p)}
                    className={`px-3 py-1.5 rounded-full text-sm border transition-all ${
                      selectedProduct === p
                        ? "border-sky-500 bg-sky-500/20 text-sky-400"
                        : "border-border text-muted-foreground"
                    }`}
                  >
                    hippo float {p}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Platform</label>
              <div className="flex gap-2">
                {PLATFORMS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPlatform(p.id)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm transition-all ${
                      selectedPlatform === p.id
                        ? "border-sky-500 bg-sky-500/10 text-sky-400"
                        : "border-border text-muted-foreground"
                    }`}
                  >
                    <span>{p.emoji}</span> {p.label}
                    <span className="text-xs text-muted-foreground ml-1">({p.duration})</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Style</label>
              <div className="grid grid-cols-3 gap-2">
                {STYLES.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setSelectedStyle(s.id)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm transition-all ${
                      selectedStyle === s.id
                        ? "border-sky-500 bg-sky-500/10 text-sky-400"
                        : "border-border text-muted-foreground"
                    }`}
                  >
                    <span>{s.emoji}</span> {s.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Brief</label>
              <Textarea
                placeholder={`Describe what you want. Example: Show hippo float ${selectedProduct} at a tropical beach club. Highlight the anchor system keeping the float perfectly still while everyone else drifts away. Target: luxury-minded beach lovers aged 25-40.`}
                value={brief}
                onChange={(e) => setBrief(e.target.value)}
                className="h-36"
              />
            </div>

            <Button
              className="w-full gap-2"
              size="lg"
              onClick={handleGenerate}
              disabled={generating || !brief.trim()}
            >
              {generating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Script Studio writing...
                </>
              ) : (
                <><span>🎬</span> Generate Script</>
              )}
            </Button>

            {error && (
              <div className="p-3 rounded-lg border border-red-500/30 bg-red-500/10 text-red-400 text-sm">
                {error}
              </div>
            )}
          </div>

          {/* ── Right: Script Output ── */}
          <div className="space-y-4">
            {!script && !generating && !error && (
              <div className="h-full flex items-center justify-center border border-dashed border-border/50 rounded-xl min-h-[400px]">
                <div className="text-center text-muted-foreground">
                  <p className="text-4xl mb-3">🎬</p>
                  <p className="font-medium">Your script will appear here</p>
                  <p className="text-sm mt-1">Script Studio AI will write a complete cinematic script</p>
                </div>
              </div>
            )}

            {generating && (
              <div className="h-full flex items-center justify-center min-h-[400px]">
                <div className="text-center space-y-3">
                  <div className="text-4xl animate-pulse">🎬</div>
                  <p className="font-medium">Script Studio is writing...</p>
                  <p className="text-sm text-muted-foreground">
                    Hollywood-quality script with product rules enforced
                  </p>
                </div>
              </div>
            )}

            {script && (
              <div className="space-y-4 animate-fade-in">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold truncate">{script.title}</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigator.clipboard.writeText(JSON.stringify(script, null, 2))}
                  >
                    Copy JSON
                  </Button>
                </div>

                <Card className="glass-card border-sky-500/30">
                  <CardContent className="p-4">
                    <p className="text-xs text-muted-foreground font-medium mb-2 uppercase tracking-wide">
                      Hook
                    </p>
                    <p className="text-sm italic">"{script.hook}"</p>
                  </CardContent>
                </Card>

                <Tabs defaultValue="beats">
                  <TabsList className="w-full">
                    <TabsTrigger value="beats" className="flex-1">Beat Sheet</TabsTrigger>
                    <TabsTrigger value="scenes" className="flex-1">Scenes</TabsTrigger>
                    <TabsTrigger value="direction" className="flex-1">Direction</TabsTrigger>
                  </TabsList>

                  <TabsContent value="beats">
                    <div className="space-y-2 mt-2">
                      {(script.beat_sheet ?? []).map((beat, i) => (
                        <div key={i} className="flex gap-3 p-3 bg-card rounded-lg border border-border/50">
                          <span className="text-sky-400 text-xs font-bold mt-0.5 shrink-0 font-mono">
                            {String(i + 1).padStart(2, "0")}
                          </span>
                          <p className="text-sm text-muted-foreground">{beat}</p>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="scenes">
                    <div className="space-y-3 mt-2">
                      {(script.scenes ?? []).map((scene) => (
                        <Card key={scene.scene_number} className="glass-card">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="default" className="text-xs">
                                Scene {scene.scene_number}
                              </Badge>
                              <span className="text-xs text-muted-foreground">{scene.shot_type}</span>
                              <span className="text-xs text-muted-foreground ml-auto">{scene.duration_seconds}s</span>
                            </div>
                            <p className="text-sm mb-1.5">
                              <span className="text-muted-foreground text-xs uppercase tracking-wide mr-1">Visual</span>
                              {scene.visual}
                            </p>
                            <p className="text-sm">
                              <span className="text-muted-foreground text-xs uppercase tracking-wide mr-1">Audio</span>
                              {scene.audio}
                            </p>
                            {scene.on_screen_text && (
                              <p className="text-sm mt-1.5">
                                <span className="text-amber-400 text-xs uppercase tracking-wide mr-1">Text</span>
                                {scene.on_screen_text}
                              </p>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="direction">
                    <Card className="glass-card mt-2">
                      <CardContent className="p-4 space-y-4">
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                            Visual Intention
                          </p>
                          <p className="text-sm">{script.visual_intention}</p>
                        </div>
                        <div className="border-t border-border/50 pt-3">
                          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                            Music Direction
                          </p>
                          <p className="text-sm">{script.music_direction}</p>
                        </div>
                        {script.voiceover && (
                          <div className="border-t border-border/50 pt-3">
                            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                              Voiceover
                            </p>
                            <p className="text-sm italic">{script.voiceover}</p>
                          </div>
                        )}
                        <div className="border-t border-border/50 pt-3">
                          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">CTA</p>
                          <p className="text-sm font-medium">{script.cta}</p>
                        </div>
                        {(script.hashtags ?? []).length > 0 && (
                          <div className="border-t border-border/50 pt-3">
                            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
                              Hashtags
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {script.hashtags!.map((tag) => (
                                <span key={tag} className="text-xs bg-secondary rounded-full px-2 py-0.5">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

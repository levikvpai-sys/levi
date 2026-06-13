"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

const MOCK_SCRIPT = {
  title: "hippo float Joy — Float Your Way to Paradise",
  hook: "The moment you stop fighting the current and start floating with it.",
  beat_sheet: [
    "0-3s: HOOK — Aerial drone over crystal turquoise water. A Joy float drifts into frame, anchor rope visible.",
    "3-8s: DESIRE — Close up on woman lying back on Joy float, sunglasses on, impossibly relaxed.",
    "8-18s: REVEAL — Underwater split shot. Above: her floating perfectly still. Below: anchor bag stationary on sandy bottom.",
    "18-25s: PAYOFF — She reaches for her drink (cup holder), smiles. Text: 'Stay where you float'",
    "25-28s: CTA — Logo and product shot. 'hippofloat.com'",
  ],
  scenes: [
    { scene_number: 1, shot_type: "Aerial drone wide", duration_seconds: 3, visual: "Crystal turquoise water, Joy float enters frame from right, anchor rope barely visible below surface", audio: "Ambient ocean sound builds slowly" },
    { scene_number: 2, shot_type: "Medium close-up", duration_seconds: 5, visual: "Woman on Joy float, white bikini, sunglasses, genuinely relaxed — not posed. Golden hour light.", audio: "Soft electronic/ambient music begins" },
    { scene_number: 3, shot_type: "Underwater split", duration_seconds: 10, visual: "SPLIT SHOT: Above water — Joy float with woman. Below — anchor bag perfectly stationary, blue rope taut, yellow buoy at surface.", audio: "Music swells" },
    { scene_number: 4, shot_type: "Close detail", duration_seconds: 7, visual: "Her hand reaches for drink in cup holder. She smiles. Text overlay: STAY WHERE YOU FLOAT", audio: "Warm musical resolution" },
    { scene_number: 5, shot_type: "Product hero", duration_seconds: 3, visual: "Clean product shot — Joy float on water with anchor system. Logo. hippofloat.com", audio: "Beat drop / silence" },
  ],
  music_direction: "Ambient electronic — Bonobo / Lane 8 style. Builds from quiet to confident.",
  cta: "Stay where you float — hippofloat.com",
};

export default function ScriptsPage() {
  const [selectedStyle, setSelectedStyle] = useState("CINEMATIC_LUXURY");
  const [selectedPlatform, setSelectedPlatform] = useState("instagram");
  const [selectedProduct, setSelectedProduct] = useState("Joy");
  const [brief, setBrief] = useState("");
  const [generating, setGenerating] = useState(false);
  const [script, setScript] = useState<typeof MOCK_SCRIPT | null>(null);

  const handleGenerate = async () => {
    if (!brief.trim()) return;
    setGenerating(true);
    await new Promise((r) => setTimeout(r, 2500));
    setScript(MOCK_SCRIPT);
    setGenerating(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors text-sm">← Dashboard</Link>
            <span className="text-border">/</span>
            <span className="text-sm font-medium">🎬 Script Studio</span>
          </div>
          <Badge variant="gold">Hollywood Script Engine</Badge>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Left: Controls */}
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold mb-1">Script Studio</h2>
              <p className="text-sm text-muted-foreground">Write Hollywood-quality commercial scripts for any platform</p>
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
                placeholder="Describe what you want to achieve. Example: Launch campaign for Joy in blue. Show the anchor system working at a tropical beach. Target audience: 28-38 women who love luxury travel and beach clubs..."
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
                  Writing Script...
                </>
              ) : (
                <><span>🎬</span> Generate Script</>
              )}
            </Button>
          </div>

          {/* Right: Script Output */}
          <div className="space-y-4">
            {!script && !generating && (
              <div className="h-full flex items-center justify-center border border-dashed border-border/50 rounded-xl min-h-[400px]">
                <div className="text-center text-muted-foreground">
                  <p className="text-4xl mb-3">🎬</p>
                  <p className="font-medium">Your script will appear here</p>
                  <p className="text-sm mt-1">Fill in the brief and click Generate</p>
                </div>
              </div>
            )}

            {generating && (
              <div className="h-full flex items-center justify-center min-h-[400px]">
                <div className="text-center space-y-3">
                  <div className="text-4xl animate-pulse">🎬</div>
                  <p className="font-medium">Script Studio is writing...</p>
                  <p className="text-sm text-muted-foreground">Hollywood-quality commercial script in progress</p>
                </div>
              </div>
            )}

            {script && (
              <div className="space-y-4 animate-fade-in">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold">{script.title}</h3>
                  <Button variant="outline" size="sm" onClick={() => navigator.clipboard.writeText(JSON.stringify(script, null, 2))}>
                    Copy Script
                  </Button>
                </div>

                <Card className="glass-card border-sky-500/30">
                  <CardContent className="p-4">
                    <p className="text-xs text-muted-foreground font-medium mb-2">HOOK</p>
                    <p className="text-sm italic">"{script.hook}"</p>
                  </CardContent>
                </Card>

                <Tabs defaultValue="beats">
                  <TabsList className="w-full">
                    <TabsTrigger value="beats" className="flex-1">Beat Sheet</TabsTrigger>
                    <TabsTrigger value="scenes" className="flex-1">Scenes</TabsTrigger>
                    <TabsTrigger value="music" className="flex-1">Direction</TabsTrigger>
                  </TabsList>
                  <TabsContent value="beats">
                    <div className="space-y-2">
                      {script.beat_sheet.map((beat, i) => (
                        <div key={i} className="flex gap-3 p-3 bg-card rounded-lg border border-border/50">
                          <span className="text-sky-400 text-xs font-bold mt-0.5 shrink-0">
                            {String(i + 1).padStart(2, "0")}
                          </span>
                          <p className="text-sm text-muted-foreground">{beat}</p>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                  <TabsContent value="scenes">
                    <div className="space-y-3">
                      {script.scenes.map((scene) => (
                        <Card key={scene.scene_number} className="glass-card">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="default" className="text-xs">Scene {scene.scene_number}</Badge>
                              <span className="text-xs text-muted-foreground">{scene.shot_type}</span>
                              <span className="text-xs text-muted-foreground ml-auto">{scene.duration_seconds}s</span>
                            </div>
                            <p className="text-sm mb-1"><span className="text-muted-foreground">Visual: </span>{scene.visual}</p>
                            <p className="text-sm"><span className="text-muted-foreground">Audio: </span>{scene.audio}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>
                  <TabsContent value="music">
                    <Card className="glass-card">
                      <CardContent className="p-4 space-y-3">
                        <div>
                          <p className="text-xs text-muted-foreground font-medium mb-1">MUSIC</p>
                          <p className="text-sm">{script.music_direction}</p>
                        </div>
                        <div className="border-t border-border/50 pt-3">
                          <p className="text-xs text-muted-foreground font-medium mb-1">CTA</p>
                          <p className="text-sm font-medium">{script.cta}</p>
                        </div>
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

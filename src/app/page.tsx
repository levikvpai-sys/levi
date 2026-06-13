import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AgentCard } from "@/components/agent-card";

const AGENTS = [
  {
    name: "Product Guardian",
    role: "Product Accuracy",
    description: "Enforces all Hippo Float product rules — shapes, colors, anchor system, logo integrity.",
    icon: "🛡️",
    colorClass: "bg-red-500/20 text-red-400",
    status: "idle" as const,
  },
  {
    name: "Brand Director",
    role: "Brand Standards",
    description: "Ensures every output looks, sounds, and feels like premium luxury beach lifestyle.",
    icon: "🎨",
    colorClass: "bg-purple-500/20 text-purple-400",
    status: "idle" as const,
  },
  {
    name: "Script Studio",
    role: "Hollywood Screenwriter",
    description: "Writes cinematic commercial scripts — from TikTok hooks to 3-minute brand films.",
    icon: "🎬",
    colorClass: "bg-amber-500/20 text-amber-400",
    status: "idle" as const,
  },
  {
    name: "Prompt Director",
    role: "Cinematic Prompts",
    description: "Converts scripts into Hollywood-quality AI generation prompts for images and video.",
    icon: "📷",
    colorClass: "bg-sky-500/20 text-sky-400",
    status: "idle" as const,
  },
  {
    name: "Social Agent",
    role: "Social Media Copy",
    description: "Writes platform-optimized captions, hashtags, and CTAs for TikTok, Instagram, YouTube.",
    icon: "📱",
    colorClass: "bg-emerald-500/20 text-emerald-400",
    status: "idle" as const,
  },
  {
    name: "QA Critic",
    role: "Quality Control",
    description: "Reviews all content before publishing — catches product errors and brand violations.",
    icon: "✅",
    colorClass: "bg-orange-500/20 text-orange-400",
    status: "idle" as const,
  },
];

const PRODUCTS = [
  { name: "Joy", style: "HFJOY", shape: "Luxury Lounger", msrp: "$89.99", colors: ["Pink", "Blue", "Flower Orange", "Citrus Green"] },
  { name: "Chill", style: "HFCHILL", shape: "U-Ring Float", msrp: "$69.99", colors: ["Pink", "Orange", "Blue", "Flower Orange", "Citrus Green"] },
  { name: "Fun", style: "HFFUN", shape: "Cylinder Tube", msrp: "$49.99", colors: ["Pink", "Blue", "Green", "Flower Orange"] },
  { name: "Vibes", style: "HFVIBES", shape: "Flat Mat", msrp: "$69.99", colors: ["Pink", "Orange", "Flower Orange", "Blue", "Citrus Green"] },
];

const STATS = [
  { label: "Product Lines", value: "4", sublabel: "Joy · Chill · Fun · Vibes", icon: "🏄" },
  { label: "AI Agents", value: "6", sublabel: "Product to Publish", icon: "🤖" },
  { label: "Platforms", value: "5", sublabel: "TikTok · IG · YT · FB · Pinterest", icon: "📡" },
  { label: "Brand Score", value: "A+", sublabel: "Premium Luxury Tier", icon: "⭐" },
];

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">L</span>
            </div>
            <div>
              <span className="font-bold text-foreground tracking-tight">LEVI</span>
              <span className="text-muted-foreground text-sm ml-2">Brand AI System</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="gold">hippo float</Badge>
            <Badge variant="outline">Summer 2026</Badge>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">

        {/* Hero */}
        <div className="text-center space-y-3 py-6">
          <h1 className="text-4xl font-bold">
            <span className="gradient-text">hippo float</span>
          </h1>
          <p className="text-xl text-muted-foreground">Brand AI Creative System</p>
          <p className="text-sm text-muted-foreground/70 max-w-xl mx-auto">
            6 specialized AI agents working together — from product validation to Hollywood scripts to social publishing
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <Link href="/campaign/new">
              <Button size="lg" className="gap-2">
                <span>🚀</span> New Campaign
              </Button>
            </Link>
            <Link href="/scripts">
              <Button variant="outline" size="lg" className="gap-2">
                <span>🎬</span> Script Studio
              </Button>
            </Link>
            <Link href="/prompts">
              <Button variant="outline" size="lg" className="gap-2">
                <span>📷</span> Prompt Studio
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {STATS.map((stat) => (
            <Card key={stat.label} className="glass-card">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-3xl font-bold gradient-text">{stat.value}</p>
                    <p className="text-sm font-medium text-foreground mt-1">{stat.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{stat.sublabel}</p>
                  </div>
                  <span className="text-2xl">{stat.icon}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Agent Grid */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">AI Agent System</h2>
            <Badge variant="outline" className="text-xs">All agents ready</Badge>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {AGENTS.map((agent) => (
              <AgentCard key={agent.name} {...agent} />
            ))}
          </div>
        </div>

        {/* Products Grid */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Product Lines — Summer Collection 2026</h2>
            <Badge variant="gold">STAY WHERE YOU FLOAT</Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {PRODUCTS.map((product) => (
              <Card key={product.name} className="glass-card hover:border-sky-500/30 transition-colors group">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">
                        hippo float{" "}
                        <span className="gradient-text-gold">{product.name}</span>
                      </CardTitle>
                      <p className="text-xs text-muted-foreground mt-1">{product.shape}</p>
                    </div>
                    <Badge variant="outline" className="text-xs">{product.style}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex flex-wrap gap-1">
                    {product.colors.map((color) => (
                      <span key={color} className="text-xs bg-secondary rounded-full px-2 py-0.5 text-muted-foreground">
                        {color}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-border/50">
                    <span className="text-xs text-muted-foreground">MSRP</span>
                    <span className="text-sm font-bold gradient-text-gold">{product.msrp}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Anchor System Highlight */}
        <Card className="glass-card border-sky-500/30 glow-blue">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="text-4xl">⚓</div>
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-1">
                  2-in-1 Carry Bag & Anchor System
                </h3>
                <p className="text-muted-foreground text-sm mb-4">
                  The core innovation across all Hippo Float products — waterproof dry bag fills with water/sand to anchor the float.
                  This is what makes every Hippo Float drift-free.
                </p>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-blue-400 font-bold">━</span>
                    <span className="text-muted-foreground">Blue twisted nylon rope</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-yellow-400 font-bold">●</span>
                    <span className="text-muted-foreground">Yellow buoy at surface</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sky-400 font-bold">▼</span>
                    <span className="text-muted-foreground">Anchor bag underwater</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground/60 mt-3 font-medium">
                  RULE: In ALL creative content — anchor bag must appear UNDERWATER. Yellow buoy at surface. Blue rope always visible.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/campaign/new" className="block">
            <Card className="glass-card hover:border-sky-500/30 transition-all hover:glow-blue cursor-pointer h-full">
              <CardContent className="p-6 flex flex-col gap-3">
                <span className="text-3xl">🚀</span>
                <div>
                  <h3 className="font-semibold">Create Campaign</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Launch a full multi-platform campaign — scripts, prompts, captions in one flow
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link href="/scripts" className="block">
            <Card className="glass-card hover:border-amber-500/30 transition-all cursor-pointer h-full">
              <CardContent className="p-6 flex flex-col gap-3">
                <span className="text-3xl">🎬</span>
                <div>
                  <h3 className="font-semibold">Script Studio</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Write Hollywood-quality commercial scripts for any platform and style
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link href="/prompts" className="block">
            <Card className="glass-card hover:border-purple-500/30 transition-all cursor-pointer h-full">
              <CardContent className="p-6 flex flex-col gap-3">
                <span className="text-3xl">📷</span>
                <div>
                  <h3 className="font-semibold">Prompt Studio</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Generate cinematic prompts for Midjourney, DALL-E, Kling, Runway, Sora
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

      </main>
    </div>
  );
}

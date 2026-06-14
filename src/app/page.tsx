import Link from "next/link";

const AGENTS = [
  { name: "Product Guardian", role: "Product Accuracy", desc: "Enforces shapes, colors, anchor system, logo integrity across all 4 product lines." },
  { name: "Brand Director",   role: "Brand Standards",  desc: "Ensures every output looks and sounds like premium luxury beach lifestyle." },
  { name: "Script Studio",    role: "Hollywood Scripts", desc: "Cinematic commercial scripts — TikTok hooks to 3-minute brand films." },
  { name: "Prompt Director",  role: "Cinematic Prompts", desc: "Converts scripts into locked AI generation prompts — product shape cannot deviate." },
  { name: "Social Agent",     role: "Social Copy",       desc: "Platform-optimized captions, hashtags, and CTAs for TikTok, Instagram, YouTube." },
  { name: "QA Critic",        role: "Quality Control",   desc: "Reviews all outputs before publish — catches product errors and brand violations." },
];

const PRODUCTS = [
  { code: "HFJOY",   name: "Joy",   shape: "Luxury Recliner",  price: "$89.99", colors: 4, tag: "Float Your Way to Paradise" },
  { code: "HFCHILL", name: "Chill", shape: "U-Ring Float",     price: "$69.99", colors: 5, tag: "Float Together. Stay in Place." },
  { code: "HFFUN",   name: "Fun",   shape: "Cylinder Tube",    price: "$49.99", colors: 4, tag: "Have Some Fun." },
  { code: "HFVIBES", name: "Vibes", shape: "Flat Mat",         price: "$69.99", colors: 5, tag: "Summer in Full Bloom." },
];

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-background text-foreground grid-bg">

      {/* ── Header ── */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-12 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="font-mono text-sm font-bold tracking-widest text-foreground">LEVI</span>
            <span className="text-border">|</span>
            <span className="label-mono">Brand AI System</span>
          </div>
          <div className="flex items-center gap-6">
            <span className="label-mono hidden md:block">hippo float · Summer 2026</span>
            <div className="flex items-center gap-2">
              <span className="status-dot ready" />
              <span className="label-mono">System Ready</span>
            </div>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="min-h-screen flex flex-col justify-end pb-16 pt-24 px-6">
        <div className="max-w-7xl mx-auto w-full space-y-10">

          {/* Eyebrow */}
          <div className="flex items-center gap-3">
            <span className="status-dot ready" />
            <span className="label-mono">6 agents online · 4 product lines · 5 platforms</span>
          </div>

          {/* Main headline */}
          <div>
            <h1 className="display-xl text-foreground">
              Brand AI
            </h1>
            <h1 className="display-xl text-foreground">
              Creative
            </h1>
            <h1 className="display-xl" style={{ color: "#00d4ff" }}>
              System
            </h1>
          </div>

          {/* Subline */}
          <p className="text-muted-foreground text-lg font-light max-w-xl leading-relaxed">
            6 specialized AI agents — from product validation to Hollywood scripts to
            platform-ready social content. Product accuracy enforced at every step.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap gap-3">
            <Link href="/campaign/new">
              <button className="h-11 px-8 bg-[#00d4ff] text-background text-sm font-mono font-bold tracking-wider uppercase hover:bg-[#00d4ff]/90 transition-colors">
                Launch Campaign
              </button>
            </Link>
            <Link href="/scripts">
              <button className="h-11 px-8 border border-border text-foreground text-sm font-mono tracking-wider uppercase hover:border-[#00d4ff]/50 hover:text-[#00d4ff] transition-colors">
                Script Studio
              </button>
            </Link>
            <Link href="/prompts">
              <button className="h-11 px-8 border border-border text-foreground text-sm font-mono tracking-wider uppercase hover:border-[#00d4ff]/50 hover:text-[#00d4ff] transition-colors">
                Prompt Studio
              </button>
            </Link>
          </div>

          {/* Metrics row */}
          <div className="pt-4 border-t border-border">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { value: "6", label: "AI Agents" },
                { value: "4", label: "Product Lines" },
                { value: "5", label: "Platforms" },
                { value: "∞", label: "Token Accuracy" },
              ].map((m) => (
                <div key={m.label}>
                  <div className="font-mono text-3xl font-bold" style={{ color: "#00d4ff" }}>{m.value}</div>
                  <div className="label-mono mt-1">{m.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── System Modules ── */}
      <section className="border-t border-border px-6 py-16">
        <div className="max-w-7xl mx-auto space-y-8">

          <div className="flex items-center justify-between">
            <span className="label-mono">System Modules</span>
            <span className="label-mono text-[#00d4ff]">All 6 Ready</span>
          </div>

          <div className="space-y-0">
            {AGENTS.map((agent, i) => (
              <div
                key={agent.name}
                className="group flex items-start gap-6 py-5 border-t border-border hover:bg-white/[0.02] transition-colors px-2 -mx-2"
              >
                {/* Index */}
                <span className="font-mono text-xs text-muted-foreground/40 w-6 shrink-0 pt-0.5">
                  {String(i + 1).padStart(2, "0")}
                </span>

                {/* Status dot */}
                <span className="status-dot ready mt-1.5 shrink-0" />

                {/* Name + Role */}
                <div className="w-48 shrink-0">
                  <div className="text-sm font-medium text-foreground">{agent.name}</div>
                  <div className="label-mono mt-0.5">{agent.role}</div>
                </div>

                {/* Description */}
                <p className="text-sm text-muted-foreground font-light leading-relaxed flex-1 hidden md:block">
                  {agent.desc}
                </p>

                {/* Status badge */}
                <div className="shrink-0 font-mono text-xs text-[#00d4ff] tracking-widest">
                  READY
                </div>
              </div>
            ))}
            <div className="border-t border-border" />
          </div>
        </div>
      </section>

      {/* ── Collection 2026 ── */}
      <section className="border-t border-border px-6 py-16">
        <div className="max-w-7xl mx-auto space-y-8">

          <div className="flex items-center justify-between">
            <span className="label-mono">Collection 2026</span>
            <span className="label-mono">STAY WHERE YOU FLOAT</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-border">
            {PRODUCTS.map((product) => (
              <div key={product.code} className="bg-background p-6 space-y-5 hover:bg-white/[0.02] transition-colors group">

                {/* Code */}
                <div className="font-mono text-xs text-muted-foreground/40 tracking-widest">
                  {product.code}
                </div>

                {/* Name */}
                <div>
                  <div className="display-lg font-light" style={{ color: "#00d4ff" }}>
                    {product.name}
                  </div>
                  <div className="label-mono mt-1">{product.shape}</div>
                </div>

                {/* Tagline */}
                <p className="text-xs text-muted-foreground font-light leading-relaxed italic">
                  &ldquo;{product.tag}&rdquo;
                </p>

                {/* Specs */}
                <div className="space-y-2 border-t border-border pt-4">
                  <div className="flex justify-between">
                    <span className="label-mono">MSRP</span>
                    <span className="font-mono text-sm text-foreground">{product.price}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="label-mono">Colorways</span>
                    <span className="font-mono text-sm text-foreground">{product.colors}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Anchor System ── */}
      <section className="border-t border-border px-6 py-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            <div className="space-y-6">
              <span className="label-mono">Core Technology</span>
              <h2 className="display-lg text-foreground">
                2-in-1 Carry Bag<br />& Anchor System
              </h2>
              <p className="text-muted-foreground font-light leading-relaxed text-sm max-w-md">
                A waterproof dry bag that becomes the anchor — fills with water or
                sand when submerged. Connected by a royal blue rope with a yellow
                buoy at the surface. This is what makes every Hippo Float drift-free.
              </p>
              <p className="font-mono text-xs text-[#00d4ff] tracking-widest uppercase">
                Enforced in every AI prompt — always
              </p>
            </div>

            {/* System diagram */}
            <div className="border border-border p-8 space-y-0 font-mono text-sm">
              <div className="label-mono mb-6">Anchor System — Rope Path</div>

              <div className="space-y-1">
                <div className="flex items-center gap-3 py-3 border-t border-border">
                  <span className="text-muted-foreground/40 w-4 text-xs">01</span>
                  <span className="w-3 h-3 rounded-sm bg-[#00d4ff]/20 border border-[#00d4ff]/40 shrink-0" />
                  <span className="text-foreground">Float — surface level</span>
                </div>
                <div className="flex items-center gap-3 py-3 border-t border-border">
                  <span className="text-muted-foreground/40 w-4 text-xs">02</span>
                  <div className="w-3 flex justify-center shrink-0">
                    <div className="w-0.5 h-3 bg-blue-400" />
                  </div>
                  <span className="text-blue-400">Blue rope — always visible</span>
                </div>
                <div className="flex items-center gap-3 py-3 border-t border-border">
                  <span className="text-muted-foreground/40 w-4 text-xs">03</span>
                  <span className="w-3 h-3 rounded-full bg-yellow-400/80 shrink-0" />
                  <span className="text-yellow-400">Yellow buoy — at waterline</span>
                </div>
                <div className="flex items-center gap-3 py-3 border-t border-border">
                  <span className="text-muted-foreground/40 w-4 text-xs">04</span>
                  <div className="w-3 flex justify-center shrink-0">
                    <div className="w-0.5 h-3 bg-blue-400" />
                  </div>
                  <span className="text-blue-400">Rope continues underwater</span>
                </div>
                <div className="flex items-center gap-3 py-3 border-t border-border">
                  <span className="text-muted-foreground/40 w-4 text-xs">05</span>
                  <span className="w-3 h-3 bg-muted border border-border shrink-0" />
                  <span className="text-muted-foreground">Anchor bag — fully submerged</span>
                </div>
                <div className="border-t border-border pt-4 mt-2">
                  <div className="flex items-center gap-2 text-xs text-red-400/70 font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400/70" />
                    FORBIDDEN: anchor bag above water surface
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-border px-6 py-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <span className="font-mono text-xs text-muted-foreground/40">LEVI · Brand AI Creative System · hippo float Summer 2026</span>
          <div className="flex items-center gap-6">
            <Link href="/campaign/new" className="label-mono hover:text-foreground transition-colors">Campaign</Link>
            <Link href="/scripts" className="label-mono hover:text-foreground transition-colors">Scripts</Link>
            <Link href="/prompts" className="label-mono hover:text-foreground transition-colors">Prompts</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}

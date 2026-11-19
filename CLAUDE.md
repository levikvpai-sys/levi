# LEVI — Brand AI System

Next.js 14 (App Router) + TypeScript + Tailwind app that runs a multi-agent pipeline to produce brand campaigns (scripts, AI-generation prompts, social captions, QA) for Hippo Float. Deployed on Vercel; data in Supabase.

Owner: Levik Cohen (WOW Production, @wowprod.ai). Reply in Hebrew unless asked otherwise; keep code, comments and commits in English.

## Map
- `src/agents/` — one file per agent; `index.ts` = `CampaignOrchestrator` (guardian → brand director → scripts → prompts → captions → QA)
- `src/lib/claude.ts` — Anthropic client + model tiers (`CLAUDE_OPUS` / `CLAUDE_SONNET` / `CLAUDE_HAIKU`); `src/lib/openai.ts` — images (DALL·E)
- `src/brand/` + `data/*.json` — brand bible, product bible, prompt templates (source of truth for product shapes/colors)
- `src/app/api/` — route handlers per agent; `src/app/campaign/` — UI
- `supabase/schema.sql` — DB schema
- `.claude/skills/wow-content-studio/` — Instagram content skill for @wowprod.ai
- `docs/wow-playbook.html` — Instagram playbook

## Commands
- `npm run dev` · `npm run build` · `npm run lint`
- Env vars: see `.env.example` (`ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, Supabase keys)

## Rules
- Match the model to the job: Haiku for short copy/captions, Sonnet for structured/daily work, Opus only for long creative writing (scripts). Don't move an agent to a bigger model without a reason.
- Product geometry and colors come from the product bible — never invent them.
- If a request is ambiguous, ask 1–3 clarifying questions before doing large work.

## Token hygiene
- Don't read `package-lock.json`, `.next/` or `node_modules/` unless the task is about dependencies.
- Prefer `grep`/targeted reads over opening whole large files (`src/brand/product-bible.ts`, `prompt-templates.ts`).
- Keep this file short; put detail in the files it points to.

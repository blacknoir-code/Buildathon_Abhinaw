# GrowthPilot AI — The AI Campaign Workspace

> One workspace where every growth artifact — plan, creative, copy, review, decision, and export — is connected. Not a campaign generator. A product.

GrowthPilot replaces the 10-tool workflow (Docs, ChatGPT, Canva, Sheets, Notion, Ads Library, Figma…) with a single AI-native workspace for growth teams. You describe a goal in one sentence and eight orchestrated AI agents turn it into a launch-ready campaign, score your creatives, write multi-channel copy, narrate your analytics, and export the whole thing to PDF/PPT/Markdown.

---

## ✨ What makes it a product, not a prompt wrapper

- **Live-or-Demo architecture.** The entire app works with **zero API keys** — every agent falls back to high-quality, input-aware mock responses. Add an `ANTHROPIC_API_KEY` and it switches to live Claude generation automatically. A live badge in the top bar tells you which mode you're in. *Your demo never breaks on a flaky network or a rate limit.*
- **8 specialised agents, one orchestrator.** Campaign, Creative, Content, Reviewer, Risk, Analytics, Translator, and the always-on Copilot — each with its own prompt file in `prompts/`.
- **Connected workspace.** Campaigns, creatives, and history live in one store; the Copilot carries context; exports pull from the same plan.
- **Grounded in the Indian growth context** — cities, festivals, vernacular languages, channel economics (Meta / Google / WhatsApp / field).

## 🧩 Modules

| Module | What it does |
| --- | --- |
| **Dashboard** | Workspace home — stats, quick actions, recent campaigns, AI suggestions, activity |
| **Campaign Generator** (hero) | One sentence in → brief, personas, channels, budget split, timeline, KPIs, risks, next steps |
| **Creative Studio** | Upload a poster/banner → Claude-Vision scorecard (readability, contrast, CTA, hierarchy, CTR…) + rewritten copy, CTA, and an image prompt |
| **Content Generator** | One brief → Meta / Google / WhatsApp / SMS / Email / Push / Landing / Video-script copy in any Indian language |
| **Analytics** | Recharts performance dashboard + an AI narrative (headline, insights, ranked actions) |
| **AI Copilot** | Slide-out chat teammate: diagnose metrics, generate creatives, translate, predict risks |
| **Export Center** | PDF (print), PowerPoint (pptxgenjs), Markdown, Copy-to-clipboard — built into every plan |
| **History / Settings** | Full action log; service status, agent roster, integrations roadmap |

## 🏗️ Architecture

```
                         Next.js 15 (App Router, Vercel)
                                     │
      ┌──────────────────────────────┼──────────────────────────────┐
      ▼                              ▼                              ▼
 Campaign Engine              Creative Studio                   AI Copilot
      └──────────────────────────────┼──────────────────────────────┘
                                     ▼
                      Claude AI Orchestrator  (lib/claude.ts)
      ┌───────────┬───────────┬──────┴──────┬───────────┬───────────┐
      ▼           ▼           ▼             ▼           ▼           ▼
  Campaign     Creative    Content       Reviewer     Risk      Analytics
   Agent        Agent       Agent         Agent       Agent       Agent   (+ Translator, Copilot)
      └───────────────────────────────────┬──────────────────────────┘
                                     ▼
                        Structured JSON responses
      ┌───────────────────────────────────┼──────────────────────────┐
      ▼                                   ▼                          ▼
 Supabase (optional)              Client store (localStorage)   Export Engine
 Postgres · Storage · Auth        works with no backend         PDF / PPT / MD
```

Everything except Claude is serverless. No Docker, no EC2, no Kubernetes.

## 🛠️ Tech stack

Next.js 15 · React 19 · TypeScript · Tailwind + shadcn-style UI · Claude API (`@anthropic-ai/sdk`) · Supabase (optional) · Recharts · pptxgenjs · Vercel.

## 🚀 Getting started

```bash
npm install
npm run dev          # http://localhost:3000  (runs in demo mode, no keys needed)
```

To go live, copy `.env.example` → `.env.local` and add your keys:

```bash
ANTHROPIC_API_KEY=sk-ant-...      # enables live Claude generation
# Optional — cloud persistence + auth:
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

Apply the optional database schema with `supabase/schema.sql` (RLS-scoped per user).

```bash
npm run build        # production build (all routes prerender/serverless)
npm run typecheck    # tsc --noEmit
```

## 🎬 3-minute demo flow

1. **Dashboard** — an empty, product-grade workspace.
2. **New campaign** → type *"Need 5,000 delivery executives in Mumbai before Diwali with a ₹15 lakh budget."* → watch the agents orchestrate → a full plan (budget donut sums to ₹15L, personas, timeline, KPIs, risks).
3. **Creative Studio** — upload a poster → scorecard + improved copy/CTA/image-prompt.
4. **Content** — generate WhatsApp + SMS + Meta copy, switch language to Marathi.
5. **Analytics** — AI narrative over live-looking charts.
6. **Export** — one click to PDF / PPT / Markdown.

## 📁 Folder structure

```
app/            App Router pages + /api routes (campaign, creative, content, chat, analytics, status)
components/     ui/ (shadcn-style)  ·  layout/  ·  campaign/  ·  charts/  ·  copilot/
lib/            claude.ts (orchestrator) · mock.ts · store.ts · export.ts · supabase.ts · utils.ts
prompts/        one file per agent — campaign, creative, content, reviewer, risk, analytics, translator, chat
hooks/          use-store · use-status
types/          shared domain types
supabase/       schema.sql (optional)
```

## 🗺️ Roadmap

Jira · Slack · Google Sheets sync · Meta Ads API · WhatsApp Business API · Google Analytics.

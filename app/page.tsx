import Link from "next/link";
import {
  Rocket, Sparkles, ArrowRight, Megaphone, Palette, PenLine,
  BarChart3, MessageSquare, FileDown, Wand2, Check,
} from "lucide-react";

const MODULES = [
  { icon: Megaphone, title: "Campaign Generator", desc: "One sentence → brief, personas, budget, timeline, KPIs, risks." },
  { icon: Palette, title: "Creative Studio", desc: "Score any asset with Claude Vision, then rewrite it to convert." },
  { icon: PenLine, title: "Content Generator", desc: "Copy for 8 channels in any Indian language, instantly." },
  { icon: BarChart3, title: "Analytics", desc: "Performance charts with an AI narrative and ranked actions." },
  { icon: MessageSquare, title: "AI Copilot", desc: "A streaming teammate that knows your campaign context." },
  { icon: FileDown, title: "Export Center", desc: "Ship to PDF, PowerPoint, or Markdown in one click." },
];

const REPLACES = ["Google Docs", "ChatGPT", "Canva", "Excel", "Notion", "Ads Library", "Figma"];

export default function LandingPage() {
  return (
    <div className="min-h-dvh aurora">
      {/* Nav */}
      <header className="mx-auto max-w-6xl flex items-center justify-between px-6 h-16">
        <div className="flex items-center gap-2.5">
          <div className="grid place-items-center size-9 rounded-xl bg-gradient-to-br from-primary to-fuchsia-500 shadow-lg shadow-primary/30">
            <Rocket className="size-5 text-white" />
          </div>
          <span className="font-semibold">GrowthPilot AI</span>
        </div>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 rounded-lg bg-secondary px-4 py-2 text-sm font-medium hover:bg-accent transition-colors"
        >
          Launch workspace <ArrowRight className="size-4" />
        </Link>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-4xl text-center px-6 pt-20 pb-16">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs text-primary mb-6">
          <Sparkles className="size-3.5" /> The AI Campaign Workspace for Growth teams
        </div>
        <h1 className="text-4xl sm:text-6xl font-bold tracking-tight leading-[1.05]">
          Ten tools for growth.
          <br />
          <span className="text-gradient">One workspace.</span>
        </h1>
        <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
          Plan, create, review, and ship campaigns where every artifact — plan,
          creative, copy, and export — is connected and powered by eight
          orchestrated AI agents.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link
            href="/campaigns/new"
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-primary to-fuchsia-500 px-6 py-3 text-sm font-medium text-white shadow-lg shadow-primary/25 hover:opacity-95 transition-opacity"
          >
            <Wand2 className="size-4" /> Generate a campaign
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-lg border border-border px-6 py-3 text-sm font-medium hover:bg-accent transition-colors"
          >
            Explore the workspace
          </Link>
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          No sign-up, no API key needed — it runs in demo mode instantly.
        </p>

        {/* Replaces */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-2 text-xs text-muted-foreground">
          <span>Replaces</span>
          {REPLACES.map((r) => (
            <span key={r} className="rounded-full border border-border bg-card/40 px-2.5 py-1 line-through decoration-primary/60">
              {r}
            </span>
          ))}
        </div>
      </section>

      {/* Modules */}
      <section className="mx-auto max-w-6xl px-6 pb-20">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {MODULES.map((m) => {
            const Icon = m.icon;
            return (
              <div key={m.title} className="glass rounded-xl border border-border p-5 hover:border-primary/40 transition-colors">
                <div className="grid place-items-center size-10 rounded-xl bg-primary/10 mb-3">
                  <Icon className="size-5 text-primary" />
                </div>
                <h3 className="font-semibold">{m.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{m.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Agents strip */}
      <section className="mx-auto max-w-4xl px-6 pb-24 text-center">
        <div className="glass-strong rounded-2xl border border-border p-8">
          <h2 className="text-2xl font-bold">Eight agents, one orchestrator</h2>
          <p className="text-muted-foreground mt-2 max-w-xl mx-auto">
            Campaign, Creative, Content, Reviewer, Risk, Analytics, Translator,
            and Copilot — each specialised, working together on your goal.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm">
            {["Campaign", "Creative", "Content", "Reviewer", "Risk", "Analytics", "Translator", "Copilot"].map((a) => (
              <span key={a} className="inline-flex items-center gap-1.5">
                <Check className="size-3.5 text-emerald-400" /> {a}
              </span>
            ))}
          </div>
          <Link
            href="/dashboard"
            className="mt-8 inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-primary to-fuchsia-500 px-6 py-3 text-sm font-medium text-white shadow-lg shadow-primary/25 hover:opacity-95 transition-opacity"
          >
            <Rocket className="size-4" /> Launch GrowthPilot
          </Link>
        </div>
      </section>

      <footer className="border-t border-border py-8 text-center text-xs text-muted-foreground">
        GrowthPilot AI — built for the buildathon. Everything in one workspace.
      </footer>
    </div>
  );
}

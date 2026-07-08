"use client";

import Link from "next/link";
import {
  Plus, Megaphone, Palette, PenLine, BarChart3, ArrowRight,
  Sparkles, TrendingUp, Wallet, Users, Lightbulb,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useStore } from "@/hooks/use-store";
import { getCampaigns, getCreatives, getHistory } from "@/lib/store";
import { formatCurrencyINR, relativeTime } from "@/lib/utils";

const QUICK_ACTIONS = [
  { label: "New campaign", href: "/campaigns/new", icon: Megaphone, tint: "from-primary to-fuchsia-500" },
  { label: "Analyse creative", href: "/creative-studio", icon: Palette, tint: "from-cyan-500 to-blue-500" },
  { label: "Generate content", href: "/content", icon: PenLine, tint: "from-emerald-500 to-teal-500" },
  { label: "View analytics", href: "/analytics", icon: BarChart3, tint: "from-amber-500 to-orange-500" },
];

const SUGGESTIONS = [
  "Your Mumbai campaign's CTR is trending up — consider raising the Meta budget 15%.",
  "3 creatives scored below 65. Run them through Creative Studio to lift predicted CTR.",
  "Festival CPMs rise in ~2 weeks. Front-load spend on winning audiences now.",
];

export default function DashboardPage() {
  const campaigns = useStore(getCampaigns);
  const creatives = useStore(getCreatives);
  const history = useStore(getHistory);

  const totalBudget = campaigns.reduce((s, c) => s + (c.budget || 0), 0);

  const stats = [
    { label: "Active campaigns", value: campaigns.length, icon: Megaphone },
    { label: "Creatives analysed", value: creatives.length, icon: Palette },
    { label: "Planned budget", value: formatCurrencyINR(totalBudget), icon: Wallet },
    { label: "AI actions", value: history.length, icon: Sparkles },
  ];

  return (
    <div className="space-y-6">
      {/* Hero */}
      <Card className="glass overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-fuchsia-500/10 pointer-events-none" />
        <CardContent className="pt-6 relative">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs text-primary mb-3">
                <Sparkles className="size-3.5" /> AI Campaign Workspace
              </div>
              <h1 className="text-2xl font-bold tracking-tight">
                Welcome back 👋
              </h1>
              <p className="text-muted-foreground mt-1 max-w-lg">
                Plan, create, review, and ship growth campaigns — every artifact
                connected in one workspace.
              </p>
            </div>
            <Button asChild variant="gradient" size="lg">
              <Link href="/campaigns/new">
                <Plus className="size-4" /> Start a campaign
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label} className="glass">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold">{s.value}</span>
                  <Icon className="size-5 text-primary" />
                </div>
                <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {QUICK_ACTIONS.map((a) => {
          const Icon = a.icon;
          return (
            <Link key={a.href} href={a.href}>
              <Card className="glass hover:border-primary/40 transition-colors h-full">
                <CardContent className="pt-6">
                  <div className={`grid place-items-center size-10 rounded-xl bg-gradient-to-br ${a.tint} mb-3`}>
                    <Icon className="size-5 text-white" />
                  </div>
                  <div className="font-medium text-sm flex items-center justify-between">
                    {a.label}
                    <ArrowRight className="size-4 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent campaigns */}
        <Card className="glass lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm flex items-center gap-2">
              <Megaphone className="size-4 text-primary" /> Recent campaigns
            </CardTitle>
            <Link href="/campaigns" className="text-xs text-primary hover:underline">
              View all
            </Link>
          </CardHeader>
          <CardContent>
            {campaigns.length === 0 ? (
              <div className="text-center py-8 text-sm text-muted-foreground">
                No campaigns yet.{" "}
                <Link href="/campaigns/new" className="text-primary hover:underline">
                  Create one →
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {campaigns.slice(0, 4).map((c) => (
                  <Link
                    key={c.id}
                    href={`/campaigns/${c.id}`}
                    className="flex items-center gap-3 rounded-lg border border-border p-3 hover:border-primary/40 transition-colors"
                  >
                    <div className="grid place-items-center size-9 rounded-lg bg-primary/10 text-primary shrink-0">
                      <TrendingUp className="size-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium truncate">{c.plan.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {c.city} · {formatCurrencyINR(c.budget)} · {relativeTime(c.createdAt)}
                      </div>
                    </div>
                    <ArrowRight className="size-4 text-muted-foreground shrink-0" />
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* AI suggestions */}
        <Card className="glass">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Lightbulb className="size-4 text-amber-400" /> AI Suggestions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {SUGGESTIONS.map((s, i) => (
              <div key={i} className="rounded-lg border border-border p-3 text-sm">
                <Sparkles className="size-3.5 text-primary mb-1.5" />
                <p className="text-muted-foreground leading-relaxed">{s}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Recent activity */}
      {history.length > 0 && (
        <Card className="glass">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Users className="size-4 text-primary" /> Recent activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1.5">
              {history.slice(0, 5).map((h) => (
                <div key={h.id} className="flex items-center gap-3 text-sm py-1.5">
                  <Badge variant="secondary" className="shrink-0">{h.action}</Badge>
                  <span className="text-muted-foreground truncate flex-1">{h.prompt}</span>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {relativeTime(h.timestamp)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

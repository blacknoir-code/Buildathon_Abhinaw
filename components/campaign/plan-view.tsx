"use client";

import { useState } from "react";
import {
  Target, Users, Radio, Wallet, CalendarClock, Gauge,
  ShieldAlert, ListChecks, FileText, Presentation, FileDown, Copy, Check,
} from "lucide-react";
import type { Campaign } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Timeline } from "@/components/campaign/timeline";
import { BudgetDonut } from "@/components/charts/budget-donut";
import { formatCurrencyINR } from "@/lib/utils";
import {
  exportMarkdown, exportPdf, exportPptx, copyToClipboard, campaignToMarkdown,
} from "@/lib/export";

const sevVariant = { low: "success", medium: "warning", high: "danger" } as const;

function Section({
  icon: Icon, title, children, className = "",
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Icon className="size-4 text-primary" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

export function PlanView({ campaign }: { campaign: Campaign }) {
  const [copied, setCopied] = useState(false);
  const p = campaign.plan;

  async function handleCopy() {
    const ok = await copyToClipboard(campaignToMarkdown(campaign));
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }
  }

  return (
    <div className="space-y-5" id="campaign-plan">
      {/* Header + export center */}
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
        <div className="space-y-1.5 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">{campaign.city}</Badge>
            <Badge>{formatCurrencyINR(campaign.budget)}</Badge>
          </div>
          <h2 className="text-2xl font-bold tracking-tight">{p.title}</h2>
          <p className="text-muted-foreground max-w-2xl">{p.summary}</p>
        </div>
        <div className="flex flex-wrap gap-2 print:hidden shrink-0">
          <Button size="sm" variant="outline" onClick={exportPdf}>
            <FileDown className="size-4" /> PDF
          </Button>
          <Button size="sm" variant="outline" onClick={() => exportPptx(campaign)}>
            <Presentation className="size-4" /> PPT
          </Button>
          <Button size="sm" variant="outline" onClick={() => exportMarkdown(campaign)}>
            <FileText className="size-4" /> Markdown
          </Button>
          <Button size="sm" variant="outline" onClick={handleCopy}>
            {copied ? <Check className="size-4 text-emerald-400" /> : <Copy className="size-4" />}
            {copied ? "Copied" : "Copy"}
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <Section icon={Target} title="Objectives">
          <ul className="space-y-2">
            {p.objectives.map((o, i) => (
              <li key={i} className="flex gap-2 text-sm">
                <span className="text-primary mt-1 leading-none">▸</span>
                <span>{o}</span>
              </li>
            ))}
          </ul>
        </Section>

        <Section icon={Wallet} title="Budget Split">
          <BudgetDonut data={p.budgetSplit} />
        </Section>

        <Section icon={Users} title="Audience Personas">
          <div className="space-y-3">
            {p.personas.map((persona, i) => (
              <div key={i} className="rounded-lg border border-border p-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">{persona.name}</span>
                  <Badge variant="secondary">{persona.age}</Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{persona.motivation}</p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {persona.channels.map((c) => (
                    <span key={c} className="text-[11px] rounded-full bg-muted px-2 py-0.5">
                      {c}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground/80 mt-2 italic">
                  {persona.objection}
                </p>
              </div>
            ))}
          </div>
        </Section>

        <Section icon={Radio} title="Channel Strategy">
          <div className="space-y-3">
            {p.channels.map((ch, i) => (
              <div key={i}>
                <div className="text-sm font-medium">{ch.channel}</div>
                <p className="text-sm text-muted-foreground">{ch.strategy}</p>
              </div>
            ))}
          </div>
        </Section>

        <Section icon={CalendarClock} title="Timeline">
          <Timeline phases={p.timeline} />
        </Section>

        <div className="space-y-5">
          <Section icon={Gauge} title="KPIs">
            <div className="grid sm:grid-cols-2 gap-2">
              {p.kpis.map((k, i) => (
                <div key={i} className="rounded-lg border border-border p-3">
                  <div className="text-xs text-muted-foreground">{k.metric}</div>
                  <div className="text-lg font-semibold text-gradient">{k.target}</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">{k.why}</div>
                </div>
              ))}
            </div>
          </Section>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <Section icon={ShieldAlert} title="Risks">
          <ul className="space-y-2.5">
            {p.risks.map((r, i) => (
              <li key={i} className="text-sm">
                <div className="flex items-center gap-2">
                  <Badge variant={sevVariant[r.severity]} className="capitalize">
                    {r.severity}
                  </Badge>
                  <span className="font-medium">{r.risk}</span>
                </div>
                <p className="text-muted-foreground mt-0.5 pl-1">→ {r.mitigation}</p>
              </li>
            ))}
          </ul>
        </Section>

        <Section icon={ListChecks} title="Next Steps">
          <ol className="space-y-2">
            {p.nextSteps.map((s, i) => (
              <li key={i} className="flex gap-2.5 text-sm">
                <span className="grid place-items-center size-5 rounded-full bg-primary/15 text-primary text-[11px] font-semibold shrink-0">
                  {i + 1}
                </span>
                <span>{s}</span>
              </li>
            ))}
          </ol>
        </Section>
      </div>
    </div>
  );
}

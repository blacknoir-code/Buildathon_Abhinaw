"use client";

import { useEffect, useState } from "react";
import {
  Target, Users, Radio, Wallet, CalendarClock, Gauge,
  ShieldAlert, ListChecks, FileText, Presentation, FileDown, Copy, Check,
  RefreshCw, Pencil, Plus, X,
} from "lucide-react";
import type { Campaign, CampaignPlan } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Timeline } from "@/components/campaign/timeline";
import { BudgetDonut } from "@/components/charts/budget-donut";
import { formatCurrencyINR, cn } from "@/lib/utils";
import { saveCampaign } from "@/lib/store";
import { api } from "@/lib/api";
import { useToast } from "@/components/ui/toast";
import {
  exportMarkdown, exportPdf, exportPptx, copyToClipboard, campaignToMarkdown,
} from "@/lib/export";

const sevVariant = { low: "success", medium: "warning", high: "danger" } as const;

function Section({
  icon: Icon, title, sectionKey, onRegen, busy, editing, children, className = "",
}: {
  icon: React.ElementType;
  title: string;
  sectionKey?: string;
  onRegen?: (key: string) => void;
  busy?: string | null;
  editing?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Card className={className}>
      <CardHeader className="pb-3 flex-row items-center justify-between space-y-0">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Icon className="size-4 text-primary" />
          {title}
        </CardTitle>
        {sectionKey && onRegen && !editing && (
          <button
            onClick={() => onRegen(sectionKey)}
            disabled={busy === sectionKey}
            title="Regenerate this section"
            className="text-muted-foreground hover:text-primary transition-colors disabled:opacity-50 print:hidden"
          >
            <RefreshCw className={cn("size-3.5", busy === sectionKey && "animate-spin text-primary")} />
          </button>
        )}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

export function PlanView({ campaign }: { campaign: Campaign }) {
  const [copied, setCopied] = useState(false);
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [draft, setDraft] = useState<CampaignPlan>(campaign.plan);
  const toast = useToast();

  // Resync when navigating to a different campaign.
  useEffect(() => {
    setDraft(campaign.plan);
    setEditing(false);
  }, [campaign.id]); // eslint-disable-line react-hooks/exhaustive-deps

  function persist(next: CampaignPlan) {
    setDraft(next);
    saveCampaign({ ...campaign, plan: next });
  }

  async function regen(section: string) {
    setBusy(section);
    try {
      const { data, meta } = await api.regenerateSection<CampaignPlan[keyof CampaignPlan]>({
        section,
        context: {
          title: draft.title, summary: draft.summary, city: campaign.city,
          budget: campaign.budget, goal: campaign.goal, audience: campaign.audience,
        },
        seed: Date.now() % 997,
      });
      persist({ ...draft, [section]: data } as CampaignPlan);
      toast(`Regenerated ${section} · ${meta.mode === "live" ? "Claude" : "demo"}`);
    } catch {
      toast("Couldn't regenerate — try again");
    } finally {
      setBusy(null);
    }
  }

  function saveEdits() {
    persist(draft);
    setEditing(false);
    toast("Changes saved");
  }

  async function handleCopy() {
    if (await copyToClipboard(campaignToMarkdown({ ...campaign, plan: draft }))) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }
  }

  const p = draft;

  return (
    <div className="space-y-5" id="campaign-plan">
      {/* Header + toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
        <div className="space-y-1.5 min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">{campaign.city}</Badge>
            <Badge>{formatCurrencyINR(campaign.budget)}</Badge>
          </div>
          {editing ? (
            <Input
              value={p.title}
              onChange={(e) => setDraft({ ...p, title: e.target.value })}
              className="text-xl font-bold h-auto py-1.5"
            />
          ) : (
            <h2 className="text-2xl font-bold tracking-tight">{p.title}</h2>
          )}
          {editing ? (
            <Textarea
              value={p.summary}
              onChange={(e) => setDraft({ ...p, summary: e.target.value })}
              className="max-w-2xl"
            />
          ) : (
            <p className="text-muted-foreground max-w-2xl">{p.summary}</p>
          )}
        </div>
        <div className="flex flex-wrap gap-2 print:hidden shrink-0">
          {editing ? (
            <Button size="sm" variant="gradient" onClick={saveEdits}>
              <Check className="size-4" /> Done
            </Button>
          ) : (
            <Button size="sm" variant="outline" onClick={() => setEditing(true)}>
              <Pencil className="size-4" /> Edit
            </Button>
          )}
          <Button size="sm" variant="outline" onClick={exportPdf}>
            <FileDown className="size-4" /> PDF
          </Button>
          <Button size="sm" variant="outline" onClick={() => exportPptx({ ...campaign, plan: draft })}>
            <Presentation className="size-4" /> PPT
          </Button>
          <Button size="sm" variant="outline" onClick={() => exportMarkdown({ ...campaign, plan: draft })}>
            <FileText className="size-4" /> Markdown
          </Button>
          <Button size="sm" variant="outline" onClick={handleCopy}>
            {copied ? <Check className="size-4 text-emerald-400" /> : <Copy className="size-4" />}
            {copied ? "Copied" : "Copy"}
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <Section icon={Target} title="Objectives" sectionKey="objectives" onRegen={regen} busy={busy} editing={editing}>
          {editing ? (
            <EditableList
              items={p.objectives}
              onChange={(items) => setDraft({ ...p, objectives: items })}
              placeholder="Add an objective…"
            />
          ) : (
            <ul className="space-y-2">
              {p.objectives.map((o, i) => (
                <li key={i} className="flex gap-2 text-sm">
                  <span className="text-primary mt-1 leading-none">▸</span>
                  <span>{o}</span>
                </li>
              ))}
            </ul>
          )}
        </Section>

        <Section icon={Wallet} title="Budget Split" sectionKey="budgetSplit" onRegen={regen} busy={busy} editing={editing}>
          <BudgetDonut data={p.budgetSplit} />
        </Section>

        <Section icon={Users} title="Audience Personas" sectionKey="personas" onRegen={regen} busy={busy} editing={editing}>
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
                    <span key={c} className="text-[11px] rounded-full bg-muted px-2 py-0.5">{c}</span>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground/80 mt-2 italic">{persona.objection}</p>
              </div>
            ))}
          </div>
        </Section>

        <Section icon={Radio} title="Channel Strategy" sectionKey="channels" onRegen={regen} busy={busy} editing={editing}>
          <div className="space-y-3">
            {p.channels.map((ch, i) => (
              <div key={i}>
                <div className="text-sm font-medium">{ch.channel}</div>
                <p className="text-sm text-muted-foreground">{ch.strategy}</p>
              </div>
            ))}
          </div>
        </Section>

        <Section icon={CalendarClock} title="Timeline" sectionKey="timeline" onRegen={regen} busy={busy} editing={editing}>
          <Timeline phases={p.timeline} />
        </Section>

        <Section icon={Gauge} title="KPIs" sectionKey="kpis" onRegen={regen} busy={busy} editing={editing}>
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

      <div className="grid lg:grid-cols-2 gap-5">
        <Section icon={ShieldAlert} title="Risks" sectionKey="risks" onRegen={regen} busy={busy} editing={editing}>
          <ul className="space-y-2.5">
            {p.risks.map((r, i) => (
              <li key={i} className="text-sm">
                <div className="flex items-center gap-2">
                  <Badge variant={sevVariant[r.severity]} className="capitalize">{r.severity}</Badge>
                  <span className="font-medium">{r.risk}</span>
                </div>
                <p className="text-muted-foreground mt-0.5 pl-1">→ {r.mitigation}</p>
              </li>
            ))}
          </ul>
        </Section>

        <Section icon={ListChecks} title="Next Steps" sectionKey="nextSteps" onRegen={regen} busy={busy} editing={editing}>
          {editing ? (
            <EditableList
              items={p.nextSteps}
              onChange={(items) => setDraft({ ...p, nextSteps: items })}
              placeholder="Add a next step…"
            />
          ) : (
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
          )}
        </Section>
      </div>
    </div>
  );
}

function EditableList({
  items, onChange, placeholder,
}: {
  items: string[];
  onChange: (items: string[]) => void;
  placeholder: string;
}) {
  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-2">
          <Input
            value={item}
            onChange={(e) => onChange(items.map((x, j) => (j === i ? e.target.value : x)))}
            className="h-9"
          />
          <button
            onClick={() => onChange(items.filter((_, j) => j !== i))}
            className="text-muted-foreground hover:text-destructive shrink-0"
            aria-label="Remove"
          >
            <X className="size-4" />
          </button>
        </div>
      ))}
      <Button size="sm" variant="ghost" onClick={() => onChange([...items, ""])} className="text-muted-foreground">
        <Plus className="size-3.5" /> {placeholder}
      </Button>
    </div>
  );
}

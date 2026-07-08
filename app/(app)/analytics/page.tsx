"use client";

import { useEffect, useMemo, useState } from "react";
import {
  MousePointerClick, IndianRupee, FileText, UserCheck,
  TrendingUp, Sparkles, Loader2, Lightbulb, ArrowUpRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { MetricArea } from "@/components/charts/metric-area";
import { mockAnalytics } from "@/lib/mock";
import { api } from "@/lib/api";
import { formatCurrencyINR, formatNumber } from "@/lib/utils";

function last(series: { value: number }[]) {
  return series[series.length - 1]?.value ?? 0;
}
function delta(series: { value: number }[]) {
  const first = series[0]?.value ?? 0;
  const now = last(series);
  if (!first) return 0;
  return Math.round(((now - first) / first) * 100);
}

interface Narrative {
  headline: string;
  insights: string[];
  actions: string[];
}

export default function AnalyticsPage() {
  const bundle = useMemo(() => mockAnalytics(), []);
  const [narrative, setNarrative] = useState<Narrative | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    api
      .narrateAnalytics(bundle)
      .then(({ data }) => active && setNarrative(data))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [bundle]);

  const cards = [
    { label: "CTR", value: `${last(bundle.ctr).toFixed(2)}%`, d: delta(bundle.ctr), series: bundle.ctr, color: "#7C3AED", icon: MousePointerClick, suffix: "%" },
    { label: "CPA", value: formatCurrencyINR(last(bundle.cpa)), d: delta(bundle.cpa), series: bundle.cpa, color: "#22D3EE", icon: IndianRupee, prefix: "₹", invert: true },
    { label: "Applications", value: formatNumber(last(bundle.applications)), d: delta(bundle.applications), series: bundle.applications, color: "#34D399", icon: FileText },
    { label: "Joins", value: formatNumber(last(bundle.joins)), d: delta(bundle.joins), series: bundle.joins, color: "#F59E0B", icon: UserCheck },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Analytics</h1>
          <p className="text-sm text-muted-foreground">
            Live campaign performance · last 21 days
          </p>
        </div>
        <Badge variant="warning">Demo data</Badge>
      </div>

      {/* AI narrative */}
      <Card className="glass overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent pointer-events-none" />
        <CardContent className="pt-6 relative">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="size-4 text-primary" />
            <span className="text-xs font-semibold text-primary">Analytics Agent</span>
          </div>
          {loading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" /> Reading the numbers…
            </div>
          ) : (
            narrative && (
              <>
                <p className="text-lg font-medium">{narrative.headline}</p>
                <div className="grid md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <div className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
                      <Lightbulb className="size-3.5 text-amber-400" /> Insights
                    </div>
                    <ul className="space-y-1.5">
                      {narrative.insights.map((s, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex gap-2">
                          <span className="text-primary">•</span> {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <div className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
                      <ArrowUpRight className="size-3.5 text-emerald-400" /> Recommended actions
                    </div>
                    <ul className="space-y-1.5">
                      {narrative.actions.map((s, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex gap-2">
                          <span className="grid place-items-center size-4 rounded-full bg-primary/15 text-primary text-[10px] font-semibold shrink-0 mt-0.5">
                            {i + 1}
                          </span>
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </>
            )
          )}
        </CardContent>
      </Card>

      {/* Metric charts */}
      <div className="grid md:grid-cols-2 gap-5">
        {cards.map((c) => {
          const Icon = c.icon;
          const good = c.invert ? c.d <= 0 : c.d >= 0;
          return (
            <Card key={c.label} className="glass">
              <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Icon className="size-4 text-primary" /> {c.label}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold">{c.value}</span>
                  <Badge variant={good ? "success" : "danger"} className="gap-0.5">
                    <TrendingUp className={"size-3 " + (c.d < 0 ? "rotate-180" : "")} />
                    {c.d > 0 ? "+" : ""}{c.d}%
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <MetricArea data={c.series} color={c.color} prefix={c.prefix} suffix={c.suffix} />
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Budget + ROI + channel split */}
      <div className="grid md:grid-cols-3 gap-5">
        <Card className="glass">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Budget used</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-2xl font-bold">{formatCurrencyINR(bundle.budgetUsed)}</div>
            <Progress value={(bundle.budgetUsed / bundle.budgetTotal) * 100} />
            <div className="text-xs text-muted-foreground">
              of {formatCurrencyINR(bundle.budgetTotal)} ({Math.round((bundle.budgetUsed / bundle.budgetTotal) * 100)}%)
            </div>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Return on spend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gradient">{bundle.roi}x</div>
            <p className="text-xs text-muted-foreground mt-1">Blended ROI across channels</p>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Spend by channel</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {bundle.channelSplit.map((c) => (
              <div key={c.channel} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>{c.channel}</span>
                  <span className="text-muted-foreground">{c.value}%</span>
                </div>
                <Progress value={c.value} />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

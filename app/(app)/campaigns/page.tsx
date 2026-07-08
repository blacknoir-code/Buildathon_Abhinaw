"use client";

import Link from "next/link";
import { Plus, Megaphone, ArrowRight, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useStore } from "@/hooks/use-store";
import { getCampaigns, deleteCampaign } from "@/lib/store";
import { formatCurrencyINR, relativeTime } from "@/lib/utils";

export default function CampaignsPage() {
  const campaigns = useStore(getCampaigns);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Campaigns</h1>
          <p className="text-sm text-muted-foreground">
            {campaigns.length} plan{campaigns.length === 1 ? "" : "s"} in your workspace
          </p>
        </div>
        <Button asChild variant="gradient">
          <Link href="/campaigns/new">
            <Plus className="size-4" /> New campaign
          </Link>
        </Button>
      </div>

      {campaigns.length === 0 ? (
        <Card className="glass">
          <CardContent className="grid place-items-center text-center py-16">
            <div className="grid place-items-center size-12 rounded-2xl bg-primary/10 mb-4">
              <Megaphone className="size-6 text-primary" />
            </div>
            <h2 className="font-semibold mb-1">No campaigns yet</h2>
            <p className="text-sm text-muted-foreground max-w-sm mb-5">
              Describe a growth goal in one sentence and GrowthPilot will draft a
              complete, launch-ready plan.
            </p>
            <Button asChild variant="gradient">
              <Link href="/campaigns/new">
                <Plus className="size-4" /> Create your first campaign
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {campaigns.map((c) => (
            <Card key={c.id} className="group glass hover:border-primary/40 transition-colors">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Badge variant="outline">{c.city}</Badge>
                    <Badge>{formatCurrencyINR(c.budget)}</Badge>
                  </div>
                  <button
                    onClick={() => deleteCampaign(c.id)}
                    className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all"
                    aria-label="Delete campaign"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
                <Link href={`/campaigns/${c.id}`} className="block mt-3">
                  <h3 className="font-semibold leading-snug group-hover:text-primary transition-colors">
                    {c.plan.title}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                    {c.plan.summary}
                  </p>
                  <div className="flex items-center justify-between mt-4 text-xs text-muted-foreground">
                    <span>{relativeTime(c.createdAt)}</span>
                    <span className="inline-flex items-center gap-1 text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                      Open <ArrowRight className="size-3" />
                    </span>
                  </div>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

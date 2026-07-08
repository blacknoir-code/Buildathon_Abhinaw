"use client";

import Link from "next/link";
import { use } from "react";
import { ArrowLeft, Megaphone } from "lucide-react";
import { PlanView } from "@/components/campaign/plan-view";
import { Button } from "@/components/ui/button";
import { useStore } from "@/hooks/use-store";
import { getCampaign } from "@/lib/store";

export default function CampaignDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const campaign = useStore(() => getCampaign(id));

  if (!campaign) {
    return (
      <div className="grid place-items-center py-24 text-center">
        <Megaphone className="size-10 text-muted-foreground mb-3" />
        <p className="text-muted-foreground mb-4">
          This campaign isn&apos;t in your workspace.
        </p>
        <Button asChild variant="outline">
          <Link href="/campaigns">Back to campaigns</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Button asChild variant="ghost" size="sm" className="-ml-2 print:hidden">
        <Link href="/campaigns">
          <ArrowLeft className="size-4" /> All campaigns
        </Link>
      </Button>
      <PlanView campaign={campaign} />
    </div>
  );
}

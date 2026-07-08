import { NextRequest, NextResponse } from "next/server";
import { isLiveMode, runJsonAgent, MODEL } from "@/lib/claude";
import { ANALYTICS_AGENT } from "@/prompts";
import type { AnalyticsBundle } from "@/types";

export const runtime = "nodejs";
export const maxDuration = 60;

interface Narrative {
  headline: string;
  insights: string[];
  actions: string[];
}

const DEMO_NARRATIVE: Narrative = {
  headline:
    "Applications up 68% over the sprint; CPA trending down as winning creatives scale.",
  insights: [
    "CTR climbed from 1.4% to ~2.0% after the week-2 creative refresh — the video variant is carrying volume.",
    "CPA fell ~28% as spend consolidated into the top two audiences; efficiency is compounding.",
    "Join rate lags applications, pointing to an onboarding bottleneck rather than a top-funnel problem.",
  ],
  actions: [
    "Shift 15% more budget to the winning Reels creative before festival CPMs rise.",
    "Fix the onboarding drop-off: trigger the WhatsApp reminder at 6h instead of 24h.",
    "Expand the top lookalike to 2-3% to protect volume as the core audience saturates.",
  ],
};

export async function POST(req: NextRequest) {
  const { bundle } = (await req.json()) as { bundle: AnalyticsBundle };

  if (isLiveMode()) {
    try {
      const narrative = await runJsonAgent<Narrative>({
        system: ANALYTICS_AGENT,
        user: `Here is the campaign performance data as JSON:\n\n${JSON.stringify(
          bundle,
        )}\n\nWrite the narrative JSON.`,
        maxTokens: 1200,
        temperature: 0.6,
      });
      return NextResponse.json({
        data: narrative,
        meta: { mode: "live", agent: "Analytics Agent", model: MODEL },
      });
    } catch (err) {
      console.error("analytics live narrative failed, falling back:", err);
    }
  }

  return NextResponse.json({
    data: DEMO_NARRATIVE,
    meta: { mode: "demo", agent: "Analytics Agent" },
  });
}

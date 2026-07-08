import { NextRequest, NextResponse } from "next/server";
import { isLiveMode, runJsonAgent, MODEL } from "@/lib/claude";
import { mockCampaign } from "@/lib/mock";
import { CAMPAIGN_AGENT, buildCampaignUserMessage } from "@/prompts";
import type { CampaignInput, CampaignPlan } from "@/types";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const input = (await req.json()) as CampaignInput;

  if (isLiveMode()) {
    try {
      const plan = await runJsonAgent<CampaignPlan>({
        system: CAMPAIGN_AGENT,
        user: buildCampaignUserMessage(input),
        maxTokens: 3000,
        temperature: 0.7,
      });
      return NextResponse.json({
        data: plan,
        meta: { mode: "live", agent: "Campaign Agent", model: MODEL },
      });
    } catch (err) {
      console.error("campaign live generation failed, falling back:", err);
    }
  }

  return NextResponse.json({
    data: mockCampaign(input),
    meta: { mode: "demo", agent: "Campaign Agent" },
  });
}

import { NextRequest, NextResponse } from "next/server";
import { isLiveMode, runJsonAgent, MODEL } from "@/lib/claude";
import { mockSection } from "@/lib/mock";
import { CAMPAIGN_AGENT, buildSectionUserMessage, SECTION_SHAPES } from "@/prompts";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const { section, context, seed } = (await req.json()) as {
    section: string;
    context: { title: string; summary: string; city: string; budget: number; goal: string; audience: string };
    seed?: number;
  };

  if (!SECTION_SHAPES[section]) {
    return NextResponse.json({ error: "unknown section" }, { status: 400 });
  }

  if (isLiveMode()) {
    try {
      const data = await runJsonAgent<unknown>({
        system: CAMPAIGN_AGENT,
        user: buildSectionUserMessage(section, context),
        maxTokens: 1500,
        temperature: 0.9,
      });
      return NextResponse.json({
        data,
        meta: { mode: "live", agent: "Campaign Agent", model: MODEL },
      });
    } catch (err) {
      console.error("section live regen failed, falling back:", err);
    }
  }

  return NextResponse.json({
    data: mockSection(
      section,
      { goal: context.goal, city: context.city, budget: context.budget, audience: context.audience },
      seed ?? 1,
    ),
    meta: { mode: "demo", agent: "Campaign Agent" },
  });
}

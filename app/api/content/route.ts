import { NextRequest, NextResponse } from "next/server";
import { isLiveMode, runJsonAgent, MODEL } from "@/lib/claude";
import { mockContent } from "@/lib/mock";
import { CONTENT_AGENT, buildContentUserMessage } from "@/prompts";
import type { ContentBlock, ContentChannel } from "@/types";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const { channels, context, language } = (await req.json()) as {
    channels: ContentChannel[];
    context: string;
    language?: string;
  };

  if (isLiveMode()) {
    try {
      const blocks = await runJsonAgent<ContentBlock[]>({
        system: CONTENT_AGENT,
        user: buildContentUserMessage(
          channels,
          context || "General acquisition campaign",
          language || "English",
        ),
        maxTokens: 2500,
        temperature: 0.85,
      });
      return NextResponse.json({
        data: blocks,
        meta: { mode: "live", agent: "Content Agent", model: MODEL },
      });
    } catch (err) {
      console.error("content live generation failed, falling back:", err);
    }
  }

  return NextResponse.json({
    data: mockContent(channels, context || ""),
    meta: { mode: "demo", agent: "Content Agent" },
  });
}

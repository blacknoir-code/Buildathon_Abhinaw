import { NextRequest, NextResponse } from "next/server";
import { isLiveMode, runChat, MODEL } from "@/lib/claude";
import { mockChatReply } from "@/lib/mock";
import { buildChatSystem } from "@/prompts";
import type { ChatMessage } from "@/types";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const { messages, campaignContext } = (await req.json()) as {
    messages: Pick<ChatMessage, "role" | "content">[];
    campaignContext?: string;
  };

  const last = messages[messages.length - 1]?.content ?? "";

  if (isLiveMode()) {
    try {
      const reply = await runChat(
        buildChatSystem(campaignContext),
        messages.map((m) => ({ role: m.role, content: m.content })),
      );
      return NextResponse.json({
        data: reply,
        meta: { mode: "live", agent: "GrowthPilot Copilot", model: MODEL },
      });
    } catch (err) {
      console.error("chat live generation failed, falling back:", err);
    }
  }

  return NextResponse.json({
    data: mockChatReply(last),
    meta: { mode: "demo", agent: "GrowthPilot Copilot" },
  });
}

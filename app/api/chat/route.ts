import { NextRequest } from "next/server";
import { isLiveMode, streamChat, MODEL } from "@/lib/claude";
import { mockChatReply } from "@/lib/mock";
import { buildChatSystem } from "@/prompts";
import type { ChatMessage } from "@/types";

export const runtime = "nodejs";
export const maxDuration = 60;

const encoder = new TextEncoder();
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function POST(req: NextRequest) {
  const { messages, campaignContext } = (await req.json()) as {
    messages: Pick<ChatMessage, "role" | "content">[];
    campaignContext?: string;
  };
  const last = messages[messages.length - 1]?.content ?? "";

  const live = isLiveMode();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        if (live) {
          for await (const delta of streamChat(
            buildChatSystem(campaignContext),
            messages.map((m) => ({ role: m.role, content: m.content })),
          )) {
            controller.enqueue(encoder.encode(delta));
          }
        } else {
          // Demo mode: stream the mock reply word-by-word so it still
          // types out live, no key required.
          const reply = mockChatReply(last);
          const tokens = reply.match(/\S+\s*/g) ?? [reply];
          for (const t of tokens) {
            controller.enqueue(encoder.encode(t));
            await sleep(18);
          }
        }
      } catch (err) {
        console.error("chat stream failed, falling back:", err);
        const reply = mockChatReply(last);
        controller.enqueue(encoder.encode(reply));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      "X-Gp-Mode": live ? "live" : "demo",
      "X-Gp-Model": live ? MODEL : "",
    },
  });
}

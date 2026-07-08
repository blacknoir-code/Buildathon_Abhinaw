import { NextRequest, NextResponse } from "next/server";
import { isLiveMode, runJsonAgent, MODEL, type ImageInput } from "@/lib/claude";
import { mockCreative } from "@/lib/mock";
import { CREATIVE_AGENT, CREATIVE_USER_TEXT } from "@/prompts";
import type { CreativeAnalysis } from "@/types";

export const runtime = "nodejs";
export const maxDuration = 60;

function parseDataUrl(dataUrl?: string): ImageInput | undefined {
  if (!dataUrl?.startsWith("data:")) return undefined;
  const match = dataUrl.match(/^data:(image\/(png|jpeg|jpg|webp|gif));base64,(.+)$/);
  if (!match) return undefined;
  const mt = match[1] === "image/jpg" ? "image/jpeg" : match[1];
  return { base64: match[3], mediaType: mt as ImageInput["mediaType"] };
}

export async function POST(req: NextRequest) {
  const { dataUrl, name } = (await req.json()) as {
    dataUrl?: string;
    name?: string;
  };

  if (isLiveMode()) {
    try {
      const analysis = await runJsonAgent<CreativeAnalysis>({
        system: CREATIVE_AGENT,
        user: CREATIVE_USER_TEXT,
        image: parseDataUrl(dataUrl),
        maxTokens: 2000,
        temperature: 0.6,
      });
      return NextResponse.json({
        data: analysis,
        meta: { mode: "live", agent: "Creative Agent", model: MODEL },
      });
    } catch (err) {
      console.error("creative live analysis failed, falling back:", err);
    }
  }

  return NextResponse.json({
    data: mockCreative(name),
    meta: { mode: "demo", agent: "Creative Agent" },
  });
}

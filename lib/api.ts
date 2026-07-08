"use client";

import type {
  AiMeta,
  AnalyticsBundle,
  CampaignInput,
  CampaignPlan,
  ChatMessage,
  ContentBlock,
  ContentChannel,
  CreativeAnalysis,
} from "@/types";

// ─────────────────────────────────────────────────────────────
// Typed client for the AI API routes. Every call returns the data
// plus AiMeta so the UI can badge live vs demo mode.
// ─────────────────────────────────────────────────────────────

async function post<T>(url: string, body: unknown): Promise<{ data: T; meta: AiMeta }> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`${url} failed: ${res.status}`);
  return res.json();
}

export const api = {
  generateCampaign: (input: CampaignInput) =>
    post<CampaignPlan>("/api/campaign", input),

  regenerateSection: <T,>(payload: {
    section: string;
    context: { title: string; summary: string; city: string; budget: number; goal: string; audience: string };
    seed?: number;
  }) => post<T>("/api/campaign/section", payload),

  analyzeCreative: (payload: { dataUrl?: string; name?: string }) =>
    post<CreativeAnalysis>("/api/creative", payload),

  generateContent: (payload: {
    channels: ContentChannel[];
    context: string;
    language?: string;
  }) => post<ContentBlock[]>("/api/content", payload),

  /**
   * Stream a Copilot reply. Calls onDelta for each text chunk as it
   * arrives and resolves with the full text + mode once complete.
   */
  chatStream: async (
    payload: {
      messages: Pick<ChatMessage, "role" | "content">[];
      campaignContext?: string;
    },
    onDelta: (chunk: string, full: string) => void,
  ): Promise<{ text: string; mode: AiMeta["mode"] }> => {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok || !res.body) throw new Error(`chat failed: ${res.status}`);
    const mode = (res.headers.get("X-Gp-Mode") as AiMeta["mode"]) || "demo";
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let full = "";
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      full += chunk;
      onDelta(chunk, full);
    }
    return { text: full, mode };
  },

  narrateAnalytics: (bundle: AnalyticsBundle) =>
    post<{ headline: string; insights: string[]; actions: string[] }>(
      "/api/analytics",
      { bundle },
    ),
};

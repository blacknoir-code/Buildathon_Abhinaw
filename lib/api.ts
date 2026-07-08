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

  analyzeCreative: (payload: { dataUrl?: string; name?: string }) =>
    post<CreativeAnalysis>("/api/creative", payload),

  generateContent: (payload: {
    channels: ContentChannel[];
    context: string;
    language?: string;
  }) => post<ContentBlock[]>("/api/content", payload),

  chat: (payload: {
    messages: Pick<ChatMessage, "role" | "content">[];
    campaignContext?: string;
  }) => post<string>("/api/chat", payload),

  narrateAnalytics: (bundle: AnalyticsBundle) =>
    post<{ headline: string; insights: string[]; actions: string[] }>(
      "/api/analytics",
      { bundle },
    ),
};

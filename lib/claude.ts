import Anthropic from "@anthropic-ai/sdk";

// ─────────────────────────────────────────────────────────────
// The AI orchestrator. A thin, typed, provider-agnostic wrapper
// that every specialised agent calls through.
//
// Providers (auto-detected by env, in priority order):
//   1. OpenAI-compatible gateway  — set OPENAI_API_KEY (e.g. a
//      hackathon Bifrost/GPT gateway). OPENAI_BASE_URL + OPENAI_MODEL
//      configure the endpoint and model.
//   2. Anthropic (Claude)         — set ANTHROPIC_API_KEY.
//   3. Demo                       — nothing set; callers fall back to
//      deterministic mocks so the product is always demoable.
//
// The file keeps its historical name/exports so nothing else has to
// change when the provider does.
// ─────────────────────────────────────────────────────────────

type Provider = "openai" | "anthropic" | "none";

function provider(): Provider {
  if (process.env.OPENAI_API_KEY) return "openai";
  if (process.env.ANTHROPIC_API_KEY) return "anthropic";
  return "none";
}

const OPENAI_BASE_URL =
  process.env.OPENAI_BASE_URL || "https://gateway-buildathon.ltl.sh/v1";
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o";
const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-5";

/** The active model id, for UI badges / response metadata. */
export const MODEL =
  provider() === "openai"
    ? OPENAI_MODEL
    : provider() === "anthropic"
      ? ANTHROPIC_MODEL
      : "demo";

export function isLiveMode(): boolean {
  return provider() !== "none";
}

// --- Anthropic client (lazy) ---
let anthropic: Anthropic | null = null;
function anthropicClient(): Anthropic {
  if (!anthropic) {
    anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return anthropic;
}

export type ImageInput = {
  /** base64 (no data: prefix) */
  base64: string;
  mediaType: "image/png" | "image/jpeg" | "image/webp" | "image/gif";
};

export interface RunOptions {
  system: string;
  user: string;
  image?: ImageInput;
  maxTokens?: number;
  temperature?: number;
}

// ─────────────────────────── OpenAI-compatible ───────────────────────────

type OpenAIMessage = {
  role: "system" | "user" | "assistant";
  content:
    | string
    | Array<
        | { type: "text"; text: string }
        | { type: "image_url"; image_url: { url: string } }
      >;
};

async function openaiChat(
  messages: OpenAIMessage[],
  opts: { maxTokens?: number; temperature?: number } = {},
): Promise<string> {
  const res = await fetch(`${OPENAI_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      max_tokens: opts.maxTokens ?? 2048,
      temperature: opts.temperature ?? 0.7,
      messages,
    }),
  });
  if (!res.ok) {
    throw new Error(`gateway ${res.status}: ${await res.text().catch(() => "")}`);
  }
  const data = await res.json();
  return (data?.choices?.[0]?.message?.content ?? "").trim();
}

async function* openaiStream(
  messages: OpenAIMessage[],
): AsyncGenerator<string> {
  const res = await fetch(`${OPENAI_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      stream: true,
      max_tokens: 1500,
      temperature: 0.8,
      messages,
    }),
  });
  if (!res.ok || !res.body) {
    throw new Error(`gateway ${res.status}`);
  }
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      const t = line.trim();
      if (!t.startsWith("data:")) continue;
      const payload = t.slice(5).trim();
      if (payload === "[DONE]") return;
      try {
        const json = JSON.parse(payload);
        const delta = json?.choices?.[0]?.delta?.content;
        if (delta) yield delta as string;
      } catch {
        // ignore keep-alives / partial frames
      }
    }
  }
}

function openaiUserContent(opts: RunOptions): OpenAIMessage["content"] {
  if (!opts.image) return opts.user;
  return [
    {
      type: "image_url",
      image_url: {
        url: `data:${opts.image.mediaType};base64,${opts.image.base64}`,
      },
    },
    { type: "text", text: opts.user },
  ];
}

// ─────────────────────────── Anthropic ───────────────────────────

function anthropicContent(opts: RunOptions): Anthropic.ContentBlockParam[] {
  const content: Anthropic.ContentBlockParam[] = [];
  if (opts.image) {
    content.push({
      type: "image",
      source: {
        type: "base64",
        media_type: opts.image.mediaType,
        data: opts.image.base64,
      },
    });
  }
  content.push({ type: "text", text: opts.user });
  return content;
}

function anthropicText(res: Anthropic.Message): string {
  return res.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("\n")
    .trim();
}

// ─────────────────────────── Public API ───────────────────────────

/** Run an agent (single user turn, optional image) and return text. */
export async function runAgent(opts: RunOptions): Promise<string> {
  if (provider() === "openai") {
    return openaiChat(
      [
        { role: "system", content: opts.system },
        { role: "user", content: openaiUserContent(opts) },
      ],
      { maxTokens: opts.maxTokens, temperature: opts.temperature },
    );
  }
  // anthropic
  const res = await anthropicClient().messages.create({
    model: ANTHROPIC_MODEL,
    max_tokens: opts.maxTokens ?? 2048,
    temperature: opts.temperature ?? 0.7,
    system: opts.system,
    messages: [{ role: "user", content: anthropicContent(opts) }],
  });
  return anthropicText(res);
}

/** Non-streaming multi-turn chat. */
export async function runChat(
  system: string,
  messages: { role: "user" | "assistant"; content: string }[],
): Promise<string> {
  if (provider() === "openai") {
    return openaiChat(
      [{ role: "system", content: system }, ...messages],
      { maxTokens: 1500, temperature: 0.8 },
    );
  }
  const res = await anthropicClient().messages.create({
    model: ANTHROPIC_MODEL,
    max_tokens: 1500,
    temperature: 0.8,
    system,
    messages: messages.map((m) => ({ role: m.role, content: m.content })),
  });
  return anthropicText(res);
}

/** Streaming multi-turn chat for the Copilot. Yields text deltas. */
export async function* streamChat(
  system: string,
  messages: { role: "user" | "assistant"; content: string }[],
): AsyncGenerator<string> {
  if (provider() === "openai") {
    yield* openaiStream([{ role: "system", content: system }, ...messages]);
    return;
  }
  const stream = anthropicClient().messages.stream({
    model: ANTHROPIC_MODEL,
    max_tokens: 1500,
    temperature: 0.8,
    system,
    messages: messages.map((m) => ({ role: m.role, content: m.content })),
  });
  for await (const event of stream) {
    if (
      event.type === "content_block_delta" &&
      event.delta.type === "text_delta"
    ) {
      yield event.delta.text;
    }
  }
}

/**
 * Extract a JSON value from a model response. Handles ```json fences,
 * leading prose, and trailing commentary by scanning for the first
 * balanced object/array. Throws if nothing parseable is found.
 */
export function extractJson<T>(raw: string): T {
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced ? fenced[1] : raw;

  try {
    return JSON.parse(candidate.trim()) as T;
  } catch {
    // fall through to bracket scanning
  }

  const start = candidate.search(/[[{]/);
  if (start === -1) throw new Error("No JSON found in model response");

  const open = candidate[start];
  const close = open === "{" ? "}" : "]";
  let depth = 0;
  let inString = false;
  let escape = false;
  for (let i = start; i < candidate.length; i++) {
    const ch = candidate[i];
    if (escape) {
      escape = false;
      continue;
    }
    if (ch === "\\") {
      escape = true;
      continue;
    }
    if (ch === '"') inString = !inString;
    if (inString) continue;
    if (ch === open) depth++;
    else if (ch === close) {
      depth--;
      if (depth === 0) {
        return JSON.parse(candidate.slice(start, i + 1)) as T;
      }
    }
  }
  throw new Error("Unbalanced JSON in model response");
}

/** Run an agent and parse its response as JSON. */
export async function runJsonAgent<T>(opts: RunOptions): Promise<T> {
  const raw = await runAgent(opts);
  return extractJson<T>(raw);
}

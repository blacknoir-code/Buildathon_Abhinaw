import Anthropic from "@anthropic-ai/sdk";

// ─────────────────────────────────────────────────────────────
// The AI orchestrator. A thin, typed wrapper over the Claude
// Messages API that every specialised agent calls through.
//
// Design principle: LIVE-OR-DEMO. If ANTHROPIC_API_KEY is present
// we call Claude for real. If it is absent (or a call fails), the
// caller falls back to a deterministic mock so the product is
// always demoable — no key, no network, no problem.
// ─────────────────────────────────────────────────────────────

export const MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-5";

export function isLiveMode(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

let client: Anthropic | null = null;
function getClient(): Anthropic {
  if (!client) {
    client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return client;
}

export type ImageInput = {
  /** base64 (no data: prefix) */
  base64: string;
  mediaType: "image/png" | "image/jpeg" | "image/webp" | "image/gif";
};

export interface RunOptions {
  system: string;
  /** Plain text user prompt. */
  user: string;
  /** Optional image for vision agents (Creative Studio). */
  image?: ImageInput;
  maxTokens?: number;
  temperature?: number;
}

/** Run an agent and return raw text. Throws on any API error. */
export async function runAgent(opts: RunOptions): Promise<string> {
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

  const res = await getClient().messages.create({
    model: MODEL,
    max_tokens: opts.maxTokens ?? 2048,
    temperature: opts.temperature ?? 0.7,
    system: opts.system,
    messages: [{ role: "user", content }],
  });

  return res.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("\n")
    .trim();
}

/**
 * Streaming multi-turn chat for the Copilot. Yields text deltas as
 * Claude produces them. Throws on any API error (caller falls back).
 */
export async function* streamChat(
  system: string,
  messages: { role: "user" | "assistant"; content: string }[],
): AsyncGenerator<string> {
  const stream = getClient().messages.stream({
    model: MODEL,
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

/** Multi-turn chat helper for the Copilot. */
export async function runChat(
  system: string,
  messages: { role: "user" | "assistant"; content: string }[],
): Promise<string> {
  const res = await getClient().messages.create({
    model: MODEL,
    max_tokens: 1500,
    temperature: 0.8,
    system,
    messages: messages.map((m) => ({ role: m.role, content: m.content })),
  });
  return res.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("\n")
    .trim();
}

/**
 * Extract a JSON value from a model response. Handles ```json fences,
 * leading prose, and trailing commentary by scanning for the first
 * balanced object/array. Throws if nothing parseable is found.
 */
export function extractJson<T>(raw: string): T {
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced ? fenced[1] : raw;

  // Try a straight parse first.
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

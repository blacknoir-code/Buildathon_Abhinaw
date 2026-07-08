"use client";

import type { Campaign, Creative, HistoryEntry } from "@/types";

// ─────────────────────────────────────────────────────────────
// Client-side workspace store. A tiny localStorage-backed layer so
// the whole product is explorable with no database. If Supabase is
// wired up later, these are the exact shapes to sync.
// ─────────────────────────────────────────────────────────────

const KEYS = {
  campaigns: "gp.campaigns",
  creatives: "gp.creatives",
  history: "gp.history",
} as const;

type Listener = () => void;
const listeners = new Set<Listener>();

export function subscribe(fn: Listener): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function emit() {
  listeners.forEach((l) => l());
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("gp:store"));
  }
}

function read<T>(key: string): T[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(window.localStorage.getItem(key) || "[]") as T[];
  } catch {
    return [];
  }
}

function write<T>(key: string, value: T[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
  emit();
}

// --- Campaigns ---
export function getCampaigns(): Campaign[] {
  return read<Campaign>(KEYS.campaigns).sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt),
  );
}
export function getCampaign(id: string): Campaign | undefined {
  return read<Campaign>(KEYS.campaigns).find((c) => c.id === id);
}
export function saveCampaign(c: Campaign) {
  const all = read<Campaign>(KEYS.campaigns).filter((x) => x.id !== c.id);
  write(KEYS.campaigns, [c, ...all]);
  addHistory({
    action: "Generated campaign",
    prompt: c.prompt || c.goal,
    response: c.plan.title,
  });
}
export function deleteCampaign(id: string) {
  write(
    KEYS.campaigns,
    read<Campaign>(KEYS.campaigns).filter((c) => c.id !== id),
  );
}

// --- Creatives ---
export function getCreatives(): Creative[] {
  return read<Creative>(KEYS.creatives).sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt),
  );
}
export function saveCreative(c: Creative) {
  const all = read<Creative>(KEYS.creatives).filter((x) => x.id !== c.id);
  write(KEYS.creatives, [c, ...all]);
  addHistory({
    action: "Analysed creative",
    prompt: c.name,
    response: c.analysis ? `Score ${c.analysis.overall}/100` : "uploaded",
  });
}

// --- History ---
export function getHistory(): HistoryEntry[] {
  return read<HistoryEntry>(KEYS.history).sort((a, b) =>
    b.timestamp.localeCompare(a.timestamp),
  );
}
export function addHistory(entry: Omit<HistoryEntry, "id" | "timestamp">) {
  const all = read<HistoryEntry>(KEYS.history);
  const item: HistoryEntry = {
    ...entry,
    id: `h_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    timestamp: new Date().toISOString(),
  };
  write(KEYS.history, [item, ...all].slice(0, 200));
}

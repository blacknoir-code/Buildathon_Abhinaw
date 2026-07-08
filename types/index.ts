// ─────────────────────────────────────────────────────────────
// GrowthPilot AI — shared domain types
// These describe the artifacts that flow between the AI layer,
// the API routes, the database, and the UI.
// ─────────────────────────────────────────────────────────────

export type Platform =
  | "Meta"
  | "Google"
  | "WhatsApp"
  | "YouTube"
  | "Instagram"
  | "OOH"
  | "Local/Field"
  | "SMS"
  | "Email";

export interface CampaignInput {
  goal: string;
  city?: string;
  budget?: number;
  timeline?: string;
  audience?: string;
  platforms?: Platform[];
  language?: string;
  instructions?: string;
  /** Free-form natural language prompt (the "single line" flow). */
  prompt?: string;
}

export interface BudgetSplit {
  channel: string;
  amount: number;
  percent: number;
  rationale: string;
}

export interface Persona {
  name: string;
  age: string;
  motivation: string;
  channels: string[];
  objection: string;
}

export interface TimelinePhase {
  phase: string;
  window: string;
  focus: string;
  status: "upcoming" | "active" | "done";
}

export interface Kpi {
  metric: string;
  target: string;
  why: string;
}

export interface Risk {
  risk: string;
  severity: "low" | "medium" | "high";
  mitigation: string;
}

export interface CampaignPlan {
  title: string;
  summary: string;
  objectives: string[];
  personas: Persona[];
  channels: { channel: string; strategy: string }[];
  budgetSplit: BudgetSplit[];
  timeline: TimelinePhase[];
  kpis: Kpi[];
  risks: Risk[];
  nextSteps: string[];
}

export interface Campaign {
  id: string;
  title: string;
  prompt: string;
  goal: string;
  budget: number;
  city: string;
  audience: string;
  plan: CampaignPlan;
  createdAt: string;
}

// --- Creative Studio ---

export interface CreativeScore {
  label: string;
  score: number; // 0-100
  verdict: string;
}

export interface CreativeAnalysis {
  overall: number;
  predictedCtr: number; // percent
  scores: CreativeScore[];
  strengths: string[];
  issues: string[];
  improvedCopy: string;
  improvedCta: string;
  imagePrompt: string;
}

export interface Creative {
  id: string;
  campaignId?: string;
  type: "poster" | "banner" | "screenshot" | "video";
  name: string;
  dataUrl?: string;
  analysis?: CreativeAnalysis;
  createdAt: string;
}

// --- Content Generator ---

export type ContentChannel =
  | "meta_ad"
  | "google_ad"
  | "whatsapp"
  | "sms"
  | "email"
  | "push"
  | "landing"
  | "video_script";

export interface ContentBlock {
  channel: ContentChannel;
  title: string;
  body: string;
  meta?: string;
}

// --- Analytics (mock) ---

export interface MetricPoint {
  date: string;
  value: number;
}

export interface AnalyticsBundle {
  ctr: MetricPoint[];
  cpa: MetricPoint[];
  applications: MetricPoint[];
  joins: MetricPoint[];
  budgetUsed: number;
  budgetTotal: number;
  roi: number;
  channelSplit: { channel: string; value: number }[];
}

// --- AI Chat ---

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

// --- History ---

export interface HistoryEntry {
  id: string;
  action: string;
  prompt: string;
  response: string;
  timestamp: string;
}

/** Metadata returned on every AI response so the UI can badge live vs demo. */
export interface AiMeta {
  mode: "live" | "demo";
  agent: string;
  model?: string;
}

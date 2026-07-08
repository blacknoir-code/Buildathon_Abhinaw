// Central registry of the specialised AI agents that make up the
// GrowthPilot AI orchestrator. Each agent is a system prompt plus
// (optionally) helpers to build its user message.
export { CAMPAIGN_AGENT, buildCampaignUserMessage } from "./campaign";
export { CREATIVE_AGENT, CREATIVE_USER_TEXT } from "./creative";
export { CONTENT_AGENT, buildContentUserMessage } from "./content";
export { CHAT_AGENT, buildChatSystem } from "./chat";
export { RISK_AGENT } from "./risk";
export { REVIEWER_AGENT } from "./reviewer";
export { ANALYTICS_AGENT } from "./analytics";
export { TRANSLATOR_AGENT, buildTranslatorUserMessage } from "./translator";

export const AGENTS = [
  { key: "campaign", name: "Campaign Agent", role: "Plans launch-ready campaigns" },
  { key: "creative", name: "Creative Agent", role: "Scores and rewrites creatives" },
  { key: "content", name: "Content Agent", role: "Writes multi-channel copy" },
  { key: "reviewer", name: "Reviewer Agent", role: "Quality-gates every plan" },
  { key: "risk", name: "Risk Agent", role: "Pressure-tests for what breaks" },
  { key: "analytics", name: "Analytics Agent", role: "Narrates performance" },
  { key: "translator", name: "Translator Agent", role: "Localises into Indian languages" },
  { key: "copilot", name: "GrowthPilot Copilot", role: "Always-on chat teammate" },
] as const;

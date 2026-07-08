import type {
  AnalyticsBundle,
  CampaignInput,
  CampaignPlan,
  ContentBlock,
  ContentChannel,
  CreativeAnalysis,
} from "@/types";
import { formatCurrencyINR } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────
// Deterministic, believable fallbacks. When there's no Claude key
// (or a call fails), these keep the entire product demoable. They
// react to the user's input so the output never looks canned.
// ─────────────────────────────────────────────────────────────

/** Pull structured hints out of a free-text prompt. */
export function parsePrompt(input: CampaignInput): Required<
  Pick<CampaignInput, "goal" | "city" | "budget" | "timeline" | "audience">
> {
  const text = `${input.prompt ?? ""} ${input.goal ?? ""}`.toLowerCase();

  const cities = [
    "mumbai", "pune", "delhi", "bengaluru", "bangalore", "hyderabad",
    "chennai", "kolkata", "ahmedabad", "jaipur", "surat", "lucknow",
  ];
  const city =
    input.city ||
    cities.find((c) => text.includes(c))?.replace(/^\w/, (m) => m.toUpperCase()) ||
    "Pune";

  // Budget: match "15 lakh", "₹15,00,000", "15L", "1.5 cr"
  let budget = input.budget || 0;
  if (!budget) {
    const lakh = text.match(/(\d+(?:\.\d+)?)\s*(?:lakh|lakhs|lac|l\b)/);
    const cr = text.match(/(\d+(?:\.\d+)?)\s*(?:crore|cr)\b/);
    const raw = text.match(/₹?\s*([\d,]{4,})/);
    if (cr) budget = parseFloat(cr[1]) * 10_000_000;
    else if (lakh) budget = parseFloat(lakh[1]) * 100_000;
    else if (raw) budget = parseInt(raw[1].replace(/,/g, ""), 10);
  }
  if (!budget) budget = 1_500_000;

  const festival =
    text.match(/diwali|holi|dussehra|onam|eid|navratri|new year|christmas/)?.[0] ||
    input.timeline;
  const timeline = festival
    ? `Before ${festival.replace(/^\w/, (m) => m.toUpperCase())} (≈6 weeks)`
    : input.timeline || "6-week sprint";

  const target = text.match(/(\d[\d,]{2,})\s*(fes?|delivery|executives|riders|users|agents)/);
  const audience =
    input.audience ||
    (target
      ? `${target[1]} ${target[2].includes("fe") || target[2].includes("delivery") || target[2].includes("exec") ? "delivery executives / gig workers" : target[2]}`
      : "Gig-economy job seekers, 18-35, tier-1/2 cities");

  const goal =
    input.goal ||
    input.prompt ||
    "Drive high-intent acquisition within budget before the deadline";

  return { goal, city, budget, timeline, audience };
}

export function mockCampaign(input: CampaignInput): CampaignPlan {
  const { goal, city, budget, timeline, audience } = parsePrompt(input);
  const numberTarget =
    (input.prompt || goal).match(/(\d[\d,]{2,})/)?.[1] || "5,000";

  const split = [
    { channel: "Meta (FB/Instagram)", percent: 38 },
    { channel: "Google (Search + YouTube)", percent: 22 },
    { channel: "WhatsApp + SMS", percent: 15 },
    { channel: "Field / OOH", percent: 15 },
    { channel: "Creative + Contingency", percent: 10 },
  ];

  return {
    title: `${city}: ${numberTarget} acquisition sprint`,
    summary: `A ${timeline.toLowerCase()} performance campaign to hit the goal — "${goal}" — in ${city} on a ${formatCurrencyINR(
      budget,
    )} budget. Weighted toward high-intent Meta and Search, with WhatsApp for warm follow-up and field activation to close the last mile.`,
    objectives: [
      `Acquire the target volume (${numberTarget}) within ${timeline.toLowerCase()}`,
      `Keep blended cost-per-acquisition under ${formatCurrencyINR(Math.round(budget / (parseInt(numberTarget.replace(/,/g, ""), 10) || 5000)))}`,
      "Build a warm WhatsApp remarketing pool for future sprints",
      "Localise all creative into the city's dominant language",
    ],
    personas: [
      {
        name: "Rohit, the switcher",
        age: "24-30",
        motivation: "Wants higher, flexible daily earnings than his current gig",
        channels: ["Instagram Reels", "WhatsApp", "YouTube Shorts"],
        objection: "\"Is the payout actually as high as they claim?\"",
      },
      {
        name: "Sunita, the first-timer",
        age: "20-26",
        motivation: "Looking for her first flexible income near home",
        channels: ["Facebook", "Local field agents", "SMS"],
        objection: "\"Is this safe and is onboarding complicated?\"",
      },
    ],
    channels: [
      { channel: "Meta", strategy: "Reels-first creative, lookalike + interest stacks, lead forms with instant WhatsApp handoff." },
      { channel: "Google", strategy: "High-intent search on '<city> delivery job / part time earning' + YouTube Shorts for reach." },
      { channel: "WhatsApp", strategy: "Automated onboarding drip; re-engage drop-offs within 24h." },
      { channel: "Field / OOH", strategy: "Auto-rickshaw branding + college/market activations in top 5 pincodes." },
    ],
    budgetSplit: split.map((s) => ({
      channel: s.channel,
      percent: s.percent,
      amount: Math.round((budget * s.percent) / 100),
      rationale:
        s.channel.startsWith("Meta")
          ? "Cheapest qualified volume for this audience"
          : s.channel.startsWith("Google")
            ? "Captures ready-to-act searchers"
            : s.channel.startsWith("WhatsApp")
              ? "Highest conversion on warm leads"
              : s.channel.startsWith("Field")
                ? "Trust + last-mile conversion in target pincodes"
                : "Buffer for creative refresh and scaling winners",
    })),
    timeline: [
      { phase: "Setup & Creative", window: "Week 1", focus: "Pixels, lead forms, 6 creative variants, WhatsApp flow", status: "active" },
      { phase: "Launch", window: "Week 2", focus: "Go live across Meta + Google, tight geo-targeting", status: "upcoming" },
      { phase: "Optimize", window: "Weeks 3-4", focus: "Kill losers, double down on winning creatives/audiences", status: "upcoming" },
      { phase: "Scale", window: "Week 5", focus: "Raise budgets on winners, add field activation", status: "upcoming" },
      { phase: "Closure", window: "Week 6", focus: "Final push, handover warm pool, retro report", status: "upcoming" },
    ],
    kpis: [
      { metric: "Qualified leads", target: `${numberTarget}+`, why: "Primary acquisition goal" },
      { metric: "Blended CPA", target: `< ${formatCurrencyINR(Math.round(budget / (parseInt(numberTarget.replace(/,/g, ""), 10) || 5000)))}`, why: "Keeps the sprint inside budget" },
      { metric: "Lead → onboarded", target: "> 35%", why: "Measures funnel & ops quality" },
      { metric: "CTR (Meta)", target: "> 1.8%", why: "Creative-market fit signal" },
    ],
    risks: [
      { risk: "Creative fatigue by week 3 on Meta", severity: "medium", mitigation: "Pre-produce 6 variants; refresh top spend units weekly" },
      { risk: "Onboarding capacity can't absorb lead volume", severity: "high", mitigation: "Stagger geo launches; confirm ops SLA before scaling" },
      { risk: "Festival CPMs spike near the deadline", severity: "medium", mitigation: "Front-load spend; lock inventory early" },
      { risk: "Payout claims trigger ad disapprovals", severity: "low", mitigation: "Use compliant, range-based earning language" },
    ],
    nextSteps: [
      "Approve budget split and creative direction",
      "Generate the 6 creative variants in Creative Studio",
      "Draft WhatsApp + SMS onboarding copy in Content Generator",
      "Confirm ops onboarding capacity for the target volume",
    ],
  };
}

export function mockCreative(name = "poster"): CreativeAnalysis {
  return {
    overall: 68,
    predictedCtr: 1.9,
    scores: [
      { label: "Readability", score: 72, verdict: "Body text is legible; headline could be 20% larger for mobile feeds." },
      { label: "Contrast", score: 61, verdict: "CTA button contrast fails WCAG AA — darken the background behind it." },
      { label: "CTA strength", score: 55, verdict: "\"Know more\" is passive. Use an action + benefit verb." },
      { label: "Visual hierarchy", score: 70, verdict: "Good top-down flow, but the earning figure should be the hero." },
      { label: "Emotional pull", score: 65, verdict: "Add a real person's face — trust drives gig-hiring clicks." },
      { label: "Brand alignment", score: 80, verdict: "On-palette and on-logo; consistent with the brand system." },
      { label: "Accessibility", score: 58, verdict: "Text-over-image reduces contrast; add a scrim layer." },
    ],
    strengths: [
      "Clear single offer",
      "Brand colours used correctly",
      "Mobile-first vertical format",
    ],
    issues: [
      "CTA is weak and low-contrast",
      "The key number (earnings) isn't the visual hero",
      "No human face to build trust",
    ],
    improvedCopy:
      "Earn up to ₹40,000/month — flexible hours, weekly payouts. Start delivering in your city this week.",
    improvedCta: "Start earning today →",
    imagePrompt:
      "Vertical 9:16 poster, a smiling young Indian delivery rider in branded jacket holding a phone, warm golden-hour light, bold headline '₹40,000/month' as the hero, high-contrast action button at the bottom, clean brand palette, mobile-optimised, photorealistic.",
  };
}

export function mockContent(
  channels: ContentChannel[],
  context: string,
): ContentBlock[] {
  const templates: Record<ContentChannel, ContentBlock> = {
    meta_ad: {
      channel: "meta_ad",
      title: "Your next paycheck starts this week 💸",
      body: "Flexible hours. Weekly payouts. Earn up to ₹40,000/month delivering in your city. Tap to apply in 2 minutes — no experience needed.",
      meta: "Headline: Earn ₹40K/mo, your way • CTA: Apply Now",
    },
    google_ad: {
      channel: "google_ad",
      title: "Delivery Jobs Near You | Weekly Pay",
      body: "Join today, start earning this week. Flexible shifts, instant onboarding. Apply in 2 minutes.",
      meta: "Headlines (3) + Descriptions (2), RSA-ready",
    },
    whatsapp: {
      channel: "whatsapp",
      title: "Onboarding nudge",
      body: "Hi 👋 You're one step away from your first earning day! Complete your quick verification here and start delivering this week. Need help? Just reply to this message.",
      meta: "Send 24h after lead capture",
    },
    sms: {
      channel: "sms",
      title: "SMS blast",
      body: "Earn up to ₹40K/mo, flexible hours. Apply in 2 min: {link} — Team GrowthPilot",
      meta: "148 chars • includes {link}",
    },
    email: {
      channel: "email",
      title: "You could start earning this week",
      body: "Hi there,\n\nGig work that fits your schedule is waiting. Weekly payouts, flexible hours, and onboarding in under a day. Tap below to apply — it takes 2 minutes.\n\n[Apply now]",
      meta: "Subject line + short body",
    },
    push: {
      channel: "push",
      title: "₹40K/month, your schedule 💸",
      body: "Apply in 2 minutes and start earning this week. Tap to begin →",
      meta: "Title 32 chars • Body 58 chars",
    },
    landing: {
      channel: "landing",
      title: "Earn up to ₹40,000/month — on your schedule",
      body: "Flexible hours that fit your life\nWeekly payouts, straight to your account\nOnboarding in under a day\n\n[Start earning today]",
      meta: "Hero + 3 benefits + CTA",
    },
    video_script: {
      channel: "video_script",
      title: "20s Reel: 'One week, first payout'",
      body: "[0-3s] Close-up: phone buzzes, ₹ payout notification.\n[3-8s] Rider smiles, rides through the city.\n[8-14s] VO: 'Flexible hours. Weekly pay. Up to ₹40,000 a month.'\n[14-20s] Text: 'Apply in 2 minutes' + CTA button.",
      meta: "Vertical 9:16 • upbeat regional track",
    },
  };

  return channels.map((c) => templates[c]).filter(Boolean);
}

export function mockAnalytics(): AnalyticsBundle {
  const days = 21;
  const series = (base: number, drift: number, noise: number) =>
    Array.from({ length: days }, (_, i) => {
      const d = new Date(2026, 5, 1 + i);
      const wobble = Math.sin(i / 3) * noise;
      return {
        date: d.toISOString().slice(0, 10),
        value: Math.max(0, +(base + drift * i + wobble).toFixed(2)),
      };
    });

  return {
    ctr: series(1.4, 0.03, 0.25),
    cpa: series(320, -4.5, 22),
    applications: series(180, 12, 40),
    joins: series(60, 5.5, 18),
    budgetUsed: 1_040_000,
    budgetTotal: 1_500_000,
    roi: 3.4,
    channelSplit: [
      { channel: "Meta", value: 46 },
      { channel: "Google", value: 24 },
      { channel: "WhatsApp", value: 16 },
      { channel: "Field", value: 14 },
    ],
  };
}

export function mockChatReply(userMessage: string): string {
  const q = userMessage.toLowerCase();
  if (q.includes("ctr") && (q.includes("fall") || q.includes("drop") || q.includes("down"))) {
    return `**CTR likely fell for three reasons — ranked:**

1. **Creative fatigue.** Your top spend unit has been live 9+ days; frequency is probably above 3.5. → *Rotate in 2 fresh variants today.*
2. **Audience saturation.** The core lookalike is over-served. → *Expand to a 2-3% LAL or add an interest stack.*
3. **Placement drift.** Spend crept into Audience Network. → *Exclude it and keep Reels + Feed only.*

Want me to draft the two replacement creatives?`;
  }
  if (q.includes("translate") || q.includes("marathi") || q.includes("hindi")) {
    return `Here's the headline transcreated to **Marathi** (intent preserved, not literal):

> **दर आठवड्याला कमाई — तुमच्या वेळेनुसार. आजच सुरू करा!**

Want it for SMS (≤160 chars) or the Meta primary text too?`;
  }
  if (q.includes("risk")) {
    return `**Top risks for this sprint:**

- 🔴 **Onboarding capacity** — lead volume may outrun ops. Stagger geo launches.
- 🟠 **Festival CPM spike** near the deadline. Front-load spend now.
- 🟠 **Creative fatigue** by week 3. Pre-produce 6 variants.
- 🟡 **Ad disapprovals** on earning claims. Use range-based language.`;
  }
  if (q.includes("headline") || q.includes("copy") || q.includes("shorter")) {
    return `Here are 3 tighter headlines:

1. **₹40K/month. Your hours. Start this week.**
2. **Weekly pay, flexible shifts — apply in 2 minutes.**
3. **Your city needs riders. You need income. Let's go.**

Want variants for Marathi/Hindi?`;
  }
  return `Got it. Here's how I'd approach that:

- I have the current campaign's context loaded (goal, budget, channels, KPIs).
- Ask me to diagnose a metric, generate creatives, rewrite copy, translate into any Indian language, or predict risks.

For example: *"Why did CPA rise this week?"* or *"Give me 5 Instagram hooks in Hindi."*

*(This is a demo-mode reply — add an ANTHROPIC_API_KEY to get live, campaign-specific answers.)*`;
}

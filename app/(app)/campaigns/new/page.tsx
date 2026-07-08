"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Sparkles, Wand2, SlidersHorizontal } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { GeneratingOverlay } from "@/components/campaign/generating-overlay";
import { api } from "@/lib/api";
import { saveCampaign } from "@/lib/store";
import { parsePrompt } from "@/lib/mock";
import { nanoId } from "@/lib/utils";
import type { CampaignInput, Platform } from "@/types";

const EXAMPLES = [
  "Need 5,000 delivery executives in Mumbai before Diwali with a ₹15 lakh budget.",
  "Acquire 2,000 sellers in Surat this quarter, ₹8 lakh, Hindi + Gujarati.",
  "Grow app installs in Bengaluru among students, ₹5 lakh, 4 weeks.",
];

const PLATFORMS: Platform[] = ["Meta", "Google", "WhatsApp", "YouTube", "Instagram", "OOH", "Local/Field"];

export default function NewCampaignPage() {
  const router = useRouter();
  const [prompt, setPrompt] = useState("");
  const [advanced, setAdvanced] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fields, setFields] = useState<CampaignInput>({ goal: "", platforms: [] });

  async function generate() {
    if (!prompt.trim() && !fields.goal?.trim()) return;
    setLoading(true);
    const input: CampaignInput = advanced
      ? { ...fields, prompt: prompt || undefined }
      : { goal: "", prompt };
    try {
      const started = Date.now();
      const { data } = await api.generateCampaign(input);
      // Keep the orchestration animation visible for a beat.
      const elapsed = Date.now() - started;
      if (elapsed < 2600) await new Promise((r) => setTimeout(r, 2600 - elapsed));
      const meta = parsePrompt(input);
      const id = nanoId("c_");
      saveCampaign({
        id,
        title: data.title,
        prompt: prompt || fields.goal || "",
        goal: meta.goal,
        budget: meta.budget,
        city: meta.city,
        audience: meta.audience,
        plan: data,
        createdAt: new Date().toISOString(),
      });
      router.push(`/campaigns/${id}`);
    } catch {
      setLoading(false);
    }
  }

  function togglePlatform(p: Platform) {
    setFields((f) => {
      const set = new Set(f.platforms ?? []);
      set.has(p) ? set.delete(p) : set.add(p);
      return { ...f, platforms: [...set] };
    });
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {loading && <GeneratingOverlay />}

      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs text-primary">
          <Sparkles className="size-3.5" /> Powered by 8 orchestrated AI agents
        </div>
        <h1 className="text-3xl font-bold tracking-tight">
          Describe your goal. <span className="text-gradient">Ship a plan.</span>
        </h1>
        <p className="text-muted-foreground">
          One sentence in — a complete, editable, launch-ready campaign out.
        </p>
      </div>

      <Card className="glass">
        <CardContent className="pt-6 space-y-4">
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Need 5,000 delivery executives in Mumbai before Diwali with a ₹15 lakh budget…"
            className="min-h-[110px] text-base resize-none"
            onKeyDown={(e) => {
              if ((e.metaKey || e.ctrlKey) && e.key === "Enter") generate();
            }}
          />

          <div className="flex flex-wrap gap-1.5">
            {EXAMPLES.map((ex) => (
              <button
                key={ex}
                onClick={() => setPrompt(ex)}
                className="text-[11px] rounded-full border border-border px-2.5 py-1 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors text-left"
              >
                {ex}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <button
              onClick={() => setAdvanced((a) => !a)}
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
            >
              <SlidersHorizontal className="size-3.5" />
              {advanced ? "Hide" : "Add"} structured fields
            </button>
            <Button variant="gradient" onClick={generate} disabled={loading}>
              <Wand2 className="size-4" /> Generate campaign
            </Button>
          </div>

          {advanced && (
            <div className="grid sm:grid-cols-2 gap-4 pt-2 border-t border-border">
              <div className="space-y-1.5">
                <Label>Campaign goal</Label>
                <Input
                  value={fields.goal}
                  onChange={(e) => setFields((f) => ({ ...f, goal: e.target.value }))}
                  placeholder="Acquire 5,000 delivery executives"
                />
              </div>
              <div className="space-y-1.5">
                <Label>City</Label>
                <Input
                  value={fields.city ?? ""}
                  onChange={(e) => setFields((f) => ({ ...f, city: e.target.value }))}
                  placeholder="Mumbai"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Budget (₹)</Label>
                <Input
                  type="number"
                  value={fields.budget ?? ""}
                  onChange={(e) => setFields((f) => ({ ...f, budget: Number(e.target.value) }))}
                  placeholder="1500000"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Timeline</Label>
                <Input
                  value={fields.timeline ?? ""}
                  onChange={(e) => setFields((f) => ({ ...f, timeline: e.target.value }))}
                  placeholder="Before Diwali (6 weeks)"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Audience</Label>
                <Input
                  value={fields.audience ?? ""}
                  onChange={(e) => setFields((f) => ({ ...f, audience: e.target.value }))}
                  placeholder="Gig workers, 18-35"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Primary language</Label>
                <Input
                  value={fields.language ?? ""}
                  onChange={(e) => setFields((f) => ({ ...f, language: e.target.value }))}
                  placeholder="Hindi + Marathi"
                />
              </div>
              <div className="sm:col-span-2 space-y-1.5">
                <Label>Platforms</Label>
                <div className="flex flex-wrap gap-1.5">
                  {PLATFORMS.map((p) => {
                    const on = fields.platforms?.includes(p);
                    return (
                      <button
                        key={p}
                        onClick={() => togglePlatform(p)}
                        className={
                          "text-xs rounded-full border px-3 py-1 transition-colors " +
                          (on
                            ? "border-primary bg-primary/15 text-primary"
                            : "border-border text-muted-foreground hover:text-foreground")
                        }
                      >
                        {p}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="sm:col-span-2 space-y-1.5">
                <Label>Special instructions</Label>
                <Textarea
                  value={fields.instructions ?? ""}
                  onChange={(e) => setFields((f) => ({ ...f, instructions: e.target.value }))}
                  placeholder="Emphasise weekly payouts; avoid income guarantees."
                  className="min-h-[60px]"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

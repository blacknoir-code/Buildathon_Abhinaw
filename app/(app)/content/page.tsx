"use client";

import { useState } from "react";
import {
  Facebook, Search, MessageCircle, Smartphone, Mail, Bell,
  LayoutTemplate, Clapperboard, Loader2, Sparkles, Copy, Check,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";
import { addHistory } from "@/lib/store";
import { copyToClipboard } from "@/lib/export";
import type { ContentBlock, ContentChannel } from "@/types";

const CHANNELS: { key: ContentChannel; label: string; icon: React.ElementType }[] = [
  { key: "meta_ad", label: "Meta Ad", icon: Facebook },
  { key: "google_ad", label: "Google Ad", icon: Search },
  { key: "whatsapp", label: "WhatsApp", icon: MessageCircle },
  { key: "sms", label: "SMS", icon: Smartphone },
  { key: "email", label: "Email", icon: Mail },
  { key: "push", label: "Push", icon: Bell },
  { key: "landing", label: "Landing Page", icon: LayoutTemplate },
  { key: "video_script", label: "Video Script", icon: Clapperboard },
];

const LANGUAGES = ["English", "Hindi", "Marathi", "Tamil", "Telugu", "Bengali", "Gujarati", "Kannada"];

export default function ContentPage() {
  const [selected, setSelected] = useState<ContentChannel[]>(["meta_ad", "whatsapp", "sms"]);
  const [context, setContext] = useState("");
  const [language, setLanguage] = useState("English");
  const [loading, setLoading] = useState(false);
  const [blocks, setBlocks] = useState<ContentBlock[]>([]);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  function toggle(key: ContentChannel) {
    setSelected((s) => (s.includes(key) ? s.filter((k) => k !== key) : [...s, key]));
  }

  async function generate() {
    if (selected.length === 0) return;
    setLoading(true);
    try {
      const { data } = await api.generateContent({
        channels: selected,
        context: context || "Gig-hiring acquisition campaign, weekly payouts, flexible hours.",
        language,
      });
      setBlocks(data);
      addHistory({
        action: "Generated content",
        prompt: `${selected.length} channels · ${language}`,
        response: `${data.length} assets`,
      });
    } finally {
      setLoading(false);
    }
  }

  async function copy(idx: number, text: string) {
    if (await copyToClipboard(text)) {
      setCopiedIdx(idx);
      setTimeout(() => setCopiedIdx(null), 1600);
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold">Content Generator</h1>
        <p className="text-sm text-muted-foreground">
          One brief → ready-to-ship copy for every channel, in any Indian language.
        </p>
      </div>

      <Card className="glass">
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-1.5">
            <Label>Campaign context</Label>
            <Textarea
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="e.g. Hiring 5,000 delivery riders in Mumbai. Weekly payouts up to ₹40k/mo, flexible hours, onboarding in a day."
              className="min-h-[70px]"
            />
          </div>

          <div className="grid sm:grid-cols-[1fr_auto] gap-4 items-end">
            <div className="space-y-1.5">
              <Label>Channels</Label>
              <div className="flex flex-wrap gap-1.5">
                {CHANNELS.map((c) => {
                  const Icon = c.icon;
                  const on = selected.includes(c.key);
                  return (
                    <button
                      key={c.key}
                      onClick={() => toggle(c.key)}
                      className={
                        "inline-flex items-center gap-1.5 text-xs rounded-full border px-3 py-1.5 transition-colors " +
                        (on
                          ? "border-primary bg-primary/15 text-primary"
                          : "border-border text-muted-foreground hover:text-foreground")
                      }
                    >
                      <Icon className="size-3.5" /> {c.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-end gap-4">
            <div className="space-y-1.5">
              <Label>Language</Label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="h-10 rounded-lg border border-input bg-background/50 px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {LANGUAGES.map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>
            <Button variant="gradient" onClick={generate} disabled={loading || !selected.length} className="sm:ml-auto">
              {loading ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
              {loading ? "Generating…" : `Generate ${selected.length} asset${selected.length === 1 ? "" : "s"}`}
            </Button>
          </div>
        </CardContent>
      </Card>

      {blocks.length > 0 && (
        <div className="grid md:grid-cols-2 gap-4">
          {blocks.map((b, i) => {
            const meta = CHANNELS.find((c) => c.key === b.channel);
            const Icon = meta?.icon ?? Sparkles;
            return (
              <Card key={i} className="glass">
                <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Icon className="size-4 text-primary" /> {meta?.label ?? b.channel}
                  </CardTitle>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copy(i, `${b.title}\n\n${b.body}`)}
                  >
                    {copiedIdx === i ? (
                      <Check className="size-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="size-3.5" />
                    )}
                  </Button>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="font-medium text-sm">{b.title}</div>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{b.body}</p>
                  {b.meta && (
                    <Badge variant="secondary" className="mt-1">{b.meta}</Badge>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

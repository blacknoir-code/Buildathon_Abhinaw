"use client";

import { useRef, useState } from "react";
import {
  Upload, Image as ImageIcon, Loader2, Sparkles, Copy, Check,
  Wand2, Type, MousePointerClick, Images,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { api } from "@/lib/api";
import { saveCreative } from "@/lib/store";
import { copyToClipboard } from "@/lib/export";
import { cn, nanoId } from "@/lib/utils";
import type { CreativeAnalysis } from "@/types";

function scoreColor(score: number) {
  if (score >= 75) return "bg-emerald-500";
  if (score >= 60) return "bg-amber-500";
  return "bg-red-500";
}

export default function CreativeStudioPage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<CreativeAnalysis | null>(null);
  const [mode, setMode] = useState<"live" | "demo" | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  function onFile(file: File) {
    setName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      setDataUrl(reader.result as string);
      setAnalysis(null);
    };
    reader.readAsDataURL(file);
  }

  async function analyse() {
    setLoading(true);
    try {
      const { data, meta } = await api.analyzeCreative({
        dataUrl: dataUrl ?? undefined,
        name: name || "creative",
      });
      setAnalysis(data);
      setMode(meta.mode);
      saveCreative({
        id: nanoId("cr_"),
        type: "poster",
        name: name || "Untitled creative",
        dataUrl: dataUrl ?? undefined,
        analysis: data,
        createdAt: new Date().toISOString(),
      });
    } finally {
      setLoading(false);
    }
  }

  async function copy(key: string, text: string) {
    if (await copyToClipboard(text)) {
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 1600);
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold">Creative Studio</h1>
        <p className="text-sm text-muted-foreground">
          Upload an asset — the Creative Agent scores it like a conversion expert and rewrites it to perform.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        {/* Upload */}
        <Card className="glass">
          <CardContent className="pt-6">
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])}
            />
            <div
              onClick={() => inputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                e.dataTransfer.files?.[0] && onFile(e.dataTransfer.files[0]);
              }}
              className="cursor-pointer rounded-xl border-2 border-dashed border-border hover:border-primary/50 transition-colors grid place-items-center min-h-[280px] overflow-hidden"
            >
              {dataUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={dataUrl} alt={name} className="max-h-[280px] w-auto object-contain" />
              ) : (
                <div className="text-center p-8">
                  <div className="grid place-items-center size-12 rounded-2xl bg-primary/10 mx-auto mb-3">
                    <Upload className="size-6 text-primary" />
                  </div>
                  <p className="text-sm font-medium">Drop a poster, banner, or ad</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    PNG, JPG or WebP — or click to browse
                  </p>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 mt-4">
              <Button variant="outline" onClick={() => inputRef.current?.click()} className="flex-1">
                <ImageIcon className="size-4" /> {dataUrl ? "Replace" : "Choose file"}
              </Button>
              <Button variant="gradient" onClick={analyse} disabled={loading} className="flex-1">
                {loading ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
                {loading ? "Analysing…" : "Analyse"}
              </Button>
            </div>
            <p className="text-[11px] text-muted-foreground mt-2 text-center">
              No image? Analyse anyway — the agent reviews a typical gig-hiring poster.
            </p>
          </CardContent>
        </Card>

        {/* Scores */}
        <Card className="glass">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm">Analysis</CardTitle>
            {mode && (
              <Badge variant={mode === "live" ? "success" : "warning"}>
                {mode === "live" ? "Claude Vision" : "Demo"}
              </Badge>
            )}
          </CardHeader>
          <CardContent>
            {!analysis ? (
              <div className="grid place-items-center text-center py-16 text-sm text-muted-foreground">
                <ImageIcon className="size-8 mb-2 opacity-50" />
                Upload and analyse to see the scorecard.
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg border border-border p-3 text-center">
                    <div className="text-3xl font-bold text-gradient">{analysis.overall}</div>
                    <div className="text-xs text-muted-foreground">Overall / 100</div>
                  </div>
                  <div className="rounded-lg border border-border p-3 text-center">
                    <div className="text-3xl font-bold text-gradient">{analysis.predictedCtr}%</div>
                    <div className="text-xs text-muted-foreground">Predicted CTR</div>
                  </div>
                </div>
                <div className="space-y-2.5">
                  {analysis.scores.map((s) => (
                    <div key={s.label}>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-medium">{s.label}</span>
                        <span className="text-muted-foreground">{s.score}</span>
                      </div>
                      <Progress value={s.score} indicatorClassName={scoreColor(s.score)} />
                      <p className="text-[11px] text-muted-foreground mt-1">{s.verdict}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Improvements */}
      {analysis && (
        <div className="grid lg:grid-cols-3 gap-5">
          <Card className="glass">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Type className="size-4 text-primary" /> Improved copy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm">{analysis.improvedCopy}</p>
              <ImproveActions
                items={[
                  { key: "copy", label: "Copy text", icon: MousePointerClick, value: analysis.improvedCopy },
                ]}
                copiedKey={copiedKey}
                onCopy={copy}
              />
            </CardContent>
          </Card>

          <Card className="glass">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <MousePointerClick className="size-4 text-primary" /> Stronger CTA
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="inline-flex rounded-lg bg-gradient-to-r from-primary to-fuchsia-500 px-4 py-2 text-sm font-medium text-white">
                {analysis.improvedCta}
              </div>
              <ImproveActions
                items={[{ key: "cta", label: "Copy CTA", icon: Copy, value: analysis.improvedCta }]}
                copiedKey={copiedKey}
                onCopy={copy}
              />
            </CardContent>
          </Card>

          <Card className="glass">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Wand2 className="size-4 text-primary" /> Image prompt for a variant
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">{analysis.imagePrompt}</p>
              <ImproveActions
                items={[{ key: "img", label: "Copy prompt", icon: Images, value: analysis.imagePrompt }]}
                copiedKey={copiedKey}
                onCopy={copy}
              />
            </CardContent>
          </Card>

          <Card className="glass lg:col-span-3">
            <CardContent className="pt-6 grid sm:grid-cols-2 gap-4">
              <div>
                <div className="text-xs font-medium text-emerald-400 mb-2">Strengths</div>
                <ul className="space-y-1.5">
                  {analysis.strengths.map((s, i) => (
                    <li key={i} className="text-sm flex gap-2">
                      <Check className="size-4 text-emerald-400 shrink-0 mt-0.5" /> {s}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="text-xs font-medium text-amber-400 mb-2">Issues to fix</div>
                <ul className="space-y-1.5">
                  {analysis.issues.map((s, i) => (
                    <li key={i} className="text-sm flex gap-2">
                      <span className="text-amber-400 shrink-0">!</span> {s}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

function ImproveActions({
  items, copiedKey, onCopy,
}: {
  items: { key: string; label: string; icon: React.ElementType; value: string }[];
  copiedKey: string | null;
  onCopy: (key: string, text: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((it) => {
        const Icon = it.icon;
        return (
          <Button
            key={it.key}
            size="sm"
            variant="outline"
            onClick={() => onCopy(it.key, it.value)}
          >
            {copiedKey === it.key ? (
              <Check className="size-3.5 text-emerald-400" />
            ) : (
              <Icon className="size-3.5" />
            )}
            {copiedKey === it.key ? "Copied" : it.label}
          </Button>
        );
      })}
    </div>
  );
}

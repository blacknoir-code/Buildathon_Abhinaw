"use client";

import { useEffect, useState } from "react";
import { Check, Loader2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
  "Campaign Agent — drafting brief & objectives",
  "Campaign Agent — building audience personas",
  "Campaign Agent — allocating budget across channels",
  "Risk Agent — pressure-testing the plan",
  "Reviewer Agent — quality-gating output",
  "Finalising workspace artifacts",
];

export function GeneratingOverlay() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setStep((s) => (s < STEPS.length - 1 ? s + 1 : s));
    }, 900);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-background/80 backdrop-blur-sm p-4">
      <div className="glass-strong rounded-2xl border border-border p-6 w-full max-w-md">
        <div className="flex items-center gap-2 mb-5">
          <div className="grid place-items-center size-9 rounded-xl bg-gradient-to-br from-primary to-fuchsia-500">
            <Sparkles className="size-5 text-white animate-pulse" />
          </div>
          <div>
            <div className="font-semibold text-sm">Orchestrating agents…</div>
            <div className="text-[11px] text-muted-foreground">
              GrowthPilot AI is building your campaign
            </div>
          </div>
        </div>
        <ol className="space-y-2.5">
          {STEPS.map((label, i) => (
            <li
              key={i}
              className={cn(
                "flex items-center gap-2.5 text-sm transition-opacity",
                i > step && "opacity-40",
              )}
            >
              <span className="grid place-items-center size-5 shrink-0">
                {i < step ? (
                  <Check className="size-4 text-emerald-400" />
                ) : i === step ? (
                  <Loader2 className="size-4 animate-spin text-primary" />
                ) : (
                  <span className="size-1.5 rounded-full bg-muted-foreground/40" />
                )}
              </span>
              <span className={i <= step ? "text-foreground" : "text-muted-foreground"}>
                {label}
              </span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

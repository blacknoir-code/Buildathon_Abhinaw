import { Check, Circle, Dot } from "lucide-react";
import type { TimelinePhase } from "@/types";
import { cn } from "@/lib/utils";

export function Timeline({ phases }: { phases: TimelinePhase[] }) {
  return (
    <ol className="relative">
      {phases.map((phase, i) => {
        const last = i === phases.length - 1;
        return (
          <li key={i} className="relative flex gap-4 pb-6 last:pb-0">
            {!last && (
              <span className="absolute left-[15px] top-8 bottom-0 w-px bg-border" />
            )}
            <span
              className={cn(
                "relative z-10 grid place-items-center size-8 rounded-full border shrink-0",
                phase.status === "done"
                  ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-400"
                  : phase.status === "active"
                    ? "bg-primary/15 border-primary/50 text-primary"
                    : "bg-muted border-border text-muted-foreground",
              )}
            >
              {phase.status === "done" ? (
                <Check className="size-4" />
              ) : phase.status === "active" ? (
                <Circle className="size-3 fill-current" />
              ) : (
                <Dot className="size-5" />
              )}
            </span>
            <div className="pt-0.5">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">{phase.phase}</span>
                <span className="text-[11px] text-muted-foreground">
                  {phase.window}
                </span>
                {phase.status === "active" && (
                  <span className="text-[10px] font-medium text-primary bg-primary/10 rounded-full px-2 py-0.5">
                    Now
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">
                {phase.focus}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

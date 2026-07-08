"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Rocket, Sparkles } from "lucide-react";
import { NAV } from "@/lib/nav";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex md:w-64 flex-col border-r border-border glass shrink-0">
      <div className="flex items-center gap-2.5 px-5 h-16 border-b border-border">
        <div className="grid place-items-center size-9 rounded-xl bg-gradient-to-br from-primary to-fuchsia-500 shadow-lg shadow-primary/30">
          <Rocket className="size-5 text-white" />
        </div>
        <div className="leading-tight">
          <div className="font-semibold text-sm">GrowthPilot AI</div>
          <div className="text-[11px] text-muted-foreground">
            Campaign Workspace
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-thin">
        {NAV.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-primary/15 text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground",
              )}
            >
              <Icon className="size-[18px] shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-border">
        <div className="rounded-xl bg-gradient-to-br from-primary/10 to-fuchsia-500/10 border border-primary/20 p-3">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="size-4 text-primary" />
            <span className="text-xs font-semibold">8 AI agents active</span>
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Campaign, Creative, Content, Reviewer, Risk, Analytics, Translator &
            Copilot — orchestrated.
          </p>
        </div>
      </div>
    </aside>
  );
}

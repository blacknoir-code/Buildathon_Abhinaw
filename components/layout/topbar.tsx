"use client";

import Link from "next/link";
import { useTheme } from "next-themes";
import { Moon, Sun, Plus, Sparkles, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ModeBadge } from "@/components/layout/mode-badge";

export function Topbar({
  title,
  onToggleCopilot,
}: {
  title: string;
  onToggleCopilot: () => void;
}) {
  const { theme, setTheme } = useTheme();

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 md:px-6 border-b border-border glass">
      <div className="flex items-center gap-3 min-w-0">
        <h1 className="text-base md:text-lg font-semibold truncate">{title}</h1>
        <ModeBadge />
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => window.dispatchEvent(new Event("gp:open-palette"))}
          className="hidden md:flex items-center gap-2 h-9 rounded-lg border border-border bg-background/40 px-3 text-xs text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors"
        >
          <Search className="size-3.5" />
          <span>Search…</span>
          <kbd className="ml-4 text-[10px] border border-border rounded px-1.5 py-0.5">⌘K</kbd>
        </button>
        <Button asChild size="sm" variant="gradient" className="hidden sm:inline-flex">
          <Link href="/campaigns/new">
            <Plus className="size-4" /> New campaign
          </Link>
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={onToggleCopilot}
          className="gap-1.5"
        >
          <Sparkles className="size-4 text-primary" />
          <span className="hidden sm:inline">Copilot</span>
        </Button>
        <Button
          size="icon"
          variant="ghost"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          aria-label="Toggle theme"
        >
          <Sun className="size-[18px] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute size-[18px] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </Button>
      </div>
    </header>
  );
}

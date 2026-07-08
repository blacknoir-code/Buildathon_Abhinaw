"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, CornerDownLeft } from "lucide-react";
import { NAV } from "@/lib/nav";
import { getCampaigns } from "@/lib/store";
import { useStore } from "@/hooks/use-store";
import { cn } from "@/lib/utils";
import { Megaphone, Plus } from "lucide-react";

interface Cmd {
  id: string;
  label: string;
  hint?: string;
  icon: React.ElementType;
  run: () => void;
}

export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const campaigns = useStore(getCampaigns);

  // Global ⌘K / Ctrl-K toggle.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === "Escape") setOpen(false);
    };
    const onOpen = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener("gp:open-palette", onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("gp:open-palette", onOpen);
    };
  }, []);

  useEffect(() => {
    if (open) {
      setQuery("");
      setActive(0);
      setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [open]);

  const commands = useMemo<Cmd[]>(() => {
    const go = (href: string) => () => {
      router.push(href);
      setOpen(false);
    };
    const base: Cmd[] = [
      { id: "new", label: "New campaign", hint: "Create", icon: Plus, run: go("/campaigns/new") },
      ...NAV.map((n) => ({
        id: n.href, label: `Go to ${n.label}`, hint: "Navigate", icon: n.icon, run: go(n.href),
      })),
      ...campaigns.map((c) => ({
        id: c.id, label: c.plan.title, hint: "Campaign", icon: Megaphone, run: go(`/campaigns/${c.id}`),
      })),
    ];
    return base;
  }, [campaigns, router]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return commands;
    return commands.filter((c) => c.label.toLowerCase().includes(q));
  }, [commands, query]);

  useEffect(() => setActive(0), [query]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-start justify-center pt-[15vh] bg-background/70 backdrop-blur-sm print:hidden"
      onClick={() => setOpen(false)}
    >
      <div
        className="w-full max-w-lg glass-strong rounded-2xl border border-border shadow-2xl overflow-hidden animate-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 px-4 border-b border-border">
          <Search className="size-4 text-muted-foreground shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.min(a + 1, filtered.length - 1)); }
              if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
              if (e.key === "Enter") { e.preventDefault(); filtered[active]?.run(); }
            }}
            placeholder="Search actions and campaigns…"
            className="flex-1 h-12 bg-transparent text-sm focus:outline-none"
          />
          <kbd className="text-[10px] text-muted-foreground border border-border rounded px-1.5 py-0.5">ESC</kbd>
        </div>
        <div className="max-h-80 overflow-y-auto scrollbar-thin p-2">
          {filtered.length === 0 ? (
            <div className="text-center text-sm text-muted-foreground py-8">No matches</div>
          ) : (
            filtered.map((c, i) => {
              const Icon = c.icon;
              return (
                <button
                  key={c.id}
                  onMouseEnter={() => setActive(i)}
                  onClick={() => c.run()}
                  className={cn(
                    "w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-left transition-colors",
                    i === active ? "bg-primary/15 text-primary" : "text-foreground hover:bg-accent",
                  )}
                >
                  <Icon className="size-4 shrink-0 opacity-80" />
                  <span className="flex-1 truncate">{c.label}</span>
                  {c.hint && <span className="text-[10px] text-muted-foreground">{c.hint}</span>}
                  {i === active && <CornerDownLeft className="size-3.5 text-muted-foreground" />}
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

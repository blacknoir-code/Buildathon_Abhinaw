"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { Copilot } from "@/components/copilot/copilot";
import { CommandPalette } from "@/components/command-palette";
import { NAV } from "@/lib/nav";

function titleFor(pathname: string): string {
  if (pathname.startsWith("/campaigns/new")) return "New Campaign";
  if (pathname.startsWith("/campaigns/")) return "Campaign";
  const match = NAV.find(
    (n) => pathname === n.href || pathname.startsWith(n.href + "/"),
  );
  return match?.label ?? "GrowthPilot AI";
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [copilotOpen, setCopilotOpen] = useState(false);

  return (
    <div className="flex h-dvh overflow-hidden aurora">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar
          title={titleFor(pathname)}
          onToggleCopilot={() => setCopilotOpen((o) => !o)}
        />
        <main className="flex-1 overflow-y-auto scrollbar-thin">
          <div className="mx-auto max-w-7xl p-4 md:p-8 animate-in">{children}</div>
        </main>
      </div>
      <Copilot open={copilotOpen} onClose={() => setCopilotOpen(false)} />
      <CommandPalette />
    </div>
  );
}

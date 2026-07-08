"use client";

import { Zap, FlaskConical, Database, Cpu, Trash2, Check, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useStatus } from "@/hooks/use-status";
import { AGENTS } from "@/prompts";

export default function SettingsPage() {
  const status = useStatus();

  function clearWorkspace() {
    ["gp.campaigns", "gp.creatives", "gp.history"].forEach((k) =>
      window.localStorage.removeItem(k),
    );
    window.dispatchEvent(new Event("gp:store"));
    window.location.reload();
  }

  return (
    <div className="space-y-5 max-w-3xl">
      <div>
        <h1 className="text-xl font-semibold">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Workspace configuration and connected services.
        </p>
      </div>

      {/* Service status */}
      <div className="grid sm:grid-cols-2 gap-4">
        <Card className="glass">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Cpu className="size-4 text-primary" /> AI Layer (Claude)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {status?.live ? (
              <div className="space-y-1">
                <Badge variant="success" className="gap-1.5">
                  <Zap className="size-3" /> Live
                </Badge>
                <p className="text-xs text-muted-foreground">
                  Model: <code className="text-foreground">{status.model}</code>
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                <Badge variant="warning" className="gap-1.5">
                  <FlaskConical className="size-3" /> Demo mode
                </Badge>
                <p className="text-xs text-muted-foreground">
                  Set <code>ANTHROPIC_API_KEY</code> to enable live generation.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Database className="size-4 text-primary" /> Database (Supabase)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant={status?.supabase ? "success" : "secondary"} className="gap-1.5">
              {status?.supabase ? <Check className="size-3" /> : <X className="size-3" />}
              {status?.supabase ? "Connected" : "Local storage"}
            </Badge>
            <p className="text-xs text-muted-foreground mt-1">
              {status?.supabase
                ? "Persisting to Postgres + Storage."
                : "Data lives in this browser. Add Supabase keys to sync."}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Agents */}
      <Card className="glass">
        <CardHeader>
          <CardTitle className="text-sm">AI Orchestrator · {AGENTS.length} agents</CardTitle>
        </CardHeader>
        <CardContent className="grid sm:grid-cols-2 gap-2">
          {AGENTS.map((a) => (
            <div key={a.key} className="flex items-center gap-3 rounded-lg border border-border p-3">
              <div className="size-2 rounded-full bg-emerald-400 shrink-0" />
              <div className="min-w-0">
                <div className="text-sm font-medium truncate">{a.name}</div>
                <div className="text-xs text-muted-foreground truncate">{a.role}</div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Roadmap */}
      <Card className="glass">
        <CardHeader>
          <CardTitle className="text-sm">Integrations roadmap</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {["Jira", "Slack", "Google Sheets", "Meta Ads API", "WhatsApp Business", "Google Analytics"].map((i) => (
            <Badge key={i} variant="outline">{i}</Badge>
          ))}
        </CardContent>
      </Card>

      {/* Danger zone */}
      <Card className="glass border-destructive/30">
        <CardHeader>
          <CardTitle className="text-sm text-destructive">Danger zone</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            Clear all campaigns, creatives, and history from this browser.
          </p>
          <Button variant="destructive" size="sm" onClick={clearWorkspace}>
            <Trash2 className="size-4" /> Clear workspace
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

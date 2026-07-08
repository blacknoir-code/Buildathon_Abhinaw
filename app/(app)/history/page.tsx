"use client";

import { History as HistoryIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useStore } from "@/hooks/use-store";
import { getHistory } from "@/lib/store";
import { relativeTime } from "@/lib/utils";

export default function HistoryPage() {
  const history = useStore(getHistory);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold">History</h1>
        <p className="text-sm text-muted-foreground">
          Every AI action across your workspace, most recent first.
        </p>
      </div>

      {history.length === 0 ? (
        <Card className="glass">
          <CardContent className="grid place-items-center text-center py-16">
            <HistoryIcon className="size-8 text-muted-foreground mb-2 opacity-50" />
            <p className="text-sm text-muted-foreground">
              Nothing yet. Generate a campaign, analyse a creative, or chat with the Copilot.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="glass">
          <CardContent className="pt-6 divide-y divide-border">
            {history.map((h) => (
              <div key={h.id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                <Badge variant="secondary" className="shrink-0 mt-0.5">{h.action}</Badge>
                <div className="min-w-0 flex-1">
                  <div className="text-sm truncate">{h.prompt}</div>
                  <div className="text-xs text-muted-foreground truncate">{h.response}</div>
                </div>
                <span className="text-xs text-muted-foreground shrink-0">
                  {relativeTime(h.timestamp)}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

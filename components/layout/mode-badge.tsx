"use client";

import { Zap, FlaskConical } from "lucide-react";
import { useStatus } from "@/hooks/use-status";
import { Badge } from "@/components/ui/badge";

export function ModeBadge() {
  const status = useStatus();
  if (!status) return null;

  return status.live ? (
    <Badge variant="success" className="gap-1.5">
      <Zap className="size-3" />
      Live · {status.model?.replace("claude-", "") ?? "Claude"}
    </Badge>
  ) : (
    <Badge variant="warning" className="gap-1.5">
      <FlaskConical className="size-3" />
      Demo mode
    </Badge>
  );
}

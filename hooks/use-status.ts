"use client";

import { useEffect, useState } from "react";

export interface AppStatus {
  live: boolean;
  model: string | null;
  supabase: boolean;
}

export function useStatus(): AppStatus | null {
  const [status, setStatus] = useState<AppStatus | null>(null);
  useEffect(() => {
    let active = true;
    fetch("/api/status")
      .then((r) => r.json())
      .then((s) => active && setStatus(s))
      .catch(() => active && setStatus({ live: false, model: null, supabase: false }));
    return () => {
      active = false;
    };
  }, []);
  return status;
}

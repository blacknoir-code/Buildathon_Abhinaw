"use client";

import { useEffect, useState } from "react";
import { subscribe } from "@/lib/store";

/**
 * Subscribe a component to the client workspace store. Pass a
 * selector that reads from lib/store; it re-runs on every mutation
 * and on cross-tab storage events.
 */
export function useStore<T>(selector: () => T): T {
  const [value, setValue] = useState<T>(selector);

  useEffect(() => {
    const update = () => setValue(selector());
    update();
    const unsub = subscribe(update);
    window.addEventListener("storage", update);
    return () => {
      unsub();
      window.removeEventListener("storage", update);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return value;
}

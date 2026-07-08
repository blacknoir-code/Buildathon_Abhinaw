"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Animate a number from 0 to `end` once, on mount. Returns the current
 * value. Respects prefers-reduced-motion by snapping to the end.
 */
export function useCountUp(end: number, durationMs = 900): number {
  const [value, setValue] = useState(0);
  const raf = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
    ) {
      setValue(end);
      return;
    }
    let startTs: number | null = null;
    const tick = (ts: number) => {
      if (startTs === null) startTs = ts;
      const p = Math.min(1, (ts - startTs) / durationMs);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(end * eased);
      if (p < 1) raf.current = requestAnimationFrame(tick);
      else setValue(end);
    };
    raf.current = requestAnimationFrame(tick);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [end, durationMs]);

  return value;
}

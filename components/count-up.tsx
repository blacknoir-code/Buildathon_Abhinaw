"use client";

import { useCountUp } from "@/hooks/use-count-up";

export function CountUp({
  value,
  format = (n) => Math.round(n).toString(),
}: {
  value: number;
  format?: (n: number) => string;
}) {
  const v = useCountUp(value);
  return <span className="tabular-nums">{format(v)}</span>;
}

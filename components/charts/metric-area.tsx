"use client";

import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import type { MetricPoint } from "@/types";

export function MetricArea({
  data, color, prefix = "", suffix = "",
}: {
  data: MetricPoint[];
  color: string;
  prefix?: string;
  suffix?: string;
}) {
  const id = `grad-${color.replace("#", "")}`;
  return (
    <div className="h-40 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
          <defs>
            <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.4} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(240 5% 18%)" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10, fill: "hsl(240 5% 55%)" }}
            tickFormatter={(d: string) => d.slice(5)}
            interval="preserveStartEnd"
            minTickGap={24}
            axisLine={false}
            tickLine={false}
          />
          <YAxis tick={{ fontSize: 10, fill: "hsl(240 5% 55%)" }} axisLine={false} tickLine={false} width={40} />
          <Tooltip
            contentStyle={{
              background: "hsl(240 8% 8%)",
              border: "1px solid hsl(240 5% 15%)",
              borderRadius: 12,
              fontSize: 12,
            }}
            formatter={(v: number) => [`${prefix}${v}${suffix}`, ""]}
          />
          <Area type="monotone" dataKey="value" stroke={color} strokeWidth={2} fill={`url(#${id})`} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

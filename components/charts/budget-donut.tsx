"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import type { BudgetSplit } from "@/types";
import { formatCurrencyINR } from "@/lib/utils";

const COLORS = ["#7C3AED", "#A855F7", "#D946EF", "#22D3EE", "#34D399"];

export function BudgetDonut({ data }: { data: BudgetSplit[] }) {
  return (
    <div className="flex flex-col sm:flex-row items-center gap-4">
      <div className="h-48 w-48 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="amount"
              nameKey="channel"
              innerRadius={52}
              outerRadius={80}
              paddingAngle={2}
              stroke="none"
            >
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: "hsl(240 8% 8%)",
                border: "1px solid hsl(240 5% 15%)",
                borderRadius: 12,
                fontSize: 12,
              }}
              formatter={(v: number, n: string) => [formatCurrencyINR(v), n]}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ul className="flex-1 space-y-2 w-full">
        {data.map((b, i) => (
          <li key={i} className="flex items-center gap-2 text-sm">
            <span
              className="size-2.5 rounded-full shrink-0"
              style={{ background: COLORS[i % COLORS.length] }}
            />
            <span className="flex-1 truncate">{b.channel}</span>
            <span className="text-muted-foreground">{b.percent}%</span>
            <span className="font-medium tabular-nums w-20 text-right">
              {formatCurrencyINR(b.amount)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

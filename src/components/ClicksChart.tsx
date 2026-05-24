"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { DayBucket } from "@/lib/stats";

function formatDay(value: string): string {
  const date = new Date(`${value}T00:00:00Z`);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
}

export function ClicksChart({ data }: { data: DayBucket[] }) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
          <defs>
            <linearGradient id="clicksFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity={0.5} />
              <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
          <XAxis
            dataKey="date"
            tickFormatter={formatDay}
            stroke="#525252"
            tick={{ fontSize: 12 }}
            tickLine={false}
            minTickGap={24}
          />
          <YAxis
            allowDecimals={false}
            stroke="#525252"
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            width={32}
          />
          <Tooltip
            cursor={{ stroke: "#404040" }}
            labelFormatter={(value) => formatDay(String(value))}
            contentStyle={{
              backgroundColor: "#171717",
              border: "1px solid #404040",
              borderRadius: 8,
              fontSize: 13,
            }}
            labelStyle={{ color: "#a3a3a3" }}
            itemStyle={{ color: "#10b981" }}
          />
          <Area
            type="monotone"
            dataKey="clicks"
            stroke="#10b981"
            strokeWidth={2}
            fill="url(#clicksFill)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

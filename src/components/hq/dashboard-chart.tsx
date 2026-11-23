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
import type { DashboardGranularity, TimeseriesPoint } from "@/lib/api/hq-types";
import { formatPeriodLabel } from "@/lib/hq/dashboard-params";
import { formatMoney } from "@/lib/format/money";

export function DashboardChart({
  points,
  granularity,
}: {
  points: TimeseriesPoint[];
  granularity: DashboardGranularity;
}) {
  const data = points.map((p) => ({
    ...p,
    label: formatPeriodLabel(p.periodStart, granularity),
    grossDollars: p.grossCents / 100,
  }));

  if (data.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-fg-muted">
        No periods in this range.
      </p>
    );
  }

  return (
    <div
      className="h-80 w-full rounded-card bg-gradient-to-b from-brand-50/70 to-surface px-1 pt-2"
      role="img"
      aria-hidden="true"
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 16, right: 16, left: 4, bottom: 4 }}>
          <defs>
            <linearGradient id="hqGrossFill" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="0%"
                stopColor="var(--color-brand-600)"
                stopOpacity={0.38}
              />
              <stop
                offset="55%"
                stopColor="var(--color-brand-500)"
                stopOpacity={0.12}
              />
              <stop
                offset="100%"
                stopColor="var(--color-brand-500)"
                stopOpacity={0}
              />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="4 8"
            stroke="var(--color-subtle)"
            vertical={false}
          />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: "var(--color-fg-muted)", fontWeight: 600 }}
            tickLine={false}
            axisLine={{ stroke: "var(--color-subtle)" }}
            interval="preserveStartEnd"
            minTickGap={28}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "var(--color-fg-muted)" }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v: number) =>
              new Intl.NumberFormat("en-AU", {
                style: "currency",
                currency: "AUD",
                notation: "compact",
                maximumFractionDigits: 1,
              }).format(v)
            }
            width={58}
          />
          <Tooltip
            formatter={(value) => [
              formatMoney(Math.round(Number(value) * 100), "AUD"),
              "Gross",
            ]}
            labelFormatter={(label) => String(label)}
            contentStyle={{
              borderRadius: "0.75rem",
              border: "1px solid var(--color-subtle)",
              fontSize: "0.8125rem",
              background: "var(--color-surface)",
              boxShadow: "var(--shadow-lg)",
              padding: "0.65rem 0.85rem",
            }}
          />
          <Area
            type="monotone"
            dataKey="grossDollars"
            name="Gross"
            stroke="var(--color-brand-700)"
            strokeWidth={2.75}
            fill="url(#hqGrossFill)"
            activeDot={{
              r: 5,
              strokeWidth: 2,
              fill: "var(--color-brand-600)",
              stroke: "var(--color-surface)",
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

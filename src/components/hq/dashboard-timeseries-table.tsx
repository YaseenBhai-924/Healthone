import type { DashboardGranularity, TimeseriesPoint } from "@/lib/api/hq-types";
import { formatPeriodLabel } from "@/lib/hq/dashboard-params";
import { formatMoney } from "@/lib/format/money";

export function DashboardTimeseriesTable({
  points,
  granularity,
}: {
  points: TimeseriesPoint[];
  granularity: DashboardGranularity;
}) {
  if (points.length === 0) {
    return (
      <p className="text-sm text-fg-muted">No rows for this range.</p>
    );
  }

  return (
    <div className="overflow-hidden rounded-card border border-subtle">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[36rem] text-left text-sm">
          <caption className="sr-only">
            Orders and amounts by {granularity.toLowerCase()} for the selected
            range. Alternative to the chart.
          </caption>
          <thead>
            <tr className="border-b border-subtle bg-brand-50">
              {[
                "Period",
                "Orders",
                "Gross",
                "Refunded",
                "Net",
                "Avg order",
              ].map((label) => (
                <th
                  key={label}
                  className="px-3.5 py-3 text-xs font-bold uppercase tracking-[0.06em] text-brand-800"
                >
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {points.map((p, i) => (
              <tr
                key={p.periodStart}
                className={
                  i % 2 === 0
                    ? "border-b border-subtle bg-surface last:border-0"
                    : "border-b border-subtle bg-surface-muted/50 last:border-0"
                }
              >
                <td className="px-3.5 py-3 font-semibold text-heading">
                  {formatPeriodLabel(p.periodStart, granularity)}
                </td>
                <td className="px-3.5 py-3 tabular-nums text-fg-secondary">
                  {p.orders}
                </td>
                <td className="px-3.5 py-3 tabular-nums text-fg-secondary">
                  {formatMoney(p.grossCents, "AUD")}
                </td>
                <td className="px-3.5 py-3 tabular-nums text-fg-secondary">
                  {formatMoney(p.refundedCents, "AUD")}
                </td>
                <td className="px-3.5 py-3 tabular-nums font-bold text-brand-800">
                  {formatMoney(p.netCents, "AUD")}
                </td>
                <td className="px-3.5 py-3 tabular-nums text-fg-secondary">
                  {formatMoney(p.averageOrderCents, "AUD")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

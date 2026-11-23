import Link from "next/link";
import { CalendarRange, Filter } from "lucide-react";
import type { DashboardGranularity, PharmacyListItem } from "@/lib/api/hq-types";
import { granularityLabel } from "@/lib/hq/dashboard-params";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/button";

const PERIODS: DashboardGranularity[] = ["Day", "Week", "Month"];

function hrefFor(params: {
  granularity: DashboardGranularity;
  from?: string;
  to?: string;
  pharmacyId?: string;
}): string {
  const q = new URLSearchParams();
  if (params.granularity !== "Day") q.set("granularity", params.granularity);
  if (params.from) q.set("from", params.from);
  if (params.to) q.set("to", params.to);
  if (params.pharmacyId) q.set("pharmacyId", params.pharmacyId);
  const qs = q.toString();
  return qs ? `/hq?${qs}` : "/hq";
}

export function DashboardFilters({
  granularity,
  from,
  to,
  pharmacyId,
  pharmacies,
}: {
  granularity: DashboardGranularity;
  from?: string;
  to?: string;
  pharmacyId?: string;
  pharmacies: PharmacyListItem[];
}) {
  return (
    <div className="overflow-hidden rounded-hero border border-line bg-surface shadow-[var(--shadow-md)]">
      <div className="flex flex-col gap-3 border-b border-line bg-gradient-to-r from-brand-50 via-surface to-canvas px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-control bg-brand-100 text-brand-800 shadow-[var(--shadow-sm)]">
            <Filter className="h-4 w-4" aria-hidden />
          </span>
          <div>
            <p className="font-display text-sm font-bold text-heading">Filters</p>
            <p className="text-xs text-ink-muted">
              Period, dates, and pharmacy scope
            </p>
          </div>
        </div>

        <div
          className="inline-flex rounded-badge border border-line bg-surface p-1 shadow-[var(--shadow-sm)]"
          role="group"
          aria-label="Reporting period"
        >
          {PERIODS.map((period) => {
            const active = granularity === period;
            return (
              <Link
                key={period}
                href={hrefFor({ granularity: period, from, to, pharmacyId })}
                className={cn(
                  "focus-ring inline-flex items-center rounded-badge px-3.5 py-1.5 text-sm font-semibold transition-colors duration-150",
                  active
                    ? "bg-brand-700 text-white shadow-[var(--shadow-sm)]"
                    : "text-ink-muted hover:bg-brand-50 hover:text-brand-800",
                )}
                aria-current={active ? "true" : undefined}
              >
                {granularityLabel(period)}
              </Link>
            );
          })}
        </div>
      </div>

      <form
        method="get"
        action="/hq"
        className="grid gap-3 px-4 py-4 sm:grid-cols-2 lg:grid-cols-4 lg:items-end"
      >
        {granularity !== "Day" ? (
          <input type="hidden" name="granularity" value={granularity} />
        ) : null}

        <label className="flex flex-col gap-1.5 text-sm">
          <span className="inline-flex items-center gap-1.5 font-semibold text-ink">
            <CalendarRange className="h-3.5 w-3.5 text-brand-600" aria-hidden />
            From
          </span>
          <input
            type="date"
            name="from"
            defaultValue={from}
            className="h-10 rounded-control border border-line bg-surface px-3 text-sm text-ink transition-colors focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-600/20"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-semibold text-ink">To</span>
          <input
            type="date"
            name="to"
            defaultValue={to}
            className="h-10 rounded-control border border-line bg-surface px-3 text-sm text-ink transition-colors focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-600/20"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-semibold text-ink">Pharmacy</span>
          <select
            name="pharmacyId"
            defaultValue={pharmacyId ?? ""}
            className="h-10 rounded-control border border-line bg-surface px-3 text-sm text-ink transition-colors focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-600/20"
          >
            <option value="">All pharmacies</option>
            {pharmacies.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
                {!p.isActive ? " (inactive)" : ""}
              </option>
            ))}
          </select>
        </label>

        <div className="flex flex-wrap gap-2">
          <Button type="submit" size="sm" className="h-10 px-4">
            Apply filters
          </Button>
          <Link
            href={hrefFor({ granularity })}
            className="focus-ring inline-flex h-10 items-center rounded-control border border-line px-3 text-sm font-semibold text-ink-muted transition-colors hover:border-brand-200 hover:bg-brand-50 hover:text-brand-800"
          >
            Reset dates
          </Link>
        </div>
      </form>
    </div>
  );
}

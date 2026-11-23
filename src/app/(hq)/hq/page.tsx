/**
 * HealthOne Super Admin dashboard (task 6.2.2).
 * Network KPIs, period toggle, date/pharmacy filters, chart + accessible table.
 */
import { redirect } from "next/navigation";
import {
  Activity,
  Banknote,
  BarChart3,
  CircleDollarSign,
  LayoutDashboard,
  Receipt,
  RotateCcw,
  Shield,
  Sparkles,
} from "lucide-react";
import { requireRole } from "@/lib/auth/guards";
import {
  getDashboardSummary,
  getDashboardTimeseries,
} from "@/lib/api/hq-dashboard";
import { listPharmacies } from "@/lib/api/hq-pharmacies";
import {
  chartTitle,
  parseDateOnly,
  parseGranularity,
  parsePharmacyId,
} from "@/lib/hq/dashboard-params";
import { formatMoney } from "@/lib/format/money";
import { Alert } from "@/components/ui/alert";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardFilters } from "@/components/hq/dashboard-filters";
import { DashboardChart } from "@/components/hq/dashboard-chart";
import { DashboardTimeseriesTable } from "@/components/hq/dashboard-timeseries-table";
import { HqMetricCard } from "@/components/hq/hq-metric-card";

export default async function HqPage({
  searchParams,
}: {
  searchParams: Promise<{
    granularity?: string;
    from?: string;
    to?: string;
    pharmacyId?: string;
  }>;
}) {
  await requireRole("SuperAdmin");
  const params = await searchParams;
  const granularity = parseGranularity(params.granularity);
  const from = parseDateOnly(params.from);
  const to = parseDateOnly(params.to);
  const pharmacyId = parsePharmacyId(params.pharmacyId);

  const query = { from, to, pharmacyId, granularity };

  // Sequential: summary + timeseries both hit SQL + audit; parallel LocalDB
  // cold starts often exceed the client timeout and fail the whole page.
  const summaryResult = await getDashboardSummary(query);
  if (summaryResult.status === "forbidden") redirect("/forbidden");
  if (summaryResult.status === "unauthorized") {
    return (
      <div className="flex flex-col gap-4">
        <h1 className="font-display text-2xl font-extrabold tracking-tight text-heading">
          HQ overview
        </h1>
        <Alert variant="danger" title="Session expired">
          Your API session expired. Sign out, then sign in again.
        </Alert>
      </div>
    );
  }
  if (summaryResult.status !== "ok") {
    return (
      <div className="flex flex-col gap-4">
        <h1 className="font-display text-2xl font-extrabold tracking-tight text-heading">
          HQ overview
        </h1>
        <Alert variant="warning" title="Could not load dashboard">
          The API is still starting or busy (common after a local restart). Wait
          a few seconds and refresh this page.
        </Alert>
      </div>
    );
  }

  const [seriesResult, pharmaciesResult] = await Promise.all([
    getDashboardTimeseries(query),
    listPharmacies(),
  ]);

  if (
    seriesResult.status === "forbidden" ||
    pharmaciesResult.status === "forbidden"
  ) {
    redirect("/forbidden");
  }

  if (seriesResult.status === "unauthorized") {
    return (
      <div className="flex flex-col gap-4">
        <h1 className="font-display text-2xl font-extrabold tracking-tight text-heading">
          HQ overview
        </h1>
        <Alert variant="danger" title="Session expired">
          Your API session expired. Sign out, then sign in again.
        </Alert>
      </div>
    );
  }

  const summary = summaryResult.data;
  const series = seriesResult.status === "ok" ? seriesResult.data : [];
  const chartUnavailable = seriesResult.status !== "ok";
  const pharmacies =
    pharmaciesResult.status === "ok" ? pharmaciesResult.data : [];
  const pharmacyName = pharmacyId
    ? pharmacies.find((p) => p.id === pharmacyId)?.name
    : null;
  const activePharmacies = pharmacies.filter((p) => p.isActive).length;

  return (
    <div className="flex flex-col gap-6">
      <section
        className="relative overflow-hidden rounded-hero bg-brand-800 px-5 py-6 text-white shadow-[var(--shadow-lg)] sm:px-7 sm:py-8"
        aria-label="HQ overview"
      >
        <div
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,var(--color-brand-800)_0%,var(--color-brand-700)_55%,#2563eb_100%)]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -right-10 -top-16 h-56 w-56 rounded-full bg-sky-400/25 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-20 left-1/4 h-48 w-48 rounded-full bg-white/10 blur-3xl"
          aria-hidden
        />
        <LayoutDashboard
          className="pointer-events-none absolute -right-6 -bottom-8 h-44 w-44 rotate-[-12deg] text-white/10 sm:h-56 sm:w-56"
          strokeWidth={1}
          aria-hidden
        />

        <div className="relative z-[1] flex flex-col gap-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="max-w-2xl">
              <p className="inline-flex items-center gap-1.5 rounded-badge border border-emerald-300/50 bg-white/15 px-2.5 py-1 text-xs font-semibold text-white">
                <span
                  className="h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_0_3px_rgba(110,231,183,0.35)]"
                  aria-hidden
                />
                Super Admin · HealthOne
              </p>
              <h1 className="font-display mt-3 !text-3xl font-extrabold tracking-tight !text-white sm:!text-4xl">
                HQ overview
              </h1>
              <p className="mt-2 text-sm leading-relaxed text-white/90 sm:text-[15px]">
                Orders and amounts across{" "}
                {pharmacyName ? (
                  <span className="font-semibold text-white">{pharmacyName}</span>
                ) : (
                  "all partner pharmacies"
                )}
                . Reporting time zone: {summary.timeZone}.
              </p>
            </div>

            <div className="rounded-card border border-white/35 bg-white/12 px-4 py-3 backdrop-blur-[2px] sm:min-w-[12.5rem]">
              <p className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-white/70">
                <Shield className="h-3.5 w-3.5" aria-hidden />
                Selected range
              </p>
              <p className="mt-1.5 text-sm font-bold tabular-nums text-white">
                {summary.from} → {summary.to}
              </p>
              <p className="mt-1 text-xs text-sky-100">
                {pharmacyName ?? "All pharmacies"}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-white/20 pt-4 text-sm text-white">
            <span className="inline-flex items-center gap-2">
              <Receipt className="h-4 w-4 text-sky-200" aria-hidden />
              <span className="tabular-nums font-bold">
                {summary.orders.toLocaleString("en-AU")}
              </span>
              <span className="text-white/85">orders</span>
            </span>
            <span className="hidden h-5 w-px bg-white/30 sm:block" aria-hidden />
            <span className="inline-flex items-center gap-2">
              <Banknote className="h-4 w-4 text-emerald-300" aria-hidden />
              <span className="tabular-nums font-bold">
                {formatMoney(summary.netCents, "AUD")}
              </span>
              <span className="text-white/85">net</span>
            </span>
            <span className="hidden h-5 w-px bg-white/30 sm:block" aria-hidden />
            <span className="inline-flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-sky-200" aria-hidden />
              <span className="tabular-nums font-bold">{activePharmacies}</span>
              <span className="text-white/85">active pharmacies</span>
            </span>
          </div>
        </div>
      </section>

      {chartUnavailable ? (
        <Alert variant="warning" title="Chart still loading">
          KPI totals are shown below. Chart data timed out — refresh in a moment
          if the API was just starting.
        </Alert>
      ) : null}

      {summary.refundFailedCount > 0 ? (
        <Alert variant="warning" title="Refunds failed">
          {summary.refundFailedCount} order
          {summary.refundFailedCount === 1 ? "" : "s"} in this range show a
          failed refund. Open the pharmacy queue and retry from the order
          detail.
        </Alert>
      ) : null}

      <DashboardFilters
        granularity={granularity}
        from={from ?? summary.from}
        to={to ?? summary.to}
        pharmacyId={pharmacyId}
        pharmacies={pharmacies}
      />

      <section
        aria-label="Key metrics"
        className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5"
      >
        <HqMetricCard
          label="Orders"
          value={summary.orders.toLocaleString("en-AU")}
          hint="Submitted in range"
          icon={Receipt}
          tone="neutral"
          sparkSeed={1}
          sparkStrength={summary.orders}
        />
        <HqMetricCard
          label="Gross"
          value={formatMoney(summary.grossCents, "AUD")}
          hint="Charged"
          icon={CircleDollarSign}
          tone="brand"
          sparkSeed={2}
          sparkStrength={summary.orders}
        />
        <HqMetricCard
          label="Refunded"
          value={formatMoney(summary.refundedCents, "AUD")}
          hint="Returned"
          icon={RotateCcw}
          tone="warning"
          sparkSeed={3}
          sparkStrength={Math.max(1, summary.refundFailedCount)}
        />
        <HqMetricCard
          label="Net"
          value={formatMoney(summary.netCents, "AUD")}
          hint="After refunds"
          icon={Banknote}
          tone="success"
          sparkSeed={4}
          sparkStrength={summary.orders}
        />
        <HqMetricCard
          label="Avg order"
          value={formatMoney(summary.averageOrderCents, "AUD")}
          hint="Per order"
          icon={Activity}
          tone="info"
          sparkSeed={5}
          sparkStrength={summary.orders}
        />
      </section>

      <Card className="overflow-hidden rounded-hero border-line p-0 shadow-[var(--shadow-md)]">
        <CardHeader className="mb-0 border-b border-line bg-gradient-to-r from-brand-50/90 to-surface px-5 py-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle as="h2" className="flex items-center gap-2.5">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-control bg-brand-100 text-brand-700 shadow-[var(--shadow-sm)]">
                <BarChart3 className="h-4 w-4" aria-hidden />
              </span>
              {chartTitle(granularity)}
            </CardTitle>
            <span className="rounded-badge border border-brand-200 bg-surface px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-brand-700">
              Gross trend · table below
            </span>
          </div>
        </CardHeader>
        <CardBody className="space-y-6 px-5 py-5">
          {summary.orders === 0 ? (
            <div className="rounded-card border border-dashed border-line bg-canvas/80 px-4 py-12 text-center">
              <p className="text-sm font-semibold text-heading">
                No submitted orders in this range
              </p>
              <p className="mt-1 text-sm text-ink-muted">
                Try a wider date range or another pharmacy.
              </p>
            </div>
          ) : (
            <>
              <DashboardChart points={series} granularity={granularity} />
              <DashboardTimeseriesTable
                points={series}
                granularity={granularity}
              />
            </>
          )}
        </CardBody>
      </Card>
    </div>
  );
}

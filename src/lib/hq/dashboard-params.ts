import type {
  DashboardGranularity,
  DashboardQueryParams,
} from "@/lib/api/hq-types";

const GRANULARITIES = ["Day", "Week", "Month"] as const;

export function buildDashboardQuery(params: DashboardQueryParams): string {
  const q = new URLSearchParams();
  if (params.from) q.set("from", params.from);
  if (params.to) q.set("to", params.to);
  if (params.pharmacyId) q.set("pharmacyId", params.pharmacyId);
  if (params.granularity) q.set("granularity", params.granularity);
  const qs = q.toString();
  return qs ? `?${qs}` : "";
}

export function parseGranularity(
  value: string | null | undefined,
): DashboardGranularity {
  if (value && (GRANULARITIES as readonly string[]).includes(value)) {
    return value as DashboardGranularity;
  }
  return "Day";
}

/** yyyy-MM-dd only; rejects anything else. */
export function parseDateOnly(
  value: string | null | undefined,
): string | undefined {
  if (!value) return undefined;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined;
  return value;
}

export function parsePharmacyId(
  value: string | null | undefined,
): string | undefined {
  if (!value) return undefined;
  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      value,
    )
  ) {
    return undefined;
  }
  return value;
}

export function granularityLabel(g: DashboardGranularity): string {
  switch (g) {
    case "Day":
      return "Daily";
    case "Week":
      return "Weekly";
    case "Month":
      return "Monthly";
  }
}

export function chartTitle(g: DashboardGranularity): string {
  switch (g) {
    case "Day":
      return "Gross amount by day";
    case "Week":
      return "Gross amount by week";
    case "Month":
      return "Gross amount by month";
  }
}

export function formatPeriodLabel(
  periodStart: string,
  granularity: DashboardGranularity,
): string {
  const [y, m, d] = periodStart.split("-").map(Number);
  if (!y || !m || !d) return periodStart;
  const date = new Date(Date.UTC(y, m - 1, d));
  if (granularity === "Month") {
    return new Intl.DateTimeFormat("en-AU", {
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    }).format(date);
  }
  if (granularity === "Week") {
    return `Week of ${new Intl.DateTimeFormat("en-AU", {
      day: "numeric",
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    }).format(date)}`;
  }
  return new Intl.DateTimeFormat("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export function statusLabel(status: string): string {
  const labels: Record<string, string> = {
    Submitted: "New",
    InProgress: "In progress",
    ReadyOrDispatched: "Ready / dispatched",
    Completed: "Completed",
    Rejected: "Rejected",
    Draft: "Draft",
    PaymentPending: "Payment pending",
  };
  return labels[status] ?? status;
}

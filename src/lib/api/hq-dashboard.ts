/**
 * Server-only Super Admin dashboard API helpers (task 6.2.2).
 */
import "server-only";

import { apiFetch, type ApiResult } from "@/lib/api/server-client";
import type {
  DashboardQueryParams,
  DashboardSummary,
  TimeseriesPoint,
} from "@/lib/api/hq-types";
import { buildDashboardQuery } from "@/lib/hq/dashboard-params";

export function getDashboardSummary(
  params: DashboardQueryParams = {},
): Promise<ApiResult<DashboardSummary>> {
  return apiFetch<DashboardSummary>(
    `/api/admin/dashboard/summary${buildDashboardQuery(params)}`,
  );
}

export function getDashboardTimeseries(
  params: DashboardQueryParams = {},
): Promise<ApiResult<TimeseriesPoint[]>> {
  return apiFetch<TimeseriesPoint[]>(
    `/api/admin/dashboard/timeseries${buildDashboardQuery(params)}`,
  );
}

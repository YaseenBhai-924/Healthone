/**
 * Super Admin medicine price comparison helpers (static store).
 */
import "server-only";

import type { ApiResult } from "@/lib/api/server-client";
import type {
  PriceComparisonCommand,
  PriceComparisonItem,
} from "@/lib/api/hq-types";
import {
  createStaticComparison,
  deleteStaticComparison,
  exportComparisonsCsv,
  getStaticComparison,
  importComparisonsCsv,
  listStaticComparisons,
  updateStaticComparison,
} from "@/lib/static/store";

function toItem(
  c: ReturnType<typeof listStaticComparisons>[number],
): PriceComparisonItem {
  return {
    id: c.id,
    medicineName: c.medicineName,
    ourPriceCents: c.ourPriceCents,
    partnerPharmacyId: c.partnerPharmacyId,
    partnerPharmacyName: c.partnerPharmacyName,
    notes: c.notes,
    competitors: c.competitors,
    updatedAt: c.updatedAt,
  };
}

export function listPriceComparisons(): Promise<
  ApiResult<PriceComparisonItem[]>
> {
  return Promise.resolve({
    status: "ok",
    data: listStaticComparisons().map(toItem),
  });
}

export function getPriceComparison(
  id: string,
): Promise<ApiResult<PriceComparisonItem>> {
  const c = getStaticComparison(id);
  if (!c) return Promise.resolve({ status: "notFound" });
  return Promise.resolve({ status: "ok", data: toItem(c) });
}

export function createPriceComparison(
  body: PriceComparisonCommand,
): Promise<ApiResult<PriceComparisonItem>> {
  try {
    const created = createStaticComparison(body);
    return Promise.resolve({ status: "ok", data: toItem(created) });
  } catch (err) {
    return Promise.resolve({
      status: "invalid",
      message: err instanceof Error ? err.message : "Invalid comparison.",
    });
  }
}

export function updatePriceComparison(
  id: string,
  body: PriceComparisonCommand,
): Promise<ApiResult<PriceComparisonItem>> {
  try {
    const updated = updateStaticComparison(id, body);
    return Promise.resolve({ status: "ok", data: toItem(updated) });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid comparison.";
    if (message.includes("not found")) {
      return Promise.resolve({ status: "notFound" });
    }
    return Promise.resolve({ status: "invalid", message });
  }
}

export function deletePriceComparison(id: string): Promise<ApiResult<void>> {
  if (!deleteStaticComparison(id)) {
    return Promise.resolve({ status: "notFound" });
  }
  return Promise.resolve({ status: "ok", data: undefined });
}

export function exportPriceComparisonsCsv(): Promise<ApiResult<string>> {
  return Promise.resolve({ status: "ok", data: exportComparisonsCsv() });
}

export function importPriceComparisonsCsv(
  raw: string,
): Promise<ApiResult<{ imported: number }>> {
  const result = importComparisonsCsv(raw);
  if (result.errors.length) {
    return Promise.resolve({
      status: "invalid",
      message: result.errors.join(" "),
    });
  }
  return Promise.resolve({
    status: "ok",
    data: { imported: result.imported },
  });
}

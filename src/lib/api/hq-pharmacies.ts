/**
 * Server-only Super Admin pharmacy API helpers (tasks 6.1.1 / 6.2.3 / 6.2.4).
 * Uses the static in-memory store when STATIC_DEMO / no backend.
 */
import "server-only";

import { apiFetch, type ApiResult } from "@/lib/api/server-client";
import type { PharmacyCommand, PharmacyListItem } from "@/lib/api/hq-types";
import { isStaticDemo } from "@/lib/static/is-static-demo";
import {
  deactivateStaticPharmacy,
  getStaticPharmacy,
  listStaticPharmacies,
  upsertStaticPharmacy,
} from "@/lib/static/store";

function toListItem(
  p: ReturnType<typeof listStaticPharmacies>[number],
): PharmacyListItem {
  return {
    id: p.id,
    name: p.name,
    alertRecipients: p.alertRecipients,
    entraGroupId: p.entraGroupId,
    isActive: p.isActive,
    orders: p.orders,
    grossCents: p.grossCents,
    newRequests: p.newRequests,
    address: p.address,
  };
}

export function listPharmacies(): Promise<ApiResult<PharmacyListItem[]>> {
  if (isStaticDemo()) {
    return Promise.resolve({
      status: "ok",
      data: listStaticPharmacies().map(toListItem),
    });
  }
  return apiFetch<PharmacyListItem[]>("/api/admin/pharmacies");
}

export function getPharmacy(id: string): Promise<ApiResult<PharmacyListItem>> {
  if (isStaticDemo()) {
    const p = getStaticPharmacy(id);
    if (!p) return Promise.resolve({ status: "notFound" });
    return Promise.resolve({ status: "ok", data: toListItem(p) });
  }
  return apiFetch<PharmacyListItem>(`/api/admin/pharmacies/${id}`);
}

export function createPharmacy(
  body: PharmacyCommand,
): Promise<ApiResult<PharmacyListItem>> {
  if (isStaticDemo()) {
    try {
      const created = upsertStaticPharmacy({ ...body, id: null });
      return Promise.resolve({ status: "ok", data: toListItem(created) });
    } catch {
      return Promise.resolve({
        status: "invalid",
        message: "Could not create pharmacy.",
      });
    }
  }
  return apiFetch<PharmacyListItem>("/api/admin/pharmacies", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function updatePharmacy(
  id: string,
  body: PharmacyCommand,
): Promise<ApiResult<PharmacyListItem>> {
  if (isStaticDemo()) {
    try {
      const updated = upsertStaticPharmacy({ ...body, id });
      return Promise.resolve({ status: "ok", data: toListItem(updated) });
    } catch {
      return Promise.resolve({ status: "notFound" });
    }
  }
  return apiFetch<PharmacyListItem>(`/api/admin/pharmacies/${id}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

export function deactivatePharmacy(id: string): Promise<ApiResult<void>> {
  if (isStaticDemo()) {
    if (!deactivateStaticPharmacy(id)) {
      return Promise.resolve({ status: "notFound" });
    }
    return Promise.resolve({ status: "ok", data: undefined });
  }
  return apiFetch<void>(`/api/admin/pharmacies/${id}/deactivate`, {
    method: "POST",
  });
}

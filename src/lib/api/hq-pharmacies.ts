/**
 * Server-only Super Admin pharmacy API helpers (tasks 6.1.1 / 6.2.3 / 6.2.4).
 */
import "server-only";

import { apiFetch, type ApiResult } from "@/lib/api/server-client";
import type { PharmacyCommand, PharmacyListItem } from "@/lib/api/hq-types";

export function listPharmacies(): Promise<ApiResult<PharmacyListItem[]>> {
  return apiFetch<PharmacyListItem[]>("/api/admin/pharmacies");
}

export function getPharmacy(id: string): Promise<ApiResult<PharmacyListItem>> {
  return apiFetch<PharmacyListItem>(`/api/admin/pharmacies/${id}`);
}

export function createPharmacy(
  body: PharmacyCommand,
): Promise<ApiResult<PharmacyListItem>> {
  return apiFetch<PharmacyListItem>("/api/admin/pharmacies", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function updatePharmacy(
  id: string,
  body: PharmacyCommand,
): Promise<ApiResult<PharmacyListItem>> {
  return apiFetch<PharmacyListItem>(`/api/admin/pharmacies/${id}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

export function deactivatePharmacy(id: string): Promise<ApiResult<void>> {
  return apiFetch<void>(`/api/admin/pharmacies/${id}/deactivate`, {
    method: "POST",
  });
}

/**
 * Server-only Super Admin clinics / pricing / QR API helpers (tasks 5.3.1–5.3.3).
 */
import "server-only";

import { getAccessToken } from "@/auth";
import { getServerConfig } from "@/lib/config";
import { apiFetch, type ApiResult } from "@/lib/api/server-client";
import type {
  ClinicAdminItem,
  ClinicCommand,
  PricingItem,
  PricingItemCommand,
} from "@/lib/api/hq-types";

export function listClinics(): Promise<ApiResult<ClinicAdminItem[]>> {
  return apiFetch<ClinicAdminItem[]>("/api/admin/clinics");
}

export function createClinic(
  body: ClinicCommand,
): Promise<ApiResult<ClinicAdminItem>> {
  return apiFetch<ClinicAdminItem>("/api/admin/clinics", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function updateClinic(
  id: string,
  body: ClinicCommand,
): Promise<ApiResult<ClinicAdminItem>> {
  return apiFetch<ClinicAdminItem>(`/api/admin/clinics/${id}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

export function deactivateClinic(id: string): Promise<ApiResult<void>> {
  return apiFetch<void>(`/api/admin/clinics/${id}/deactivate`, {
    method: "POST",
  });
}

export function listPricingItems(): Promise<ApiResult<PricingItem[]>> {
  return apiFetch<PricingItem[]>("/api/admin/pricing-items");
}

export function createPricingItem(
  body: PricingItemCommand,
): Promise<ApiResult<PricingItem>> {
  return apiFetch<PricingItem>("/api/admin/pricing-items", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export type QrDownload = {
  fileName: string;
  contentType: string;
  contentBase64: string;
};

/** Binary QR response — not JSON, so fetched outside apiFetch. */
export async function downloadClinicQr(
  id: string,
  format: "svg" | "png" = "png",
): Promise<ApiResult<QrDownload>> {
  const config = getServerConfig();
  const accessToken = await getAccessToken();
  const url = `${config.API_BASE_URL}/api/admin/clinics/${id}/qr?format=${format}`;

  try {
    const res = await fetch(url, {
      cache: "no-store",
      headers: {
        Accept: format === "png" ? "image/png" : "image/svg+xml",
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
    });

    if (res.status === 401) return { status: "unauthorized" };
    if (res.status === 403) return { status: "forbidden" };
    if (res.status === 404) return { status: "notFound" };
    if (!res.ok) return { status: "unavailable" };

    const buffer = Buffer.from(await res.arrayBuffer());
    const disposition = res.headers.get("content-disposition") ?? "";
    const match = /filename="?([^";]+)"?/i.exec(disposition);
    const fileName = match?.[1] ?? `clinic-qr.${format}`;

    return {
      status: "ok",
      data: {
        fileName,
        contentType: res.headers.get("content-type") ?? "application/octet-stream",
        contentBase64: buffer.toString("base64"),
      },
    };
  } catch {
    return { status: "unavailable" };
  }
}

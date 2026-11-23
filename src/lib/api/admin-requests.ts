/**
 * Server-only pharmacy admin request API helpers (tasks 4.3.1–4.3.3).
 * Bearer token stays on the server via apiFetch — never reaches the browser.
 */
import "server-only";

import { apiFetch, type ApiResult } from "@/lib/api/server-client";
import type { RequestStatus } from "@/components/ui/badge";
import type {
  DownloadScriptResponse,
  IssueInvoiceLineInput,
  IssueInvoiceResponse,
  ListRequestsParams,
  PagedRequests,
  RejectionReasonCode,
  RequestDetailDto,
  RevealTokenResponse,
} from "@/lib/api/admin-types";

function buildQuery(params: ListRequestsParams): string {
  const q = new URLSearchParams();
  if (params.status) q.set("status", params.status);
  if (params.paymentStatus) q.set("paymentStatus", params.paymentStatus);
  if (params.search?.trim()) q.set("search", params.search.trim());
  if (params.page && params.page > 1) q.set("page", String(params.page));
  if (params.pharmacyId) q.set("pharmacyId", params.pharmacyId);
  const qs = q.toString();
  return qs ? `?${qs}` : "";
}

export function listRequests(
  params: ListRequestsParams = {},
): Promise<ApiResult<PagedRequests>> {
  return apiFetch<PagedRequests>(`/api/admin/requests${buildQuery(params)}`);
}

export function getRequest(
  id: string,
): Promise<ApiResult<RequestDetailDto>> {
  return apiFetch<RequestDetailDto>(`/api/admin/requests/${id}`);
}

export function revealToken(
  id: string,
): Promise<ApiResult<RevealTokenResponse>> {
  return apiFetch<RevealTokenResponse>(
    `/api/admin/requests/${id}/token/reveal`,
    { method: "POST" },
  );
}

export function markTokenCopied(id: string): Promise<ApiResult<void>> {
  return apiFetch<void>(`/api/admin/requests/${id}/token/copied`, {
    method: "POST",
  });
}

export function downloadScript(
  id: string,
): Promise<ApiResult<DownloadScriptResponse>> {
  return apiFetch<DownloadScriptResponse>(
    `/api/admin/requests/${id}/script/download`,
    { method: "POST" },
  );
}

export function changeStatus(
  id: string,
  targetStatus: RequestStatus,
  rowVersion: string,
): Promise<ApiResult<void>> {
  return apiFetch<void>(`/api/admin/requests/${id}/status`, {
    method: "POST",
    body: JSON.stringify({ targetStatus, rowVersion }),
  });
}

export function rejectRequest(
  id: string,
  reason: RejectionReasonCode,
  note: string | null,
  rowVersion: string,
): Promise<ApiResult<void>> {
  return apiFetch<void>(`/api/admin/requests/${id}/reject`, {
    method: "POST",
    body: JSON.stringify({ reason, note, rowVersion }),
  });
}

export function issueInvoice(
  id: string,
  lines: IssueInvoiceLineInput[],
  deliveryFeeCents: number,
  rowVersion: string,
): Promise<ApiResult<IssueInvoiceResponse>> {
  return apiFetch<IssueInvoiceResponse>(`/api/admin/requests/${id}/invoice`, {
    method: "POST",
    body: JSON.stringify({ lines, deliveryFeeCents, rowVersion }),
  });
}

export function retryRefund(id: string): Promise<ApiResult<void>> {
  return apiFetch<void>(`/api/admin/requests/${id}/refund/retry`, {
    method: "POST",
  });
}

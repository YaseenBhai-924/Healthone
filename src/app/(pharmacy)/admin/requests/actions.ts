"use server";

import { revalidatePath } from "next/cache";
import type { RequestStatus } from "@/components/ui/badge";
import type {
  IssueInvoiceLineInput,
  RejectionReasonCode,
} from "@/lib/api/admin-types";
import {
  changeStatus,
  downloadScript,
  issueInvoice,
  markTokenCopied,
  rejectRequest,
  revealToken,
} from "@/lib/api/admin-requests";
import type { ApiResult } from "@/lib/api/server-client";

export type ActionResult =
  | { ok: true }
  | { ok: false; message: string };

export type IssueInvoiceActionResult =
  | { ok: true; checkoutUrl: string; totalCents: number; currency: string }
  | { ok: false; message: string };

export type RevealActionResult =
  | { ok: true; token: string }
  | { ok: false; message: string };

export type DownloadScriptActionResult =
  | {
      ok: true;
      fileName: string;
      contentType: string;
      contentBase64: string;
    }
  | { ok: false; message: string };

function mapError(result: ApiResult<unknown>): string {
  switch (result.status) {
    case "conflict":
    case "invalid":
    case "gone":
      return result.message;
    case "notFound":
      return "We could not find that order.";
    case "unauthorized":
      return "Your session has expired. Sign in again.";
    case "forbidden":
      return "You do not have permission for this action.";
    default:
      return "Something went wrong. Please try again.";
  }
}

function revalidateRequest(id: string) {
  revalidatePath("/admin");
  revalidatePath(`/admin/requests/${id}`);
}

export async function revealTokenAction(
  id: string,
): Promise<RevealActionResult> {
  const result = await revealToken(id);
  if (result.status === "ok") {
    // Do not revalidate — keeps the revealed token mounted in the client panel.
    return { ok: true, token: result.data.token };
  }
  return { ok: false, message: mapError(result) };
}

export async function tokenCopiedAction(id: string): Promise<ActionResult> {
  const result = await markTokenCopied(id);
  if (result.status === "ok") return { ok: true };
  return { ok: false, message: mapError(result) };
}

export async function downloadScriptAction(
  id: string,
): Promise<DownloadScriptActionResult> {
  const result = await downloadScript(id);
  if (result.status === "ok") {
    return {
      ok: true,
      fileName: result.data.fileName,
      contentType: result.data.contentType,
      contentBase64: result.data.contentBase64,
    };
  }
  return { ok: false, message: mapError(result) };
}

export async function changeStatusAction(
  id: string,
  targetStatus: RequestStatus,
  rowVersion: string,
): Promise<ActionResult> {
  const result = await changeStatus(id, targetStatus, rowVersion);
  if (result.status === "ok") {
    revalidateRequest(id);
    return { ok: true };
  }
  return { ok: false, message: mapError(result) };
}

export async function rejectRequestAction(
  id: string,
  reason: RejectionReasonCode,
  note: string | null,
  rowVersion: string,
): Promise<ActionResult> {
  const result = await rejectRequest(id, reason, note, rowVersion);
  if (result.status === "ok") {
    revalidateRequest(id);
    return { ok: true };
  }
  return { ok: false, message: mapError(result) };
}

export async function issueInvoiceAction(
  id: string,
  lines: IssueInvoiceLineInput[],
  deliveryFeeCents: number,
  rowVersion: string,
): Promise<IssueInvoiceActionResult> {
  const result = await issueInvoice(id, lines, deliveryFeeCents, rowVersion);
  if (result.status === "ok") {
    revalidateRequest(id);
    return {
      ok: true,
      checkoutUrl: result.data.checkoutUrl,
      totalCents: result.data.totalCents,
      currency: result.data.currency,
    };
  }
  return { ok: false, message: mapError(result) };
}

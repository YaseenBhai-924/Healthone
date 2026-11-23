"use server";

import { revalidatePath } from "next/cache";
import {
  createPharmacy,
  deactivatePharmacy,
  updatePharmacy,
} from "@/lib/api/hq-pharmacies";
import { retryRefund } from "@/lib/api/admin-requests";
import type { PharmacyCommand } from "@/lib/api/hq-types";

export type HqActionResult =
  | { ok: true; id?: string }
  | { ok: false; message: string };

function mapError(status: string, message?: string): HqActionResult {
  if (status === "unauthorized")
    return { ok: false, message: "Session expired. Sign in again." };
  if (status === "forbidden")
    return { ok: false, message: "You do not have permission for this action." };
  if (status === "conflict")
    return { ok: false, message: message ?? "That Entra group is already in use." };
  if (status === "invalid")
    return { ok: false, message: message ?? "Please check the form fields." };
  if (status === "notFound")
    return { ok: false, message: "Pharmacy not found." };
  return { ok: false, message: "Could not save. Try again." };
}

export async function savePharmacyAction(
  id: string | null,
  body: PharmacyCommand,
): Promise<HqActionResult> {
  const result = id
    ? await updatePharmacy(id, body)
    : await createPharmacy(body);

  if (result.status !== "ok") {
    return mapError(
      result.status,
      "message" in result ? result.message : undefined,
    );
  }

  revalidatePath("/hq/pharmacies");
  revalidatePath("/hq");
  return { ok: true, id: result.data.id };
}

export async function deactivatePharmacyAction(
  id: string,
): Promise<HqActionResult> {
  const result = await deactivatePharmacy(id);
  if (result.status !== "ok") return mapError(result.status);
  revalidatePath("/hq/pharmacies");
  revalidatePath(`/hq/pharmacies/${id}`);
  return { ok: true };
}

export async function retryRefundAction(requestId: string): Promise<HqActionResult> {
  const result = await retryRefund(requestId);
  if (result.status !== "ok") {
    return mapError(
      result.status,
      "message" in result ? result.message : undefined,
    );
  }
  revalidatePath("/hq/pharmacies");
  return { ok: true };
}

"use server";

import { revalidatePath } from "next/cache";
import {
  createClinic,
  createPricingItem,
  deactivateClinic,
  downloadClinicQr,
  updateClinic,
} from "@/lib/api/hq-clinics";
import type { ClinicCommand, PricingItemCommand } from "@/lib/api/hq-types";

export type HqClinicActionResult =
  | { ok: true; id?: string; fileName?: string; contentBase64?: string; contentType?: string }
  | { ok: false; message: string };

function mapError(status: string, message?: string): HqClinicActionResult {
  if (status === "unauthorized")
    return { ok: false, message: "Session expired. Sign in again." };
  if (status === "forbidden")
    return { ok: false, message: "You do not have permission for this action." };
  if (status === "conflict")
    return { ok: false, message: message ?? "That slug is already in use." };
  if (status === "invalid")
    return { ok: false, message: message ?? "Please check the form fields." };
  if (status === "notFound")
    return { ok: false, message: "Clinic not found." };
  return { ok: false, message: "Could not save. Try again." };
}

export async function saveClinicAction(
  id: string | null,
  body: ClinicCommand,
): Promise<HqClinicActionResult> {
  const result = id ? await updateClinic(id, body) : await createClinic(body);
  if (result.status !== "ok") {
    return mapError(
      result.status,
      "message" in result ? result.message : undefined,
    );
  }
  revalidatePath("/hq/clinics");
  return { ok: true, id: result.data.id };
}

export async function deactivateClinicAction(
  id: string,
): Promise<HqClinicActionResult> {
  const result = await deactivateClinic(id);
  if (result.status !== "ok") return mapError(result.status);
  revalidatePath("/hq/clinics");
  return { ok: true };
}

export async function savePricingItemAction(
  body: PricingItemCommand,
): Promise<HqClinicActionResult> {
  const result = await createPricingItem(body);
  if (result.status !== "ok") {
    return mapError(
      result.status,
      "message" in result ? result.message : undefined,
    );
  }
  revalidatePath("/hq/clinics");
  return { ok: true, id: result.data.id };
}

export async function downloadQrAction(
  id: string,
  format: "svg" | "png" = "png",
): Promise<HqClinicActionResult> {
  const result = await downloadClinicQr(id, format);
  if (result.status !== "ok") return mapError(result.status);
  return {
    ok: true,
    fileName: result.data.fileName,
    contentBase64: result.data.contentBase64,
    contentType: result.data.contentType,
  };
}

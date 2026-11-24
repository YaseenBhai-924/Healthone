"use server";

import { revalidatePath } from "next/cache";
import {
  createPriceComparison,
  deletePriceComparison,
  exportPriceComparisonsCsv,
  importPriceComparisonsCsv,
  updatePriceComparison,
} from "@/lib/api/hq-price-comparisons";
import type { PriceComparisonCommand } from "@/lib/api/hq-types";

export type HqActionResult =
  | { ok: true; id?: string; csv?: string; imported?: number }
  | { ok: false; message: string };

function mapError(status: string, message?: string): HqActionResult {
  if (status === "notFound") return { ok: false, message: "Not found." };
  if (status === "invalid")
    return { ok: false, message: message ?? "Please check the form fields." };
  return { ok: false, message: message ?? "Could not save. Try again." };
}

function revalidateComparisons() {
  revalidatePath("/hq/price-comparisons");
  revalidatePath("/");
  revalidatePath("/order");
  revalidatePath("/c", "layout");
}

export async function savePriceComparisonAction(
  id: string | null,
  body: PriceComparisonCommand,
): Promise<HqActionResult> {
  if (!body.medicineName.trim()) {
    return { ok: false, message: "Medicine name is required." };
  }
  if (!Number.isInteger(body.ourPriceCents) || body.ourPriceCents < 0) {
    return { ok: false, message: "Our price must be integer cents." };
  }
  if (!body.partnerPharmacyId) {
    return { ok: false, message: "Select a partner pharmacy." };
  }
  if (
    body.competitors.some(
      (c) =>
        !c.pharmacyName.trim() ||
        !Number.isInteger(c.priceCents) ||
        c.priceCents < 0,
    )
  ) {
    return {
      ok: false,
      message: "Each competitor needs a name and integer cents price.",
    };
  }

  const result = id
    ? await updatePriceComparison(id, body)
    : await createPriceComparison(body);

  if (result.status !== "ok") {
    return mapError(
      result.status,
      "message" in result ? result.message : undefined,
    );
  }

  revalidateComparisons();
  return { ok: true, id: result.data.id };
}

export async function deletePriceComparisonAction(
  id: string,
): Promise<HqActionResult> {
  const result = await deletePriceComparison(id);
  if (result.status !== "ok") return mapError(result.status);
  revalidateComparisons();
  return { ok: true };
}

export async function exportPriceComparisonsAction(): Promise<HqActionResult> {
  const result = await exportPriceComparisonsCsv();
  if (result.status !== "ok") return mapError(result.status);
  return { ok: true, csv: result.data };
}

export async function importPriceComparisonsAction(
  csvText: string,
): Promise<HqActionResult> {
  const result = await importPriceComparisonsCsv(csvText);
  if (result.status !== "ok") {
    return mapError(
      result.status,
      "message" in result ? result.message : undefined,
    );
  }
  revalidateComparisons();
  return { ok: true, imported: result.data.imported };
}

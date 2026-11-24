"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { savePriceComparisonAction } from "@/app/(hq)/hq/price-comparisons/actions";
import type {
  PharmacyListItem,
  PriceComparisonItem,
} from "@/lib/api/hq-types";
import { Button } from "@/components/ui/button";
import {
  ErrorText,
  Field,
  HintText,
  Input,
  Label,
  Select,
  Textarea,
  useToast,
} from "@/components/ui";

type CompetitorRow = { pharmacyName: string; priceCents: string };

export function PriceComparisonForm({
  comparison,
  pharmacies,
}: {
  comparison?: PriceComparisonItem | null;
  pharmacies: PharmacyListItem[];
}) {
  const router = useRouter();
  const { addToast } = useToast();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [competitors, setCompetitors] = useState<CompetitorRow[]>(
    comparison?.competitors.map((c) => ({
      pharmacyName: c.pharmacyName,
      priceCents: String(c.priceCents),
    })) ?? [{ pharmacyName: "", priceCents: "" }],
  );

  const isEdit = Boolean(comparison);
  const activePharmacies = pharmacies.filter((p) => p.isActive);

  function onSubmit(formData: FormData) {
    setError(null);
    const medicineName = String(formData.get("medicineName") ?? "").trim();
    const ourPriceCents = Number.parseInt(
      String(formData.get("ourPriceCents") ?? ""),
      10,
    );
    const partnerPharmacyId = String(
      formData.get("partnerPharmacyId") ?? "",
    ).trim();
    const notes = String(formData.get("notes") ?? "").trim();

    const parsedCompetitors = competitors
      .map((c) => ({
        pharmacyName: c.pharmacyName.trim(),
        priceCents: Number.parseInt(c.priceCents, 10),
      }))
      .filter((c) => c.pharmacyName || Number.isFinite(c.priceCents));

    startTransition(async () => {
      const result = await savePriceComparisonAction(comparison?.id ?? null, {
        medicineName,
        ourPriceCents,
        partnerPharmacyId,
        notes: notes || null,
        competitors: parsedCompetitors,
      });
      if (!result.ok) {
        setError(result.message);
        addToast({ variant: "danger", message: result.message });
        return;
      }
      addToast({
        variant: "success",
        message: isEdit ? "Comparison updated." : "Comparison created.",
      });
      router.push("/hq/price-comparisons");
      router.refresh();
    });
  }

  return (
    <form action={onSubmit} className="flex max-w-2xl flex-col gap-5">
      {error ? <ErrorText>{error}</ErrorText> : null}

      <Field>
        <Label htmlFor="medicineName">Medicine name</Label>
        <Input
          id="medicineName"
          name="medicineName"
          required
          defaultValue={comparison?.medicineName ?? ""}
          maxLength={160}
        />
      </Field>

      <Field>
        <Label htmlFor="ourPriceCents">Our / partner price (cents AUD)</Label>
        <Input
          id="ourPriceCents"
          name="ourPriceCents"
          type="number"
          inputMode="numeric"
          min={0}
          step={1}
          required
          defaultValue={comparison?.ourPriceCents ?? ""}
        />
        <HintText>Integer cents only (e.g. 18900 = $189.00).</HintText>
      </Field>

      <Field>
        <Label htmlFor="partnerPharmacyId">Partner pharmacy</Label>
        <Select
          id="partnerPharmacyId"
          name="partnerPharmacyId"
          required
          defaultValue={comparison?.partnerPharmacyId ?? ""}
        >
          <option value="" disabled>
            Select pharmacy…
          </option>
          {activePharmacies.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </Select>
      </Field>

      <Field>
        <Label htmlFor="notes">Notes (optional)</Label>
        <Textarea
          id="notes"
          name="notes"
          rows={2}
          defaultValue={comparison?.notes ?? ""}
        />
      </Field>

      <fieldset className="space-y-3 rounded-card border border-line p-4">
        <legend className="px-1 text-sm font-semibold text-heading">
          Competitor prices (cents)
        </legend>
        {competitors.map((row, index) => (
          <div
            key={index}
            className="grid gap-3 sm:grid-cols-[1fr_8rem_auto]"
          >
            <Input
              aria-label={`Competitor ${index + 1} name`}
              placeholder="Competitor pharmacy"
              value={row.pharmacyName}
              onChange={(e) => {
                const next = [...competitors];
                next[index] = { ...row, pharmacyName: e.target.value };
                setCompetitors(next);
              }}
            />
            <Input
              aria-label={`Competitor ${index + 1} price cents`}
              type="number"
              inputMode="numeric"
              min={0}
              step={1}
              placeholder="Cents"
              value={row.priceCents}
              onChange={(e) => {
                const next = [...competitors];
                next[index] = { ...row, priceCents: e.target.value };
                setCompetitors(next);
              }}
            />
            <Button
              type="button"
              variant="secondary"
              disabled={competitors.length <= 1}
              onClick={() =>
                setCompetitors(competitors.filter((_, i) => i !== index))
              }
            >
              Remove
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="secondary"
          onClick={() =>
            setCompetitors([
              ...competitors,
              { pharmacyName: "", priceCents: "" },
            ])
          }
        >
          Add competitor
        </Button>
      </fieldset>

      <div className="flex gap-3">
        <Button type="submit" loading={pending}>
          {isEdit ? "Save changes" : "Create comparison"}
        </Button>
        <Button
          type="button"
          variant="secondary"
          disabled={pending}
          onClick={() => router.push("/hq/price-comparisons")}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}

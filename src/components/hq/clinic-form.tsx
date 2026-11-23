"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { saveClinicAction } from "@/app/(hq)/hq/clinics/actions";
import type { ClinicAdminItem, PharmacyListItem, PricingItem } from "@/lib/api/hq-types";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  Label,
  HintText,
  ErrorText,
  Input,
  Select,
  useToast,
} from "@/components/ui";
import { formatMoney } from "@/lib/format/money";

export function ClinicForm({
  clinic,
  pharmacies,
  pricingItems,
}: {
  clinic?: ClinicAdminItem | null;
  pharmacies: PharmacyListItem[];
  pricingItems: PricingItem[];
}) {
  const router = useRouter();
  const { addToast } = useToast();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const isEdit = Boolean(clinic);
  const activePricing = pricingItems.filter((p) => p.isActive || p.id === clinic?.pricingItemId);
  const activePharmacies = pharmacies.filter((p) => p.isActive || p.id === clinic?.pharmacyId);

  function onSubmit(formData: FormData) {
    setError(null);
    const slug = String(formData.get("slug") ?? "").trim().toLowerCase();
    const name = String(formData.get("name") ?? "").trim();
    const pharmacyId = String(formData.get("pharmacyId") ?? "");
    const pricingItemId = String(formData.get("pricingItemId") ?? "");
    const logoUrl = String(formData.get("logoUrl") ?? "").trim() || null;
    const brandColour = String(formData.get("brandColour") ?? "").trim() || null;
    const isActive = formData.get("isActive") === "on";

    if (!slug || !name || !pharmacyId || !pricingItemId) {
      setError("Slug, name, pharmacy and price are required.");
      return;
    }

    startTransition(async () => {
      const result = await saveClinicAction(clinic?.id ?? null, {
        slug,
        name,
        pharmacyId,
        pricingItemId,
        logoUrl,
        brandColour,
        isActive,
      });
      if (!result.ok) {
        setError(result.message);
        addToast({ variant: "danger", message: result.message });
        return;
      }
      addToast({
        variant: "success",
        message: isEdit ? "Clinic updated." : "Clinic created.",
      });
      router.push("/hq/clinics");
      router.refresh();
    });
  }

  return (
    <form action={onSubmit} className="flex max-w-xl flex-col gap-5">
      {error ? <ErrorText>{error}</ErrorText> : null}

      <Field>
        <Label htmlFor="name">Clinic name</Label>
        <Input id="name" name="name" required defaultValue={clinic?.name ?? ""} maxLength={120} />
      </Field>

      <Field>
        <Label htmlFor="slug">Slug</Label>
        <Input
          id="slug"
          name="slug"
          required
          className="font-mono text-sm"
          defaultValue={clinic?.slug ?? ""}
          placeholder="demo-clinic-a"
        />
        <HintText>
          3–80 chars: lowercase letters, digits, single hyphens. Used in /c/&#123;slug&#125;.
        </HintText>
      </Field>

      <Field>
        <Label htmlFor="pharmacyId">Pharmacy</Label>
        <Select
          id="pharmacyId"
          name="pharmacyId"
          required
          defaultValue={clinic?.pharmacyId ?? ""}
        >
          <option value="" disabled>
            Select pharmacy
          </option>
          {activePharmacies.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
              {!p.isActive ? " (inactive)" : ""}
            </option>
          ))}
        </Select>
      </Field>

      <Field>
        <Label htmlFor="pricingItemId">Price item</Label>
        <Select
          id="pricingItemId"
          name="pricingItemId"
          required
          defaultValue={clinic?.pricingItemId ?? ""}
        >
          <option value="" disabled>
            Select price
          </option>
          {activePricing.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} — {formatMoney(p.priceCents, p.currency)}
              {p.deliveryFeeCents > 0
                ? ` (+${formatMoney(p.deliveryFeeCents, p.currency)} delivery)`
                : ""}
            </option>
          ))}
        </Select>
      </Field>

      <Field>
        <Label htmlFor="brandColour">Brand colour</Label>
        <Input
          id="brandColour"
          name="brandColour"
          defaultValue={clinic?.brandColour ?? "#2563EB"}
          placeholder="#2563EB"
        />
      </Field>

      <Field>
        <Label htmlFor="logoUrl">Logo URL (optional)</Label>
        <Input
          id="logoUrl"
          name="logoUrl"
          defaultValue={clinic?.logoUrl ?? ""}
          maxLength={500}
        />
      </Field>

      <label className="flex items-center gap-2 text-sm font-medium text-fg-secondary">
        <Checkbox name="isActive" defaultChecked={clinic?.isActive ?? true} />
        Active (accepting orders)
      </label>

      <div className="flex gap-3">
        <Button type="submit" loading={pending}>
          {isEdit ? "Save changes" : "Create clinic"}
        </Button>
        <Button
          type="button"
          variant="secondary"
          disabled={pending}
          onClick={() => router.push("/hq/clinics")}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}

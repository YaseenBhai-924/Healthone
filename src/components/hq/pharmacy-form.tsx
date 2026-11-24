"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { savePharmacyAction } from "@/app/(hq)/hq/pharmacies/actions";
import type { PharmacyListItem } from "@/lib/api/hq-types";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  Label,
  HintText,
  ErrorText,
  Input,
  Textarea,
  Select,
  useToast,
} from "@/components/ui";

const AU_STATES = ["NSW", "VIC", "QLD", "SA", "WA", "TAS", "ACT", "NT"] as const;

function parseEmails(raw: string): string[] {
  return raw
    .split(/[,;\n]+/)
    .map((e) => e.trim())
    .filter(Boolean);
}

export function PharmacyForm({
  pharmacy,
}: {
  pharmacy?: PharmacyListItem | null;
}) {
  const router = useRouter();
  const { addToast } = useToast();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const isEdit = Boolean(pharmacy);

  function onSubmit(formData: FormData) {
    setError(null);
    const name = String(formData.get("name") ?? "").trim();
    const entraGroupId = String(formData.get("entraGroupId") ?? "").trim();
    const alertRecipients = parseEmails(String(formData.get("alertRecipients") ?? ""));
    const isActive = formData.get("isActive") === "on";
    const line1 = String(formData.get("addressLine1") ?? "").trim();
    const line2 = String(formData.get("addressLine2") ?? "").trim();
    const suburb = String(formData.get("suburb") ?? "").trim();
    const state = String(formData.get("state") ?? "").trim().toUpperCase();
    const postcode = String(formData.get("postcode") ?? "").trim();

    if (!name || !entraGroupId || alertRecipients.length === 0) {
      setError("Name, Entra group ID, and at least one alert email are required.");
      return;
    }
    if (!line1 || !suburb || !state || !/^\d{4}$/.test(postcode)) {
      setError("Australian address is required (line 1, suburb, state, 4-digit postcode).");
      return;
    }
    if (!(AU_STATES as readonly string[]).includes(state)) {
      setError("State must be a valid Australian state or territory.");
      return;
    }

    startTransition(async () => {
      const result = await savePharmacyAction(pharmacy?.id ?? null, {
        name,
        entraGroupId,
        alertRecipients,
        isActive,
        address: {
          line1,
          line2: line2 || null,
          suburb,
          state,
          postcode,
        },
      });
      if (!result.ok) {
        setError(result.message);
        addToast({ variant: "danger", message: result.message });
        return;
      }
      addToast({
        variant: "success",
        message: isEdit ? "Pharmacy updated." : "Pharmacy created.",
      });
      router.push("/hq/pharmacies");
      router.refresh();
    });
  }

  return (
    <form action={onSubmit} className="flex max-w-xl flex-col gap-5">
      {error ? <ErrorText>{error}</ErrorText> : null}

      <Field>
        <Label htmlFor="name">Pharmacy name</Label>
        <Input
          id="name"
          name="name"
          required
          defaultValue={pharmacy?.name ?? ""}
          maxLength={120}
        />
      </Field>

      <fieldset className="space-y-4 rounded-card border border-line p-4">
        <legend className="px-1 text-sm font-semibold text-heading">
          Australian address
        </legend>
        <p className="text-xs text-ink-muted">
          Collection location shown to patients. Do not enter patient delivery addresses here.
        </p>
        <Field>
          <Label htmlFor="addressLine1">Address line 1</Label>
          <Input
            id="addressLine1"
            name="addressLine1"
            required
            defaultValue={pharmacy?.address?.line1 ?? ""}
            maxLength={120}
            autoComplete="address-line1"
          />
        </Field>
        <Field>
          <Label htmlFor="addressLine2">Address line 2 (optional)</Label>
          <Input
            id="addressLine2"
            name="addressLine2"
            defaultValue={pharmacy?.address?.line2 ?? ""}
            maxLength={120}
            autoComplete="address-line2"
          />
        </Field>
        <Field>
          <Label htmlFor="suburb">Suburb</Label>
          <Input
            id="suburb"
            name="suburb"
            required
            defaultValue={pharmacy?.address?.suburb ?? ""}
            maxLength={80}
            autoComplete="address-level2"
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field>
            <Label htmlFor="state">State</Label>
            <Select
              id="state"
              name="state"
              required
              defaultValue={pharmacy?.address?.state ?? "NSW"}
            >
              {AU_STATES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Select>
          </Field>
          <Field>
            <Label htmlFor="postcode">Postcode</Label>
            <Input
              id="postcode"
              name="postcode"
              required
              inputMode="numeric"
              pattern="\d{4}"
              maxLength={4}
              defaultValue={pharmacy?.address?.postcode ?? ""}
              autoComplete="postal-code"
            />
          </Field>
        </div>
      </fieldset>

      <Field>
        <Label htmlFor="alertRecipients">Alert email recipients</Label>
        <Textarea
          id="alertRecipients"
          name="alertRecipients"
          required
          rows={3}
          defaultValue={pharmacy?.alertRecipients.join(", ") ?? ""}
          placeholder="orders@example.com, dispensary@example.com"
        />
        <HintText>Comma-separated. 1–10 addresses. No patient data is sent to these.</HintText>
      </Field>

      <Field>
        <Label htmlFor="entraGroupId">Entra group ID</Label>
        <Input
          id="entraGroupId"
          name="entraGroupId"
          required
          className="font-mono text-sm"
          defaultValue={pharmacy?.entraGroupId ?? ""}
          placeholder="00000000-0000-0000-0000-000000000000"
        />
        <HintText>Create the group in Entra and assign it to the Script Direct app first.</HintText>
      </Field>

      <label className="flex items-center gap-2 text-sm font-medium text-fg-secondary">
        <Checkbox
          name="isActive"
          defaultChecked={pharmacy?.isActive ?? true}
        />
        Active
      </label>

      <div className="flex gap-3">
        <Button type="submit" loading={pending}>
          {isEdit ? "Save changes" : "Create pharmacy"}
        </Button>
        <Button
          type="button"
          variant="secondary"
          disabled={pending}
          onClick={() => router.push("/hq/pharmacies")}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}

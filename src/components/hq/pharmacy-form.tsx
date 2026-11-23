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
  useToast,
} from "@/components/ui";

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

    if (!name || !entraGroupId || alertRecipients.length === 0) {
      setError("Name, Entra group ID, and at least one alert email are required.");
      return;
    }

    startTransition(async () => {
      const result = await savePharmacyAction(pharmacy?.id ?? null, {
        name,
        entraGroupId,
        alertRecipients,
        isActive,
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

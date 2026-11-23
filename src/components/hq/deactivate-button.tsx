"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { deactivatePharmacyAction } from "@/app/(hq)/hq/pharmacies/actions";
import { deactivateClinicAction } from "@/app/(hq)/hq/clinics/actions";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

export function DeactivateButton({
  kind,
  id,
  label,
  confirmMessage,
  redirectTo,
}: {
  kind: "pharmacy" | "clinic";
  id: string;
  label: string;
  confirmMessage: string;
  redirectTo?: string;
}) {
  const router = useRouter();
  const { addToast } = useToast();
  const [pending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="danger"
      size="sm"
      loading={pending}
      onClick={() => {
        if (!window.confirm(confirmMessage)) return;
        startTransition(async () => {
          const result =
            kind === "pharmacy"
              ? await deactivatePharmacyAction(id)
              : await deactivateClinicAction(id);
          if (!result.ok) {
            addToast({ variant: "danger", message: result.message });
            return;
          }
          addToast({ variant: "success", message: "Deactivated." });
          if (redirectTo) router.push(redirectTo);
          router.refresh();
        });
      }}
    >
      {label}
    </Button>
  );
}

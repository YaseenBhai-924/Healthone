"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deletePriceComparisonAction } from "@/app/(hq)/hq/price-comparisons/actions";
import { Button, useToast } from "@/components/ui";

export function DeleteComparisonButton({ id }: { id: string }) {
  const router = useRouter();
  const { addToast } = useToast();
  const [pending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="secondary"
      size="sm"
      loading={pending}
      onClick={() => {
        if (!window.confirm("Delete this price comparison?")) return;
        startTransition(async () => {
          const result = await deletePriceComparisonAction(id);
          if (!result.ok) {
            addToast({ variant: "danger", message: result.message });
            return;
          }
          addToast({ variant: "success", message: "Comparison deleted." });
          router.refresh();
        });
      }}
    >
      Delete
    </Button>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { RotateCcw } from "lucide-react";
import { retryRefundAction } from "@/app/(hq)/hq/pharmacies/actions";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

export function RetryRefundButton({ requestId }: { requestId: string }) {
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
        startTransition(async () => {
          const result = await retryRefundAction(requestId);
          if (!result.ok) {
            addToast({ variant: "danger", message: result.message });
            return;
          }
          addToast({ variant: "success", message: "Refund retry sent to Stripe." });
          router.refresh();
        });
      }}
    >
      <RotateCcw className="h-3.5 w-3.5" aria-hidden />
      Retry refund
    </Button>
  );
}

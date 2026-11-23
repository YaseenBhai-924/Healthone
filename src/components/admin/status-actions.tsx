"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { RequestStatus } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import type { FulfilmentType } from "@/lib/api/admin-types";
import { statusActionLabel } from "@/lib/admin/request-labels";
import { changeStatusAction } from "@/app/(pharmacy)/admin/requests/actions";
import { RejectDialog } from "./reject-dialog";

export function StatusActions({
  requestId,
  reference,
  fulfilmentType,
  allowedActions,
  rowVersion,
  amountCents,
  currency,
  paymentStatus,
}: {
  requestId: string;
  reference: string;
  fulfilmentType: FulfilmentType;
  allowedActions: RequestStatus[];
  rowVersion: string;
  amountCents: number;
  currency: string;
  paymentStatus: string;
}) {
  const router = useRouter();
  const { addToast } = useToast();
  const [pending, startTransition] = useTransition();
  const [rejectOpen, setRejectOpen] = useState(false);
  const [busyStatus, setBusyStatus] = useState<RequestStatus | null>(null);

  const statusActions = allowedActions.filter((a) => a !== "Rejected");
  const canReject = allowedActions.includes("Rejected");

  function onStatus(target: RequestStatus) {
    setBusyStatus(target);
    startTransition(async () => {
      const result = await changeStatusAction(requestId, target, rowVersion);
      setBusyStatus(null);
      if (!result.ok) {
        addToast({ variant: "danger", message: result.message });
        return;
      }
      addToast({
        variant: "success",
        message: statusActionLabel(target, fulfilmentType, paymentStatus),
      });
      router.refresh();
    });
  }

  const rejectLabel = statusActionLabel(
    "Rejected",
    fulfilmentType,
    paymentStatus,
  );
  const willRefund =
    paymentStatus === "Paid" ||
    paymentStatus === "RefundPending" ||
    paymentStatus === "Refunded" ||
    paymentStatus === "RefundFailed";

  if (statusActions.length === 0 && !canReject) {
    return (
      <p className="text-sm text-fg-muted">No further status actions available.</p>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-2">
        {statusActions.map((target) => (
          <Button
            key={target}
            type="button"
            variant="secondary"
            className="w-full justify-start"
            onClick={() => onStatus(target)}
            loading={pending && busyStatus === target}
            disabled={pending}
          >
            {statusActionLabel(target, fulfilmentType, paymentStatus)}
          </Button>
        ))}
        {canReject ? (
          <Button
            type="button"
            variant="danger"
            className="w-full justify-start"
            onClick={() => setRejectOpen(true)}
            disabled={pending}
          >
            {rejectLabel}
          </Button>
        ) : null}
      </div>

      <RejectDialog
        open={rejectOpen}
        onClose={() => setRejectOpen(false)}
        requestId={requestId}
        reference={reference}
        amountCents={amountCents}
        currency={currency}
        rowVersion={rowVersion}
        willRefund={willRefund}
      />
    </>
  );
}

"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogBody, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";
import type { RejectionReasonCode } from "@/lib/api/admin-types";
import { REJECTION_REASONS } from "@/lib/admin/request-labels";
import { formatMoney } from "@/lib/format/money";
import { rejectRequestAction } from "@/app/(pharmacy)/admin/requests/actions";

export function RejectDialog({
  open,
  onClose,
  requestId,
  reference,
  amountCents,
  currency,
  rowVersion,
  willRefund,
}: {
  open: boolean;
  onClose: () => void;
  requestId: string;
  reference: string;
  amountCents: number;
  currency: string;
  rowVersion: string;
  willRefund: boolean;
}) {
  const router = useRouter();
  const { addToast } = useToast();
  const [pending, startTransition] = useTransition();
  const [reason, setReason] =
    useState<RejectionReasonCode>("InvalidOrExpiredScript");
  const [note, setNote] = useState("");

  function onConfirm() {
    startTransition(async () => {
      const result = await rejectRequestAction(
        requestId,
        reason,
        note.trim() || null,
        rowVersion,
      );
      if (!result.ok) {
        addToast({ variant: "danger", message: result.message });
        return;
      }
      addToast({
        variant: "success",
        message: willRefund
          ? "Order rejected. Refund started; patient will be emailed."
          : "Order rejected. Patient will be emailed.",
      });
      onClose();
      router.refresh();
    });
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={willRefund ? "Reject and refund order" : "Reject order"}
    >
      <DialogBody className="flex flex-col gap-4">
        <p className="font-mono text-sm text-fg-muted">{reference}</p>
        <p className="text-sm text-fg">
          {willRefund ? (
            <>
              The patient is refunded{" "}
              <strong>{formatMoney(amountCents, currency)}</strong> to their
              original payment method and notified by email. This cannot be
              undone.
            </>
          ) : (
            <>
              This order has not been paid. The patient will be notified by
              email. Any open payment link will be cancelled. This cannot be
              undone.
            </>
          )}
        </p>

        <div>
          <Label htmlFor="reject-reason">Reason</Label>
          <Select
            id="reject-reason"
            value={reason}
            onChange={(e) =>
              setReason(e.target.value as RejectionReasonCode)
            }
            disabled={pending}
          >
            {REJECTION_REASONS.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <Label htmlFor="reject-note">
            Note shown to the patient (optional)
          </Label>
          <Textarea
            id="reject-note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={200}
            rows={3}
            placeholder="Keep it short. Do not include medication details."
            disabled={pending}
          />
        </div>
      </DialogBody>
      <DialogFooter>
        <Button variant="secondary" onClick={onClose} disabled={pending}>
          Cancel
        </Button>
        <Button variant="danger" onClick={onConfirm} loading={pending}>
          {willRefund ? "Reject and refund" : "Reject"}
        </Button>
      </DialogFooter>
    </Dialog>
  );
}

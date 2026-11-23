"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";
import { formatMoney } from "@/lib/format/money";
import {
  centsToDollarsInput,
  dollarsToCents,
  invoiceTotalCents,
} from "@/lib/admin/invoice-totals";
import type { InvoiceLineItemDto } from "@/lib/api/admin-types";
import { issueInvoiceAction } from "@/app/(pharmacy)/admin/requests/actions";

type DraftLine = {
  key: string;
  description: string;
  quantity: string;
  unitPriceDollars: string;
};

export function InvoicePanel({
  requestId,
  rowVersion,
  currency,
  fulfilmentIsDelivery,
  defaultDeliveryFeeCents,
  existingLines,
  canIssue,
}: {
  requestId: string;
  rowVersion: string;
  currency: string;
  fulfilmentIsDelivery: boolean;
  defaultDeliveryFeeCents: number;
  existingLines: InvoiceLineItemDto[];
  canIssue: boolean;
}) {
  const router = useRouter();
  const { addToast } = useToast();
  const [pending, startTransition] = useTransition();
  const [lines, setLines] = useState<DraftLine[]>(() =>
    existingLines.length > 0
      ? existingLines.map((l, i) => ({
          key: `e-${i}`,
          description: l.description,
          quantity: String(l.quantity),
          unitPriceDollars: centsToDollarsInput(l.unitPriceCents),
        }))
      : [
          {
            key: "n-0",
            description: "",
            quantity: "1",
            unitPriceDollars: "",
          },
        ],
  );
  const [deliveryDollars, setDeliveryDollars] = useState(
    centsToDollarsInput(
      fulfilmentIsDelivery ? defaultDeliveryFeeCents : 0,
    ),
  );

  const totalCents = useMemo(
    () => invoiceTotalCents(lines, deliveryDollars, fulfilmentIsDelivery),
    [lines, deliveryDollars, fulfilmentIsDelivery],
  );

  function addLine() {
    setLines((prev) => [
      ...prev,
      {
        key: `n-${Date.now()}`,
        description: "",
        quantity: "1",
        unitPriceDollars: "",
      },
    ]);
  }

  function removeLine(key: string) {
    setLines((prev) => (prev.length <= 1 ? prev : prev.filter((l) => l.key !== key)));
  }

  function onSend() {
    const parsed: { description: string; quantity: number; unitPriceCents: number }[] =
      [];
    for (const line of lines) {
      const description = line.description.trim();
      const quantity = Number.parseInt(line.quantity, 10);
      const unitPriceCents = dollarsToCents(line.unitPriceDollars);
      if (!description || !Number.isFinite(quantity) || quantity < 1 || unitPriceCents === null) {
        addToast({
          variant: "danger",
          message: "Each line needs a description, quantity, and unit price.",
        });
        return;
      }
      parsed.push({ description, quantity, unitPriceCents });
    }

    let deliveryFeeCents = 0;
    if (fulfilmentIsDelivery) {
      const d = dollarsToCents(deliveryDollars);
      if (d === null) {
        addToast({ variant: "danger", message: "Enter a valid delivery fee." });
        return;
      }
      deliveryFeeCents = d;
    }

    startTransition(async () => {
      const result = await issueInvoiceAction(
        requestId,
        parsed,
        deliveryFeeCents,
        rowVersion,
      );
      if (!result.ok) {
        addToast({ variant: "danger", message: result.message });
        return;
      }
      addToast({
        variant: "success",
        message: `Payment link emailed (${formatMoney(result.totalCents, result.currency)}).`,
      });
      router.refresh();
    });
  }

  if (!canIssue && existingLines.length === 0) {
    return (
      <p className="text-sm text-fg-muted">
        Invoice actions are not available for this order.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {existingLines.length > 0 && !canIssue ? (
        <ul className="space-y-2 text-sm">
          {existingLines.map((l, i) => (
            <li
              key={`${l.description}-${i}`}
              className="flex justify-between gap-3 border-b border-subtle py-2 last:border-0"
            >
              <span>
                {l.description} × {l.quantity}
              </span>
              <span className="font-semibold">
                {formatMoney(l.lineTotalCents, currency)}
              </span>
            </li>
          ))}
        </ul>
      ) : null}

      {canIssue ? (
        <>
          <p className="text-xs text-fg-muted">
            Add medicines from your dispensing system, set prices, then send the
            Stripe payment link to the patient.
          </p>
          <div className="space-y-3">
            {lines.map((line) => (
              <div
                key={line.key}
                className="grid gap-2 rounded-control border border-subtle p-3 sm:grid-cols-[1fr_4.5rem_6.5rem_auto]"
              >
                <div>
                  <Label htmlFor={`desc-${line.key}`}>Medicine / item</Label>
                  <Input
                    id={`desc-${line.key}`}
                    value={line.description}
                    onChange={(e) =>
                      setLines((prev) =>
                        prev.map((l) =>
                          l.key === line.key
                            ? { ...l, description: e.target.value }
                            : l,
                        ),
                      )
                    }
                    placeholder="e.g. Amoxicillin 500mg"
                  />
                </div>
                <div>
                  <Label htmlFor={`qty-${line.key}`}>Qty</Label>
                  <Input
                    id={`qty-${line.key}`}
                    inputMode="numeric"
                    value={line.quantity}
                    onChange={(e) =>
                      setLines((prev) =>
                        prev.map((l) =>
                          l.key === line.key
                            ? { ...l, quantity: e.target.value }
                            : l,
                        ),
                      )
                    }
                  />
                </div>
                <div>
                  <Label htmlFor={`price-${line.key}`}>Unit ($)</Label>
                  <Input
                    id={`price-${line.key}`}
                    inputMode="decimal"
                    value={line.unitPriceDollars}
                    onChange={(e) =>
                      setLines((prev) =>
                        prev.map((l) =>
                          l.key === line.key
                            ? { ...l, unitPriceDollars: e.target.value }
                            : l,
                        ),
                      )
                    }
                    placeholder="0.00"
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => removeLine(line.key)}
                    disabled={lines.length <= 1 || pending}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <Button type="button" variant="secondary" onClick={addLine} disabled={pending}>
            Add line
          </Button>

          {fulfilmentIsDelivery ? (
            <div className="max-w-[10rem]">
              <Label htmlFor="delivery-fee">Delivery fee ($)</Label>
              <Input
                id="delivery-fee"
                inputMode="decimal"
                value={deliveryDollars}
                onChange={(e) => setDeliveryDollars(e.target.value)}
              />
            </div>
          ) : null}

          <div className="flex items-center justify-between border-t border-subtle pt-3">
            <span className="text-sm font-semibold text-heading">Invoice total</span>
            <span className="text-lg font-bold text-brand-700">
              {formatMoney(totalCents, currency)}
            </span>
          </div>

          <Button
            type="button"
            className="w-full"
            onClick={onSend}
            loading={pending}
            loadingLabel="Sending…"
          >
            {existingLines.length > 0 ? "Resend payment link" : "Send payment link"}
          </Button>
        </>
      ) : null}
    </div>
  );
}

'use client'

import { useState } from 'react'
import { Alert, Button, Input, Label, Field } from '@/components/ui'
import type { ClinicDto } from '@/lib/api/public-types'
import { formatMoney } from '@/lib/format/money'
import type { DetailsFormValues } from '@/lib/patient/schema'

/**
 * Matches HTML "Pay securely" step: Stripe-style card fields, charge now,
 * then pharmacy prepares the paid order. Demo only — no real charge.
 */
export function PaymentStep({
  clinic,
  details,
  onBack,
  onPaid,
}: {
  clinic: ClinicDto
  details: DetailsFormValues
  onBack: () => void
  onPaid: () => void
}) {
  const [paying, setPaying] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const deliveryFee =
    details.fulfilmentType === 'Delivery' ? clinic.deliveryFeeCents : 0
  const total = clinic.priceCents + deliveryFee
  const amount = formatMoney(total, clinic.currency)

  function handlePay() {
    setError(null)
    setPaying(true)
    window.setTimeout(() => {
      setPaying(false)
      onPaid()
    }, 1300)
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-display !text-xl font-bold text-heading sm:!text-2xl">
          Pay securely
        </h2>
        <p className="mt-1 text-sm text-fg-muted">
          Card details go straight to Stripe and never touch our servers. Amount
          charged now: <span className="font-semibold text-fg">{amount}</span>.
        </p>
      </div>

      <div className="space-y-3 rounded-card border border-line bg-surface p-4">
        <Field>
          <Label htmlFor="card">Card number</Label>
          <Input
            id="card"
            name="card"
            autoComplete="cc-number"
            defaultValue="4242 4242 4242 4242"
            readOnly
          />
        </Field>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field>
            <Label htmlFor="exp">Expiry</Label>
            <Input
              id="exp"
              name="exp"
              autoComplete="cc-exp"
              defaultValue="12 / 29"
              readOnly
            />
          </Field>
          <Field>
            <Label htmlFor="cvc">CVC</Label>
            <Input
              id="cvc"
              name="cvc"
              autoComplete="cc-csc"
              defaultValue="123"
              readOnly
            />
          </Field>
        </div>
      </div>

      {error ? (
        <Alert variant="danger" title="Payment failed">
          {error}
        </Alert>
      ) : null}

      <div className="flex flex-col gap-2 pt-1">
        <Button
          type="button"
          className="w-full"
          onClick={handlePay}
          loading={paying}
          loadingLabel="Processing payment…"
        >
          Pay {amount}
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="w-full"
          onClick={onBack}
          disabled={paying}
        >
          Back
        </Button>
      </div>
    </div>
  )
}

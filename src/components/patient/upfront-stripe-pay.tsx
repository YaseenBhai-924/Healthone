'use client'

import { useState } from 'react'
import { ShieldCheck } from 'lucide-react'
import { Alert, Button, Field, Input, Label } from '@/components/ui'

type Props = {
  amountLabel: string
  onBack: () => void
  onPaid: () => void
}

/** Local dummy Stripe — no secret key, no real charge. Accepts test card 4242… */
export function UpfrontStripePay({ amountLabel, onBack, onPaid }: Props) {
  const [card, setCard] = useState('4242 4242 4242 4242')
  const [exp, setExp] = useState('12 / 34')
  const [cvc, setCvc] = useState('123')
  const [paying, setPaying] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function normalizeCard(value: string) {
    return value.replace(/\D/g, '')
  }

  async function handlePay() {
    setError(null)
    const digits = normalizeCard(card)

    if (digits.length < 15) {
      setError('Enter a valid card number.')
      return
    }
    if (!exp.trim() || !cvc.trim()) {
      setError('Enter expiry and CVC.')
      return
    }

    // Dummy rules: 4242… succeeds; 4000 0000 0000 0002 declines.
    if (digits.startsWith('4000000000000002')) {
      setError('Your card was declined. (dummy Stripe test decline)')
      return
    }
    if (!digits.startsWith('4242') && !digits.startsWith('400005')) {
      setError('Use test card 4242 4242 4242 4242 for this dummy Stripe demo.')
      return
    }

    setPaying(true)
    await new Promise((r) => window.setTimeout(r, 1200))
    setPaying(false)
    onPaid()
  }

  return (
    <div className="space-y-4">
      <div className="rounded-card border border-line bg-canvas/80 px-4 py-3 text-sm leading-relaxed text-ink-muted">
        <p className="inline-flex items-center gap-2 font-semibold text-heading">
          <ShieldCheck className="h-4 w-4 text-brand-600" aria-hidden />
          Stripe test (dummy)
        </p>
        <p className="mt-1.5">
          No real charge. Card details stay in this browser for the demo only.
        </p>
      </div>

      <div className="space-y-3 rounded-card border border-line bg-brand-50/40 p-4">
        <Field>
          <Label htmlFor="dummy-card">Card number</Label>
          <Input
            id="dummy-card"
            name="card"
            inputMode="numeric"
            autoComplete="cc-number"
            value={card}
            onChange={(e) => setCard(e.target.value)}
            placeholder="4242 4242 4242 4242"
            className="border-line bg-surface"
          />
        </Field>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field>
            <Label htmlFor="dummy-exp">Expiry</Label>
            <Input
              id="dummy-exp"
              name="exp"
              autoComplete="cc-exp"
              value={exp}
              onChange={(e) => setExp(e.target.value)}
              placeholder="MM / YY"
              className="border-line bg-surface"
            />
          </Field>
          <Field>
            <Label htmlFor="dummy-cvc">CVC</Label>
            <Input
              id="dummy-cvc"
              name="cvc"
              inputMode="numeric"
              autoComplete="cc-csc"
              value={cvc}
              onChange={(e) => setCvc(e.target.value)}
              placeholder="123"
              className="border-line bg-surface"
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
          className="w-full rounded-badge"
          size="lg"
          loading={paying}
          loadingLabel="Processing payment…"
          onClick={() => void handlePay()}
        >
          Pay {amountLabel}
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="w-full"
          disabled={paying}
          onClick={onBack}
        >
          Back
        </Button>
      </div>
      <p className="text-center text-xs text-ink-muted">
        Test card{' '}
        <span className="font-mono font-medium text-heading">
          4242 4242 4242 4242
        </span>{' '}
        · any future expiry · any CVC
      </p>
    </div>
  )
}

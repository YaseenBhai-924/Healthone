'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { CheckCircle2 } from 'lucide-react'
import { Alert, Button, buttonVariants } from '@/components/ui'
import { lookupStatus } from '@/lib/api/public-client'
import { storeStatusToken } from '@/lib/patient/status-token'
import { cn } from '@/lib/cn'

const POLL_MS = 2000
const RATE_LIMIT_MS = 5000
const MAX_WAIT_MS = 90_000

/**
 * Matches HTML thank-you step when `upfrontPaid` is set: payment succeeded,
 * pharmacy notified, show reference. Legacy path still polls the API.
 */
export function ConfirmationStep({
  statusToken,
  email,
  clinicSlug,
  onOrderAnother,
  upfrontPaid,
}: {
  statusToken: string
  email: string
  clinicSlug: string
  onOrderAnother: () => void
  upfrontPaid?: { reference: string; amountLabel: string }
}) {
  const [reference, setReference] = useState<string | null>(
    upfrontPaid?.reference ?? null,
  )
  const [pending, setPending] = useState(!upfrontPaid)

  useEffect(() => {
    storeStatusToken(statusToken)
    if (upfrontPaid) {
      setReference(upfrontPaid.reference)
      setPending(false)
      return
    }

    let cancelled = false
    const started = Date.now()

    async function poll() {
      if (cancelled) return

      const result = await lookupStatus(statusToken)
      if (cancelled) return

      if (result.ok) {
        const status = result.data.status
        if (
          status === 'Submitted' ||
          status === 'InProgress' ||
          status === 'ReadyOrDispatched' ||
          status === 'Completed' ||
          status === 'Rejected'
        ) {
          setReference(result.data.reference)
          setPending(false)
          return
        }
      }

      const rateLimited = !result.ok && result.error.status === 429
      if (Date.now() - started >= MAX_WAIT_MS && !rateLimited) {
        setPending(false)
        return
      }
      if (Date.now() - started >= MAX_WAIT_MS * 2) {
        setPending(false)
        return
      }

      window.setTimeout(poll, rateLimited ? RATE_LIMIT_MS : POLL_MS)
    }

    void poll()
    return () => {
      cancelled = true
    }
  }, [statusToken, upfrontPaid])

  const paid = Boolean(upfrontPaid)

  return (
    <div className="space-y-5 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success-bg text-success shadow-[var(--shadow-sm)]">
        <CheckCircle2 className="h-9 w-9" aria-hidden />
      </div>
      <div>
        <h2 className="font-display !text-xl font-bold text-heading sm:!text-2xl">
          {reference
            ? paid
              ? 'Thank you for your payment'
              : 'Request submitted'
            : 'Submitting…'}
        </h2>
        <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">
          {reference
            ? paid
              ? `Payment of ${upfrontPaid?.amountLabel} succeeded. Your partner pharmacy has been notified and will prepare your order.`
              : 'Your partner pharmacy has been alerted. They will verify your script and email you a payment link.'
            : 'We are confirming your request. This usually takes a few seconds.'}
        </p>
      </div>

      {reference ? (
        <div className="rounded-card border border-brand-200/80 bg-brand-50/80 px-4 py-4">
          <p className="text-xs font-medium text-ink-muted">Your reference</p>
          <p className="mt-1 font-mono text-xl font-bold tracking-tight text-brand-700 whitespace-nowrap tabular-nums sm:text-2xl">
            {reference}
          </p>
        </div>
      ) : pending ? (
        <Alert variant="info" title="Confirming…">
          Please keep this page open while we finalise your request.
        </Alert>
      ) : (
        <Alert variant="warning" title="Still confirming">
          Confirmation is taking longer than usual. Check your email for the
          status link, or try Track order shortly.
        </Alert>
      )}

      <p className="text-sm leading-relaxed text-ink-muted">
        We emailed a private status link to{' '}
        <span className="font-semibold text-ink">{email}</span>.
      </p>

      <div className="space-y-3 pt-1">
        {!paid ? (
          <Link
            href="/status"
            className={cn(buttonVariants({ size: 'lg' }), 'w-full rounded-badge')}
            onClick={() => storeStatusToken(statusToken)}
          >
            Open my status
          </Link>
        ) : null}

        <Button
          type="button"
          variant={paid ? 'primary' : 'secondary'}
          className="w-full rounded-badge"
          onClick={onOrderAnother}
        >
          Order another prescription
        </Button>

        <Link
          href={`/c/${clinicSlug}`}
          className={cn(buttonVariants({ variant: 'ghost' }), 'w-full')}
        >
          Back to clinic
        </Link>
      </div>
    </div>
  )
}

'use client'

import { Check } from 'lucide-react'
import { cn } from '@/lib/cn'
import type {
  FulfilmentType,
  RequestStatus,
  StatusLookupResponse,
} from '@/lib/api/public-types'
import { Alert, RequestStatusBadge } from '@/components/ui'

const REJECTION_LABELS: Record<string, string> = {
  InvalidOrExpiredScript: 'Invalid or expired script',
  UnableToSupply: 'Unable to supply',
  CannotContactPatient: 'Could not contact you',
  DuplicateRequest: 'Duplicate request',
  Other: 'Other',
}

function timelineLabels(fulfilment: FulfilmentType): string[] {
  return [
    'Submitted',
    'Awaiting payment',
    'In progress',
    fulfilment === 'Delivery' ? 'Dispatched' : 'Ready for collection',
    'Completed',
  ]
}

function activeIndex(status: RequestStatus): number {
  switch (status) {
    case 'Submitted':
      return 0
    case 'PaymentPending':
      return 1
    case 'InProgress':
      return 2
    case 'ReadyOrDispatched':
      return 3
    case 'Completed':
      return 4
    default:
      return -1
  }
}

export function StatusView({ data }: { data: StatusLookupResponse }) {
  const rejected = data.status === 'Rejected'
  const labels = timelineLabels(data.fulfilmentType)
  const current = activeIndex(data.status)

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-ink-muted">
            Reference
          </p>
          <h1 className="mt-1.5 font-mono !text-xl font-bold tracking-tight text-heading whitespace-nowrap tabular-nums sm:!text-2xl">
            {data.reference ?? '—'}
          </h1>
          <p className="mt-2 text-sm text-ink-muted">
            {data.fulfilmentType === 'Delivery'
              ? 'Home delivery'
              : 'Click and collect'}
          </p>
        </div>
        <RequestStatusBadge status={data.status} />
      </div>

      {rejected ? (
        <Alert variant="danger" title="We could not process this request">
          <p>
            Reason:{' '}
            {REJECTION_LABELS[data.rejectionReason ?? ''] ??
              data.rejectionReason ??
              'See note below'}
            .
          </p>
          {data.rejectionNote ? (
            <p className="mt-2">{data.rejectionNote}</p>
          ) : null}
          {data.paymentStatus === 'Paid' ||
          data.paymentStatus === 'RefundPending' ||
          data.paymentStatus === 'Refunded' ||
          data.paymentStatus === 'RefundFailed' ? (
            <p className="mt-2">
              A refund has been started to your original payment method
              {data.paymentStatus === 'Refunded'
                ? ' and is complete'
                : data.paymentStatus === 'RefundPending'
                  ? ' and is in progress'
                  : ''}
              .
            </p>
          ) : null}
        </Alert>
      ) : null}

      {!rejected && data.status !== 'Draft' ? (
        <ol className="relative space-y-0 pl-1">
          <span
            aria-hidden
            className="absolute bottom-3 left-[15px] top-3 w-0.5 bg-brand-100"
          />
          {labels.map((label, i) => {
            const done = i <= current
            const currentStep = i === current
            return (
              <li key={label} className="relative flex items-start gap-3 py-2.5">
                <span
                  className={cn(
                    'relative z-[1] flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ring-4 ring-surface',
                    done
                      ? 'bg-brand-600 text-white'
                      : 'bg-brand-50 text-ink-muted',
                    currentStep && 'shadow-md shadow-brand-600/25',
                  )}
                  aria-hidden
                >
                  {done && i < current ? (
                    <Check className="h-3.5 w-3.5" strokeWidth={3} />
                  ) : (
                    i + 1
                  )}
                </span>
                <span
                  className={cn(
                    'pt-1 text-sm',
                    done
                      ? 'font-semibold text-heading'
                      : 'font-medium text-ink-muted',
                  )}
                >
                  {label}
                </span>
              </li>
            )
          })}
        </ol>
      ) : null}

      {data.status === 'Submitted' && data.paymentStatus === 'None' ? (
        <Alert variant="info" title="Awaiting pharmacy">
          The pharmacy is checking your script. You will receive an email with a
          secure payment link when your invoice is ready.
        </Alert>
      ) : null}

      {data.status === 'PaymentPending' ? (
        <Alert variant="info" title="Payment link sent">
          Check your email for the Stripe payment link from the pharmacy. After
          you pay, they will start dispensing.
        </Alert>
      ) : null}

      {data.detailsRemoved ? (
        <Alert variant="info" title="Details removed">
          Personal details for this request have been purged per our retention
          policy. The reference and status history remain.
        </Alert>
      ) : null}
    </div>
  )
}

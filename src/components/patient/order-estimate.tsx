'use client'

import { useState } from 'react'
import Link from 'next/link'
import { AnimatedNumber, SegmentedControl, buttonVariants } from '@/components/ui'
import { formatMoney } from '@/lib/format/money'
import { orderPage } from '@/lib/patient/copy'
import { cn } from '@/lib/cn'

export function OrderEstimate({
  clinicName,
  clinicHref,
  priceCents,
  deliveryFeeCents,
  currency,
  canOrder,
}: {
  clinicName: string
  clinicHref: string
  priceCents: number
  deliveryFeeCents: number
  currency: string
  canOrder: boolean
}) {
  const [mode, setMode] = useState<'collection' | 'delivery'>('collection')
  const delivery = mode === 'delivery' ? deliveryFeeCents : 0
  const total = priceCents + delivery
  const fmt = (n: number) => formatMoney(n, currency)

  return (
    <div className="rounded-hero border border-line bg-surface/95 p-6 shadow-md backdrop-blur-sm">
      <p className="text-sm text-ink-muted">Ordering with</p>
      <p className="font-display text-lg font-bold text-heading">{clinicName}</p>

      <div className="mt-5">
        <SegmentedControl
          label="Estimate fulfilment"
          value={mode}
          onChange={setMode}
          options={[
            { value: 'collection', label: 'Collection' },
            { value: 'delivery', label: 'Delivery' },
          ]}
        />
      </div>

      <dl className="mt-5 space-y-2 text-sm">
        <div className="flex justify-between gap-3">
          <dt className="text-ink-muted">Service fee from</dt>
          <dd className="font-semibold text-ink">
            <AnimatedNumber value={priceCents} format={fmt} />
          </dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-ink-muted">Delivery from</dt>
          <dd className="font-semibold text-ink">
            <AnimatedNumber value={delivery} format={fmt} />
          </dd>
        </div>
        <div className="flex justify-between gap-3 border-t border-line pt-2">
          <dt className="font-semibold text-ink">Estimated total</dt>
          <dd className="font-display text-lg font-bold text-brand-700">
            <AnimatedNumber value={total} format={fmt} />
          </dd>
        </div>
      </dl>

      <p className="mt-3 text-xs text-ink-muted">
        Estimate only. You confirm and pay securely on the next steps.
      </p>

      {canOrder ? (
        <Link
          href={clinicHref}
          className={cn(buttonVariants({ size: 'lg' }), 'mt-5 w-full')}
        >
          {orderPage.cta}
        </Link>
      ) : (
        <p className="mt-5 rounded-control bg-warning-bg px-3 py-2 text-sm font-semibold text-warning">
          Ordering is paused for this clinic. Please try again later.
        </p>
      )}

      <p className="mt-4 text-center text-sm text-ink-muted">
        Already ordered?{' '}
        <Link
          href="/status/lost-link"
          className="font-semibold text-brand-700 underline-offset-2 hover:underline"
        >
          Resend your status link
        </Link>
      </p>
    </div>
  )
}

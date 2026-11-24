import Link from 'next/link'
import {
  ArrowRight,
  Check,
  Pill,
  Scale,
  ShieldCheck,
  Store,
} from 'lucide-react'
import type { FeaturedPriceComparisonDto } from '@/lib/api/public-types'
import { formatMoney } from '@/lib/format/money'
import { cn } from '@/lib/cn'

const TRUST_FALLBACK = {
  title: 'Partner pharmacy prices built for value.',
  body: 'Script Direct works with partner pharmacies so you can see clear fees before you pay — no surprise markups at the counter.',
}

function ValueUnderline() {
  return (
    <svg
      viewBox="0 0 120 12"
      className="pointer-events-none absolute left-0 top-full -mt-[0.08em] h-auto w-full text-mint-500/90"
      aria-hidden
    >
      <path
        d="M2 8 C 28 2, 55 10, 78 5 S 108 4, 118 7"
        fill="none"
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

function ComparisonBars({
  featured,
  others,
}: {
  featured: FeaturedPriceComparisonDto
  others: FeaturedPriceComparisonDto['competitors']
}) {
  const maxPrice = Math.max(
    featured.ourPriceCents,
    ...others.map((c) => c.priceCents),
    1,
  )
  const rows = [
    {
      name: featured.partnerPharmacyName,
      priceCents: featured.ourPriceCents,
      deltaCents: 0,
      partner: true,
    },
    ...others.map((c) => ({
      name: c.pharmacyName,
      priceCents: c.priceCents,
      deltaCents: c.deltaCents,
      partner: false,
    })),
  ]

  return (
    <ul className="space-y-4">
      {rows.map((row) => {
        const widthPct = Math.max(8, Math.round((row.priceCents / maxPrice) * 100))
        return (
          <li key={`${row.name}-${row.priceCents}`}>
            <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
              <span className="inline-flex min-w-0 items-center gap-1.5 font-medium text-ink">
                {!row.partner ? (
                  <Store className="h-3.5 w-3.5 shrink-0 text-ink-muted" aria-hidden />
                ) : null}
                <span className="truncate">{row.name}</span>
              </span>
              <span className="shrink-0 tabular-nums">
                <span className="font-semibold text-heading">
                  {formatMoney(row.priceCents, featured.currency)}
                </span>
                {!row.partner && row.deltaCents > 0 ? (
                  <span className="ml-1.5 text-xs font-medium text-ink-muted">
                    (+{formatMoney(row.deltaCents, featured.currency)})
                  </span>
                ) : null}
              </span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-canvas">
              <div
                className={cn(
                  'h-full rounded-full transition-[width] duration-500',
                  row.partner
                    ? 'bg-gradient-to-r from-brand-600 to-mint-500'
                    : 'bg-ink/20',
                )}
                style={{ width: `${widthPct}%` }}
              />
            </div>
          </li>
        )
      })}
    </ul>
  )
}

function MarketingColumn({
  medicineName,
  orderHref,
}: {
  medicineName?: string
  orderHref: string
}) {
  return (
    <div className="flex flex-col justify-center">
      <p className="inline-flex w-fit items-center gap-2 rounded-full border border-mint-200 bg-mint-50 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-mint-800">
        <Scale className="h-3.5 w-3.5" aria-hidden />
        Fair pricing
      </p>

      <h2 className="sd-display sd-display-lg mt-5 text-heading">
        Partner pharmacy prices built for{' '}
        <em className="relative inline-block not-italic text-brand-600">
          value
          <ValueUnderline />
        </em>
        .
      </h2>

      <p className="mt-4 max-w-md text-[15px] leading-relaxed text-ink-muted sm:text-base">
        {medicineName
          ? `See how ${medicineName} compares with other pharmacies — partner pricing designed to keep everyday scripts affordable.`
          : TRUST_FALLBACK.body}
      </p>

      <ul className="mt-6 space-y-4">
        <li className="flex items-start gap-3 text-[15px] leading-relaxed text-ink">
          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-mint-100 text-mint-700">
            <Check className="h-3 w-3" strokeWidth={3} aria-hidden />
          </span>
          <span>
            <strong className="font-semibold text-heading">Clear before you pay.</strong>{' '}
            <span className="text-ink-muted">
              No surprise checkout. Amounts appear on your payment link after the
              pharmacy checks your script.
            </span>
          </span>
        </li>
        <li className="flex items-start gap-3 text-[15px] leading-relaxed text-ink">
          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-mint-100 text-mint-700">
            <Check className="h-3 w-3" strokeWidth={3} aria-hidden />
          </span>
          <span>
            <strong className="font-semibold text-heading">Compared for fairness.</strong>{' '}
            <span className="text-ink-muted">
              HealthOne monitors typical retail pricing so partner offers stay
              competitive for everyday scripts.
            </span>
          </span>
        </li>
      </ul>

      <Link
        href={orderHref}
        className="sd-sheen group mt-8 inline-flex h-12 w-fit items-center gap-2.5 rounded-full bg-brand-600 pl-6 pr-2 text-sm font-semibold text-white shadow-[var(--shadow-glow)] transition-[background-color,transform] duration-200 hover:-translate-y-0.5 hover:bg-brand-700 focus-ring"
      >
        Start online order
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 transition-transform duration-300 group-hover:translate-x-0.5">
          <ArrowRight className="h-4 w-4" aria-hidden />
        </span>
      </Link>
    </div>
  )
}

function ComparisonCard({
  featured,
}: {
  featured: FeaturedPriceComparisonDto
}) {
  const others = featured.competitors.slice(0, 3)
  const lowestOther = Math.min(...others.map((c) => c.priceCents))

  return (
    <div
      className="rounded-[1.75rem] border border-ink/[0.06] bg-white p-5 shadow-[0_28px_60px_-28px_rgb(15_42_74/0.35)] sm:p-7"
      data-testid="featured-price-card"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-sm">
            <Pill className="h-5 w-5" aria-hidden />
          </span>
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-brand-600">
              Price comparison
            </p>
            <h3 className="mt-1 font-display text-xl font-extrabold tracking-tight text-heading sm:text-2xl">
              {featured.medicineName}
            </h3>
          </div>
        </div>
        <span className="shrink-0 rounded-full bg-mint-100 px-3 py-1.5 text-xs font-bold text-mint-800 ring-1 ring-mint-200">
          Save up to {formatMoney(featured.maxSavingCents, featured.currency)}
        </span>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-mint-200 bg-mint-50/80 p-4">
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-mint-800">
            Partner Pharmacy
          </p>
          <p className="mt-2 text-sm font-semibold text-heading">
            {featured.partnerPharmacyName}
          </p>
          <p className="mt-3 font-display text-3xl font-extrabold tabular-nums text-heading">
            {formatMoney(featured.ourPriceCents, featured.currency)}
          </p>
          <p className="mt-1 text-xs text-ink-muted">Our compared price</p>
        </div>

        <div className="rounded-2xl border border-ink/[0.08] bg-canvas/60 p-4">
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-ink-muted">
            Other pharmacies
          </p>
          <p className="mt-2 font-display text-3xl font-extrabold tabular-nums text-heading">
            <span className="text-base font-semibold text-ink-muted">from </span>
            {formatMoney(lowestOther, featured.currency)}
          </p>
          <ul className="mt-3 space-y-1.5">
            {others.map((c) => (
              <li
                key={`${c.pharmacyName}-${c.priceCents}`}
                className="flex items-center justify-between gap-2 text-sm"
              >
                <span className="truncate text-ink-muted">{c.pharmacyName}</span>
                <span className="shrink-0 font-semibold tabular-nums text-heading">
                  {formatMoney(c.priceCents, featured.currency)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-6 border-t border-ink/[0.06] pt-5">
        <ComparisonBars featured={featured} others={others} />
      </div>

      <div className="mt-6 flex items-start gap-2.5 rounded-2xl border border-brand-100 bg-brand-50/70 px-3.5 py-3 text-sm leading-relaxed text-ink-muted">
        <ShieldCheck
          className="mt-0.5 h-4 w-4 shrink-0 text-brand-600"
          aria-hidden
        />
        <p>
          Guide comparison only. You are not charged until the pharmacy verifies
          your script and emails a secure Stripe payment link.
        </p>
      </div>
    </div>
  )
}

export function FeaturedPriceSection({
  featured,
  className,
  orderHref = '/order',
  compact = false,
}: {
  featured: FeaturedPriceComparisonDto | null
  className?: string
  orderHref?: string
  /** Card-only (e.g. clinic landing). Homepage uses the full split layout. */
  compact?: boolean
}) {
  if (!featured || featured.competitors.length === 0) {
    return (
      <div
        className={cn(
          'grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12',
          className,
        )}
        data-testid="featured-price-fallback"
      >
        <MarketingColumn orderHref={orderHref} />
        <div className="rounded-[1.75rem] border border-ink/[0.06] bg-white p-7 shadow-[0_28px_60px_-28px_rgb(15_42_74/0.28)]">
          <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-brand-700">
            <Scale className="h-4 w-4" aria-hidden />
            Fair pricing
          </p>
          <h3 className="sd-display sd-display-md mt-4">{TRUST_FALLBACK.title}</h3>
          <p className="mt-3 text-[15px] leading-relaxed text-ink-muted">
            {TRUST_FALLBACK.body}
          </p>
        </div>
      </div>
    )
  }

  if (compact) {
    return (
      <div className={className} data-testid="featured-price-section">
        <ComparisonCard featured={featured} />
      </div>
    )
  }

  return (
    <div
      className={cn(
        'grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12',
        className,
      )}
      data-testid="featured-price-section"
    >
      <MarketingColumn
        medicineName={featured.medicineName}
        orderHref={orderHref}
      />
      <ComparisonCard featured={featured} />
    </div>
  )
}

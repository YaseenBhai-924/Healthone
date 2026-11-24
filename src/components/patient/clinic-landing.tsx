'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import {
  MapPin,
  ClipboardPaste,
  Package,
  Mail,
  CreditCard,
  ArrowRight,
  QrCode,
  ShieldCheck,
} from 'lucide-react'
import { ClinicBrandingProvider } from '@/components/branding/clinic-branding'
import { ClinicLogo } from '@/components/branding/clinic-logo'
import { CollectionPharmacyAddress } from '@/components/patient/collection-pharmacy-address'
import { FeaturedPriceSection } from '@/components/patient/featured-price-section'
import { Alert, IconBadge } from '@/components/ui'
import { buttonVariants } from '@/components/ui/button-variants'
import type {
  ClinicDto,
  FeaturedPriceComparisonDto,
} from '@/lib/api/public-types'
import { formatMoney } from '@/lib/format/money'
import { howItWorks } from '@/lib/patient/copy'
import type { ClinicBrand } from '@/lib/branding'
import { cn } from '@/lib/cn'

const stepIcons = [ClipboardPaste, Package, Mail, CreditCard]

function toBrand(clinic: ClinicDto): ClinicBrand {
  const label = clinic.pharmacyName?.trim() || clinic.name
  return {
    name: label,
    pharmacyName: label,
    primaryColor: clinic.brandColour || '#2563eb',
    logoUrl: clinic.logoUrl ?? undefined,
    slug: clinic.slug,
  }
}

export function ClinicLanding({
  clinic,
  fromQr,
  featured = null,
}: {
  clinic: ClinicDto
  fromQr: boolean
  featured?: FeaturedPriceComparisonDto | null
}) {
  useEffect(() => {
    if (!fromQr) return
    try {
      window.dispatchEvent(
        new CustomEvent('sd-qr-scan', {
          detail: { clinicSlug: clinic.slug },
        }),
      )
    } catch {
      /* ignore */
    }
  }, [clinic.slug, fromQr])

  const brand = toBrand(clinic)
  const displayName = clinic.pharmacyName?.trim() || clinic.name

  return (
    <ClinicBrandingProvider brand={brand}>
      <main className="relative overflow-hidden px-4 py-8 sm:py-12">
        <div className="sd-blob sd-blob-a -left-16 top-0 opacity-60" aria-hidden />
        <div className="sd-blob sd-blob-b right-0 top-32 opacity-50" aria-hidden />

        <div className="relative mx-auto w-full max-w-2xl space-y-6 sm:max-w-3xl">
          <div className="reveal-up overflow-hidden rounded-hero border border-line bg-surface shadow-lg">
            <div className="relative overflow-hidden sd-mesh px-6 pb-7 pt-7 sm:px-10">
              <div className="sd-dot-grid absolute inset-0 opacity-40" aria-hidden />
              <div className="relative">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <ClinicLogo height={36} width={120} />
                    <span className="inline-flex items-center gap-2 rounded-badge border border-brand-200/80 bg-white/90 px-3 py-1 text-xs font-semibold text-brand-700 shadow-sm">
                      <MapPin className="h-3.5 w-3.5" aria-hidden />
                      <span className="truncate">{displayName}</span>
                    </span>
                  </div>
                  {fromQr ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600">
                      <QrCode className="h-3.5 w-3.5" aria-hidden />
                      QR scan
                    </span>
                  ) : null}
                </div>

                <h1 className="font-display mt-6 !text-[1.5rem] font-extrabold leading-snug tracking-tight text-heading sm:!text-[1.85rem] lg:!text-[2rem]">
                  Get your script delivered or ready to collect
                </h1>
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-muted sm:text-base">
                  Fulfilled by your clinic&apos;s partner pharmacy via Script
                  Direct. No account needed.
                </p>
              </div>
            </div>

            <div className="space-y-6 px-6 py-6 sm:px-10 sm:pb-8">
              {!clinic.orderingEnabled ? (
                <Alert variant="warning" title="Ordering paused">
                  Ordering is temporarily unavailable. Please try again later.
                </Alert>
              ) : null}

              <CollectionPharmacyAddress
                pharmacyName={clinic.pharmacyName || clinic.name}
                pharmacyAddress={clinic.pharmacyAddress}
              />

              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand-700">
                  How it works
                </p>
                <ol className="mt-4 grid gap-3 sm:grid-cols-2">
                  {howItWorks.map((step, i) => {
                    const Icon = stepIcons[i]!
                    return (
                      <li
                        key={step.title}
                        className="flex items-start gap-3 rounded-card border border-line bg-brand-50/50 px-3 py-3 transition-colors hover:bg-brand-50"
                      >
                        <IconBadge
                          icon={Icon}
                          className="h-9 w-9 shrink-0 [&_svg]:h-4 [&_svg]:w-4"
                        />
                        <div className="min-w-0">
                          <p className="text-[11px] font-bold uppercase tracking-wide text-brand-500">
                            Step {i + 1}
                          </p>
                          <p className="text-sm font-semibold text-heading">
                            {step.title}
                          </p>
                        </div>
                      </li>
                    )
                  })}
                </ol>
              </div>

              <div className="rounded-card border border-line bg-canvas/80 px-4 py-3 text-sm leading-relaxed text-ink-muted">
                <p className="inline-flex items-center gap-2 font-semibold text-heading">
                  <ShieldCheck className="h-4 w-4 text-brand-600" aria-hidden />
                  Pay securely upfront
                </p>
                <p className="mt-1.5">
                  Guide price from{' '}
                  <span className="font-semibold text-heading">
                    {formatMoney(clinic.priceCents, clinic.currency)}
                  </span>
                  {clinic.deliveryFeeCents > 0 ? (
                    <>
                      {' '}
                      (delivery from{' '}
                      {formatMoney(clinic.deliveryFeeCents, clinic.currency)}).
                    </>
                  ) : (
                    '.'
                  )}{' '}
                  You pay on the next steps. The pharmacy then prepares your
                  paid order.
                </p>
              </div>

              {clinic.orderingEnabled ? (
                <Link
                  href={`/c/${clinic.slug}/request`}
                  className={cn(
                    buttonVariants({ size: 'lg' }),
                    'group w-full rounded-badge',
                  )}
                >
                  Start my request
                  <ArrowRight
                    className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
                    aria-hidden
                  />
                </Link>
              ) : (
                <Link
                  href="/contact"
                  className={cn(
                    buttonVariants({ variant: 'secondary', size: 'lg' }),
                    'w-full rounded-badge',
                  )}
                >
                  Contact support
                </Link>
              )}
            </div>
          </div>

          <FeaturedPriceSection
            featured={featured}
            compact
            orderHref={`/c/${clinic.slug}/request`}
          />
        </div>
      </main>
    </ClinicBrandingProvider>
  )
}

import type { Metadata } from 'next'
import { Check, ChevronDown } from 'lucide-react'
import { PageHero, Container, pageHeroContentClass } from '@/components/site'
import { OrderEstimate } from '@/components/patient/order-estimate'
import { EmailLinkArt, SmsTokenArt } from '@/components/patient/illustrations'
import { howItWorks, orderPage } from '@/lib/patient/copy'
import { clinicDisplayName } from '@/lib/patient/mock-clinic'
import { getDefaultClinicServer } from '@/lib/api/public-server'

export const metadata: Metadata = {
  title: 'Order online',
  description: orderPage.support,
  alternates: { canonical: '/order' },
}

export default async function OrderPage() {
  const clinic = await getDefaultClinicServer()
  const canOrder = Boolean(clinic?.orderingEnabled)
  const clinicHref = clinic ? `/c/${clinic.slug}/request` : '#'
  const displayName = clinic ? clinicDisplayName(clinic) : 'Partner pharmacy'

  return (
    <main>
      <PageHero title={orderPage.headline} lead={orderPage.support} />

      <Container
        className={`grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-12 ${pageHeroContentClass}`}
      >
        <div>
          <h2 className="font-display text-xl font-bold text-heading">
            What you will need
          </h2>
          <ul className="mt-4 space-y-3">
            {[
              'eScript token from your SMS or email prescription',
              'Mobile number and email for status updates',
              'Delivery address if you choose delivery',
            ].map((item) => (
              <li
                key={item}
                className="flex items-start gap-3 text-sm font-medium text-ink"
              >
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-success-bg text-success">
                  <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden />
                </span>
                {item}
              </li>
            ))}
          </ul>

          <details className="group mt-8 rounded-card border border-line bg-surface p-4 open:bg-brand-50/40">
            <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-2 font-semibold text-heading marker:content-none [&::-webkit-details-marker]:hidden">
              Where do I find my eScript token?
              <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" aria-hidden />
            </summary>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="rounded-card border border-line bg-white p-3">
                <SmsTokenArt className="h-12 w-12" />
                <p className="mt-2 text-sm font-semibold text-ink">SMS</p>
                <p className="mt-1 text-xs text-ink-muted">
                  Open the prescription message and copy the short token code.
                </p>
              </div>
              <div className="rounded-card border border-line bg-white p-3">
                <EmailLinkArt className="h-12 w-12" />
                <p className="mt-2 text-sm font-semibold text-ink">Email</p>
                <p className="mt-1 text-xs text-ink-muted">
                  Find the eScript email and copy the token shown near the top.
                </p>
              </div>
            </div>
          </details>

          <ol className="mt-10 flex flex-wrap gap-2">
            {howItWorks.map((step, i) => (
              <li
                key={step.title}
                className="inline-flex items-center gap-2 rounded-badge border border-line bg-surface px-3 py-2 text-xs font-semibold text-ink-muted"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-100 text-brand-700">
                  {i + 1}
                </span>
                {step.title}
              </li>
            ))}
          </ol>
        </div>

        <div className="lg:sticky lg:top-24 lg:self-start space-y-3">
          <OrderEstimate
            clinicName={displayName}
            clinicHref={clinicHref}
            priceCents={clinic?.priceCents ?? 0}
            deliveryFeeCents={clinic?.deliveryFeeCents ?? 0}
            currency={clinic?.currency ?? 'AUD'}
            canOrder={canOrder}
            pharmacyName={clinic?.pharmacyName}
            pharmacyAddress={clinic?.pharmacyAddress}
            unavailableMessage={
              clinic
                ? 'Ordering is paused for this clinic. Please try again later.'
                : 'Ordering is temporarily unavailable. We could not load a clinic — please try again shortly.'
            }
          />
        </div>
      </Container>
    </main>
  )
}

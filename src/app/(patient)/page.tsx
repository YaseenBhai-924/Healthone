import Link from 'next/link'
import {
  ArrowRight,
  BadgeDollarSign,
  Check,
  Pill,
  QrCode,
  ScanSearch,
  Search,
  ShieldCheck,
  Store,
  Mail,
} from 'lucide-react'
import { Container, Section } from '@/components/site'
import { OrderJourneyPreview } from '@/components/patient/order-journey-preview'
import { HowItWorksStepper } from '@/components/patient/how-it-works-stepper'
import { FulfilmentToggle } from '@/components/patient/fulfilment-toggle'
import { FeaturedPriceSection } from '@/components/patient/featured-price-section'
import { TrustBento } from '@/components/patient/trust-bento'
import { FaqSection } from '@/components/patient/faq-section'
import { CtaBand } from '@/components/patient/cta-band'
import { heroChips, homeHero, proofPoints } from '@/lib/patient/copy'
import {
  getDefaultClinicServer,
  getFeaturedComparisonServer,
} from '@/lib/api/public-server'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Home',
  description: homeHero.support,
  alternates: { canonical: '/' },
}

const proofIcons = [BadgeDollarSign, Mail, ShieldCheck, Store] as const

/** Hand-drawn underline that draws itself under the highlighted word. */
function Underline() {
  return (
    <svg
      viewBox="0 0 300 20"
      className="pointer-events-none absolute left-0 top-full -mt-[0.14em] h-auto w-full text-brand-500/80"
      aria-hidden
    >
      <path
        className="sd-draw"
        pathLength={1}
        d="M4 13 C 52 4, 112 18, 168 8 S 262 6, 296 12"
        fill="none"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinecap="round"
      />
    </svg>
  )
}

export default async function HomePage() {
  const highlight = homeHero.highlightWord
  const parts = homeHero.headline.split(new RegExp(`(${highlight})`, 'i'))
  const [featured, clinic] = await Promise.all([
    getFeaturedComparisonServer(),
    getDefaultClinicServer(),
  ])

  return (
    <main>
      {/* 1. HERO */}
      <section className="relative -mt-[76px] overflow-hidden">
        <div className="sd-grid-lines absolute inset-0" aria-hidden />
        <div className="sd-orb sd-orb-1 -left-24 top-0 h-[26rem] w-[26rem]" aria-hidden />
        <div className="sd-orb sd-orb-2 right-[-6rem] top-10 h-[28rem] w-[28rem]" aria-hidden />
        <div className="sd-orb sd-orb-3 bottom-0 left-1/3 h-[20rem] w-[20rem]" aria-hidden />
        <div className="sd-noise absolute inset-0 opacity-25" aria-hidden />

        <Container className="relative grid items-center gap-20 pb-24 pt-[calc(76px+2.5rem)] lg:grid-cols-[1.08fr_0.92fr] lg:gap-10 lg:pb-36 lg:pt-[calc(76px+4rem)]">
          <div>
            <p className="reveal-up inline-flex items-center gap-2 rounded-full border border-white bg-white/70 py-1.5 pl-1.5 pr-4 text-[13px] font-semibold text-ink shadow-sm backdrop-blur">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-600 text-white">
                <Pill className="h-3.5 w-3.5" aria-hidden />
              </span>
              {homeHero.eyebrow}
            </p>

            <h1 className="sd-display sd-display-xl reveal-up mt-7 [animation-delay:80ms]">
              {parts.map((part, i) =>
                part.toLowerCase() === highlight.toLowerCase() ? (
                  <em key={i} className="relative inline-block">
                    {part}
                    <Underline />
                  </em>
                ) : (
                  <span key={i}>{part}</span>
                ),
              )}
            </h1>

            <p className="lead reveal-up mt-8 max-w-[34rem] text-[1.1875rem] text-ink-muted [animation-delay:160ms]">
              {homeHero.support}
            </p>

            <div className="reveal-up mt-10 flex flex-wrap items-center gap-3 [animation-delay:240ms]">
              <Link
                href="/order"
                className="sd-sheen group inline-flex h-14 items-center gap-3 rounded-full bg-brand-600 pl-7 pr-2 text-base font-semibold text-white shadow-[var(--shadow-glow)] transition-[background-color,transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:bg-brand-700 focus-ring"
              >
                {homeHero.primaryCta}
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 transition-transform duration-300 group-hover:translate-x-0.5">
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </span>
              </Link>
              <Link
                href="/status/lost-link"
                className="group inline-flex h-14 items-center gap-2.5 rounded-full border border-ink/15 bg-white/70 px-6 text-base font-semibold text-ink backdrop-blur transition-[background-color,border-color,transform] duration-200 hover:-translate-y-0.5 hover:border-brand-300 hover:bg-white focus-ring"
              >
                <Search className="h-4 w-4 text-brand-600" aria-hidden />
                {homeHero.secondaryCta}
              </Link>
            </div>

            <ul className="reveal-up mt-8 flex flex-wrap gap-x-5 gap-y-2 [animation-delay:320ms]">
              {heroChips.map((chip) => (
                <li key={chip} className="inline-flex items-center gap-2 text-sm font-medium text-ink">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-mint-100 text-mint-700">
                    <Check className="h-3 w-3" strokeWidth={3} aria-hidden />
                  </span>
                  {chip}
                </li>
              ))}
            </ul>

            <p className="reveal-up mt-8 flex max-w-md items-start gap-2.5 text-sm text-ink-muted [animation-delay:400ms]">
              <QrCode className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" aria-hidden />
              {homeHero.qrHint}
            </p>
          </div>

          <div className="reveal-up [animation-delay:200ms]">
            <OrderJourneyPreview />
          </div>
        </Container>
      </section>

      {/* 2. PROOF RIBBON */}
      <div className="relative border-y border-ink/[0.07] bg-white">
        <Container>
          <ul className="grid grid-cols-1 divide-y divide-ink/[0.07] sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4 lg:divide-x">
            {proofPoints.map((point, i) => {
              const Icon = proofIcons[i] ?? ScanSearch
              return (
                <li
                  key={point}
                  className="flex items-center gap-3 px-1 py-5 text-[15px] font-medium text-ink sm:px-6 sm:first:pl-1"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                    <Icon className="h-[18px] w-[18px]" aria-hidden />
                  </span>
                  {point}
                </li>
              )
            })}
          </ul>
        </Container>
      </div>

      {/* 3. HOW IT WORKS */}
      <Section id="how-it-works" tone="white">
        <HowItWorksStepper
          eyebrow="How it works"
          title={
            <>
              Four clear <em>steps</em>
            </>
          }
          lead="Submit first. Pay only after the pharmacy verifies your script and emails a Stripe link."
        />
      </Section>

      {/* 3b. FEATURED FAIR PRICING — split marketing + comparison card */}
      <Section id="fair-pricing" tone="canvas">
        <FeaturedPriceSection featured={featured} orderHref="/order" />
      </Section>

      {/* 4. DELIVERY OR COLLECTION */}
      <Section
        tone="white"
        eyebrow="Fulfilment"
        title={
          <>
            Delivery or <em>collection</em>
          </>
        }
        lead="Same secure flow either way. Fees that apply are shown before you pay."
      >
        <FulfilmentToggle
          pharmacyName={clinic?.pharmacyName}
          pharmacyAddress={clinic?.pharmacyAddress}
        />
      </Section>

      {/* 5. TRUST */}
      <Section
        tone="dark"
        eyebrow="Built for trust"
        title={
          <>
            Designed around <em>patient privacy</em>
          </>
        }
      >
        <TrustBento />
      </Section>

      {/* 6. FAQ */}
      <FaqSection />

      {/* 7. FINAL CTA (overlaps the footer) */}
      <CtaBand />
    </main>
  )
}

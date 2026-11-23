'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import {
  ArrowUp,
  ArrowUpRight,
  Facebook,
  Instagram,
  Linkedin,
  Lock,
  ShieldCheck,
  Store,
} from 'lucide-react'
import { brandName } from '@/lib/patient/copy'
import { BrandMark } from './brand-mark'
import { Container } from './container'

type Social = { label: string; href: string; Icon: typeof Linkedin }

/** Real HealthOne profiles; env vars override when set. */
const DEFAULT_SOCIAL: Social[] = [
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/company/healthone-plus-one',
    Icon: Linkedin,
  },
  {
    label: 'Facebook',
    href: 'https://www.facebook.com/healthonegroup',
    Icon: Facebook,
  },
]

function socialFromEnv(): Social[] {
  const linkedIn = process.env.NEXT_PUBLIC_LINKEDIN_URL
  const facebook = process.env.NEXT_PUBLIC_FACEBOOK_URL
  const instagram = process.env.NEXT_PUBLIC_INSTAGRAM_URL

  const items: Social[] = [
    {
      label: 'LinkedIn',
      href: linkedIn || DEFAULT_SOCIAL[0]!.href,
      Icon: Linkedin,
    },
    {
      label: 'Facebook',
      href: facebook || DEFAULT_SOCIAL[1]!.href,
      Icon: Facebook,
    },
  ]

  if (instagram) {
    items.push({
      label: 'Instagram',
      href: instagram,
      Icon: Instagram,
    })
  }

  return items
}

const patientLinks = [
  { href: '/order', label: 'Online ordering' },
  { href: '/status/lost-link', label: 'Track order' },
  { href: '/contact', label: 'Contact' },
] as const

const legalLinks = [
  { href: '/privacy', label: 'Privacy notice' },
  { href: '/terms', label: 'Terms of use' },
] as const

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="group inline-flex min-h-9 items-center gap-1 text-[15px] font-medium text-white/75 transition-colors hover:text-white focus-ring rounded-sm"
    >
      {children}
      <ArrowUpRight
        className="h-3.5 w-3.5 -translate-x-1 opacity-0 transition-[opacity,transform] duration-200 group-hover:translate-x-0 group-hover:opacity-100"
        aria-hidden
      />
    </Link>
  )
}

export function SiteFooter() {
  const [showTop, setShowTop] = useState(false)
  const social = socialFromEnv()

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 640)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <footer className="sd-dark relative isolate mt-auto overflow-hidden bg-ink-950 text-white no-print">
      <div className="sd-grid-lines-dark absolute inset-0 -z-10" aria-hidden />
      <div className="sd-orb sd-orb-1 -left-40 top-20 -z-10 h-96 w-96 opacity-40" aria-hidden />

      {/* Giant watermark wordmark bleeding off the bottom edge */}
      <p
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 translate-y-[32%] select-none text-center font-[family-name:var(--font-editorial)] text-[clamp(5rem,19vw,17rem)] leading-none tracking-tight text-transparent [-webkit-text-stroke:1.5px_rgb(255_255_255/0.09)]"
      >
        {brandName}
      </p>

      <Container className="grid gap-12 pb-14 pt-32 sm:pt-36 md:grid-cols-[1.6fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-2.5">
            <BrandMark tone="light" />
            <p className="text-lg font-semibold tracking-tight">{brandName}</p>
          </div>
          <p className="mt-5 max-w-sm text-[15px] leading-relaxed text-white/70">
            Private eScript ordering for patients, fulfilled by your
            clinic&apos;s partner pharmacy. A HealthOne service. No patient
            accounts.
          </p>
          {social.length > 0 ? (
            <ul className="mt-6 flex items-center gap-2">
              {social.map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={item.label}
                    className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/85 transition-[background-color,transform,color] duration-200 hover:-translate-y-0.5 hover:bg-brand-600 hover:text-white focus-ring"
                  >
                    <item.Icon className="h-4 w-4" aria-hidden />
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <nav aria-label="Patients">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-200">Patients</p>
          <ul className="mt-4 space-y-1">
            {patientLinks.map((l) => (
              <li key={l.href}>
                <FooterLink href={l.href}>{l.label}</FooterLink>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Legal">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-200">Legal</p>
          <ul className="mt-4 space-y-1">
            {legalLinks.map((l) => (
              <li key={l.href}>
                <FooterLink href={l.href}>{l.label}</FooterLink>
              </li>
            ))}
          </ul>
        </nav>
      </Container>

      <Container>
        <ul className="flex flex-wrap gap-2.5 border-t border-white/10 pt-8">
          {[
            { Icon: Lock, label: 'Secure Stripe payment link' },
            { Icon: ShieldCheck, label: 'No account, no password' },
            { Icon: Store, label: 'Dispensed by your partner pharmacy' },
          ].map(({ Icon, label }) => (
            <li
              key={label}
              className="inline-flex items-center gap-2 rounded-full bg-white/[0.06] px-3.5 py-2 text-[13px] font-medium text-white/80 ring-1 ring-white/10"
            >
              <Icon className="h-3.5 w-3.5 text-mint-300" aria-hidden />
              {label}
            </li>
          ))}
        </ul>
      </Container>

      <Container className="relative pb-[clamp(4rem,10vw,9rem)] pt-8 text-xs leading-relaxed text-white/60">
        <p>
          © {new Date().getFullYear()} HealthOne. Script Direct does not
          dispense medicines. Your partner pharmacy does.
        </p>
      </Container>

      <button
        type="button"
        aria-label="Back to top"
        tabIndex={showTop ? 0 : -1}
        aria-hidden={!showTop}
        className={
          'fixed bottom-5 right-5 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-ink-950 text-white shadow-[0_18px_36px_-12px_rgb(7_23_44/0.7)] ring-1 ring-white/20 transition-[opacity,transform,background-color] duration-300 hover:bg-brand-600 focus-ring ' +
          (showTop ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-3 opacity-0')
        }
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      >
        <ArrowUp className="h-5 w-5" aria-hidden />
      </button>
    </footer>
  )
}

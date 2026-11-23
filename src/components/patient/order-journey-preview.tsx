'use client'

import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { Check, Mail, Pause, Play, Store } from 'lucide-react'
import { PhoneFrame } from '@/components/site/phone-frame'
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion'
import { useTypeIn } from '@/hooks/use-type-in'
import { cn } from '@/lib/cn'

const stages = [
  {
    id: 'submitted',
    label: 'Order submitted',
    short: 'Submitted',
    badge: 'Submitted',
    badgeClass: 'bg-brand-100 text-brand-700',
    body: 'We have your eScript details. The pharmacy will verify next.',
  },
  {
    id: 'verifying',
    label: 'Pharmacy verifying',
    short: 'Verifying',
    badge: 'Verifying',
    badgeClass: 'bg-warning-bg text-warning',
    body: 'Sample Pharmacy A is checking your script before invoicing.',
  },
  {
    id: 'payment',
    label: 'Payment link sent',
    short: 'Link sent',
    badge: 'Awaiting payment',
    badgeClass: 'bg-brand-100 text-brand-700',
    body: 'A secure Stripe payment link was emailed to you.',
    cta: 'Pay securely with Stripe',
  },
  {
    id: 'paid',
    label: 'Paid',
    short: 'Paid',
    badge: 'Paid',
    badgeClass: 'bg-success-bg text-success',
    body: 'Payment received. The pharmacy is preparing your order.',
  },
  {
    id: 'ready',
    label: 'Ready for collection',
    short: 'Ready',
    badge: 'Ready',
    badgeClass: 'bg-success-bg text-success',
    body: 'Your script is ready for collection at the partner pharmacy.',
  },
] as const

const SAMPLE_TOKEN = '4K7M 9PX2 LQ8D'
const RING_C = 2 * Math.PI * 17

export function OrderJourneyPreview() {
  const reduced = usePrefersReducedMotion()
  const [index, setIndex] = useState(0)
  const [hoverPaused, setHoverPaused] = useState(false)
  const [manualPaused, setManualPaused] = useState(false)
  const [inView, setInView] = useState(true)
  // The progress fill is client-only so its play-state style goes through the CSSOM (CSP-safe).
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  const rootRef = useRef<HTMLDivElement>(null)
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])
  const stage = stages[index]!
  const typed = useTypeIn(SAMPLE_TOKEN, { delayMs: 900 })

  useEffect(() => {
    const el = rootRef.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver(([entry]) => setInView(Boolean(entry?.isIntersecting)), {
      threshold: 0.2,
    })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  const paused = hoverPaused || manualPaused || !inView
  const autoplay = !reduced

  function go(next: number) {
    setIndex(((next % stages.length) + stages.length) % stages.length)
  }

  function onTabKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    const dir = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0
    if (!dir) return
    e.preventDefault()
    const next = (index + dir + stages.length) % stages.length
    go(next)
    tabRefs.current[next]?.focus()
  }

  const progress = (index + 1) / stages.length

  return (
    <div
      ref={rootRef}
      className="relative mx-auto w-full max-w-[460px]"
      onMouseEnter={() => setHoverPaused(true)}
      onMouseLeave={() => setHoverPaused(false)}
      onFocus={() => setHoverPaused(true)}
      onBlur={() => setHoverPaused(false)}
    >
      {/* Soft halo behind the phone */}
      <div
        className="pointer-events-none absolute inset-x-6 top-16 -z-10 h-[70%] rounded-full bg-gradient-to-b from-brand-300/50 via-sky-200/40 to-transparent blur-3xl"
        aria-hidden
      />

      {/* Floating artefacts (decorative; the phone carries the real content) */}
      <div className="pointer-events-none hidden sm:block" aria-hidden>
        <div
          className={cn(
            'sd-float absolute -left-[5.5rem] top-[9%] z-10 w-[196px] -rotate-[5deg] rounded-2xl bg-white p-3.5 shadow-[0_24px_48px_-20px_rgb(15_42_74/0.45)] ring-1 ring-ink/5 transition-opacity duration-500',
            index <= 1 ? 'opacity-100' : 'opacity-75',
          )}
        >
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-muted">
              eScript token
            </p>
            <span className="inline-flex items-center gap-1 rounded-full bg-mint-100 px-1.5 py-0.5 text-[10px] font-semibold text-mint-700">
              <Check className="h-2.5 w-2.5" strokeWidth={3} /> Valid
            </span>
          </div>
          <p className="mt-2 min-h-[22px] font-mono text-[15px] font-semibold tracking-[0.12em] text-ink">
            {typed.visible}
            {!typed.done ? <span className="sd-caret ml-px inline-block h-[15px] w-[2px] translate-y-0.5 bg-brand-600" /> : null}
          </p>
          <div className="my-2.5 border-t border-dashed border-ink/20" />
          <p className="text-[11px] text-ink-muted">From your SMS or email</p>
        </div>

        <div
          className={cn(
            'sd-float-slow absolute -right-16 top-[40%] z-10 flex w-[212px] rotate-[4deg] items-center gap-3 rounded-2xl bg-white p-3 shadow-[0_24px_48px_-20px_rgb(15_42_74/0.45)] ring-1 ring-ink/5 transition-[opacity,scale] duration-500',
            index >= 2 ? 'scale-100 opacity-100' : 'scale-95 opacity-45',
          )}
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white">
            <Mail className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <p className="text-[12px] font-semibold text-ink">Script Direct</p>
            <p className="text-[12px] leading-snug text-ink-muted">Your payment link is ready</p>
          </div>
        </div>

        {index >= 3 ? (
          <div
            key={index}
            className="sd-pop absolute -left-14 bottom-[16%] z-10 flex items-center gap-3 rounded-2xl bg-ink-950 p-3 pr-5 text-white shadow-[0_24px_48px_-16px_rgb(7_23_44/0.6)]"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-mint-500 text-white">
              {index === 3 ? <Check className="h-5 w-5" strokeWidth={3} /> : <Store className="h-5 w-5" />}
            </span>
            <div>
              <p className="text-[13px] font-semibold">
                {index === 3 ? 'Payment received' : 'Ready for collection'}
              </p>
              <p className="text-[11px] text-white/65">
                {index === 3 ? 'Pharmacy notified' : 'Your partner pharmacy'}
              </p>
            </div>
          </div>
        ) : null}
      </div>

      <PhoneFrame>
        <div className="space-y-3.5" aria-live={manualPaused || hoverPaused ? 'polite' : 'off'}>
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-ink-muted">
                Reference
              </p>
              <p className="font-mono text-[15px] font-semibold tabular-nums text-ink">
                SD-7K4M-2QXP
              </p>
            </div>
            <span
              key={stage.id}
              className={cn(
                'sd-pop rounded-full px-2.5 py-1 text-[11px] font-semibold',
                stage.badgeClass,
              )}
            >
              {stage.badge}
            </span>
          </div>

          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 p-4 text-white">
            <div
              className="absolute -right-8 -top-10 h-28 w-28 rounded-full bg-sky-300/30 blur-2xl"
              aria-hidden
            />
            <div className="relative flex items-center gap-3">
              <div className="relative h-11 w-11 shrink-0">
                <svg viewBox="0 0 44 44" className="h-11 w-11 -rotate-90" aria-hidden>
                  <circle cx="22" cy="22" r="17" fill="none" stroke="rgb(255 255 255 / 0.22)" strokeWidth="4" />
                  <circle
                    cx="22"
                    cy="22"
                    r="17"
                    fill="none"
                    stroke="#fff"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeDasharray={RING_C}
                    strokeDashoffset={RING_C * (1 - progress)}
                    className="transition-[stroke-dashoffset] duration-700 ease-out"
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-[11px] font-semibold tabular-nums">
                  {index + 1}/{stages.length}
                </span>
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-brand-100">
                  Current status
                </p>
                <p key={stage.id} className="sd-enter-left text-[17px] font-semibold leading-tight">
                  {stage.label}
                </p>
              </div>
            </div>
          </div>

          <ol className="relative space-y-1.5 pl-0.5">
            <span className="absolute bottom-3 left-[11px] top-3 w-px bg-brand-100" aria-hidden />
            {stages.map((s, i) => (
              <li key={s.id} className="relative flex items-center gap-2.5 text-[13px]">
                <span
                  className={cn(
                    'relative z-[1] flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full text-[10px] font-bold transition-colors duration-300',
                    i < index && 'bg-brand-600 text-white',
                    i === index && 'bg-white text-brand-700 ring-2 ring-brand-600',
                    i > index && 'bg-brand-50 text-ink-muted ring-1 ring-brand-100',
                  )}
                >
                  {i < index ? <Check className="h-3 w-3" strokeWidth={3} /> : i + 1}
                </span>
                <span
                  className={cn(
                    'transition-colors duration-300',
                    i === index ? 'font-semibold text-ink' : i < index ? 'text-ink-muted' : 'text-ink-muted/80',
                  )}
                >
                  {s.label}
                </span>
              </li>
            ))}
          </ol>

          <p className="rounded-xl bg-brand-50 px-3 py-2.5 text-[13px] leading-relaxed text-ink-muted">
            {stage.body}
          </p>
          {'cta' in stage && stage.cta ? (
            <div className="sd-pop sd-sheen w-full rounded-xl bg-brand-600 px-3 py-3 text-center text-[13px] font-semibold text-white shadow-[var(--shadow-glow)]">
              {stage.cta}
            </div>
          ) : null}
        </div>
      </PhoneFrame>

      <div
        role="tablist"
        aria-label="Sample order stages"
        className="mt-6 flex flex-wrap justify-center gap-1.5"
        onKeyDown={onTabKeyDown}
      >
        {stages.map((s, i) => {
          const selected = i === index
          return (
            <button
              key={s.id}
              ref={(el) => {
                tabRefs.current[i] = el
              }}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-label={s.label}
              className={cn(
                'relative min-h-10 overflow-hidden rounded-full px-3.5 text-[13px] font-medium transition-colors duration-200 focus-ring',
                selected
                  ? 'bg-ink-950 text-white'
                  : 'bg-white/80 text-ink-muted ring-1 ring-ink/10 hover:bg-white hover:text-ink',
              )}
              onClick={() => go(i)}
            >
              {selected && autoplay && mounted ? (
                <span
                  key={`${index}-fill`}
                  aria-hidden
                  className="sd-fill absolute inset-y-0 left-0 bg-white/25"
                  style={{ animationPlayState: paused ? 'paused' : 'running' }}
                  onAnimationEnd={() => go(index + 1)}
                />
              ) : null}
              <span className="relative" aria-hidden>
                {s.short}
              </span>
            </button>
          )
        })}
      </div>

      {autoplay ? (
        <button
          type="button"
          className="mx-auto mt-3 flex min-h-9 items-center gap-1.5 rounded-full px-3 text-xs font-medium text-ink-muted transition-colors hover:text-brand-700 focus-ring"
          onClick={() => setManualPaused((p) => !p)}
        >
          {manualPaused ? (
            <Play className="h-3 w-3" aria-hidden />
          ) : (
            <Pause className="h-3 w-3" aria-hidden />
          )}
          {manualPaused ? 'Resume preview' : 'Pause preview'}
        </button>
      ) : null}
    </div>
  )
}

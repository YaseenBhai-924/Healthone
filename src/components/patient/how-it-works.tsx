'use client'

/**
 * Legacy how-it-works rail. Prefer HowItWorksStepper on marketing pages.
 * Kept for gallery/compat; copy matches pay-after-verification flow.
 */
import { useState } from 'react'
import {
  ClipboardPaste,
  Package,
  Mail,
  CreditCard,
  type LucideIcon,
} from 'lucide-react'
import { howItWorks } from '@/lib/patient/copy'
import { cn } from '@/lib/cn'
import { Reveal } from './reveal'

const icons: LucideIcon[] = [ClipboardPaste, Package, Mail, CreditCard]

export function HowItWorks({ title = 'How it works' }: { title?: string }) {
  const [active, setActive] = useState(0)

  return (
    <section aria-labelledby="how-heading">
      <Reveal>
        <h2
          id="how-heading"
          className="font-display text-3xl font-bold tracking-tight text-heading sm:text-4xl"
        >
          {title}
        </h2>
        <p className="mt-3 max-w-xl text-ink-muted">
          Four short steps from eScript token to payment link and tracking. Tap a
          step to explore.
        </p>
      </Reveal>

      <div className="relative mt-10 hidden md:block">
        <div
          className="absolute left-[12%] right-[12%] top-10 h-0.5 bg-line"
          aria-hidden
        >
          <div
            className="h-full origin-left bg-brand-600 transition-transform duration-500 ease-out"
            style={{
              transform: `scaleX(${active / Math.max(1, howItWorks.length - 1)})`,
            }}
          />
        </div>

        <ol className="relative grid grid-cols-4 gap-4">
          {howItWorks.map((step, i) => {
            const Icon = icons[i]!
            const isActive = active === i
            return (
              <li key={step.title}>
                <button
                  type="button"
                  onMouseEnter={() => setActive(i)}
                  onFocus={() => setActive(i)}
                  onClick={() => setActive(i)}
                  className={cn(
                    'group w-full rounded-card border p-5 text-left transition-all duration-300 focus-ring',
                    isActive
                      ? 'border-brand-600/30 bg-surface shadow-md -translate-y-1'
                      : 'border-line bg-surface/70 hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-sm',
                  )}
                  aria-current={isActive ? 'step' : undefined}
                >
                  <span
                    className={cn(
                      'inline-flex h-10 w-10 items-center justify-center rounded-full',
                      isActive
                        ? 'bg-brand-600 text-white'
                        : 'bg-brand-100 text-brand-700',
                    )}
                  >
                    <Icon className="h-5 w-5" aria-hidden />
                  </span>
                  <span className="mt-3 block font-display text-sm font-bold text-heading">
                    {step.title}
                  </span>
                  <span className="mt-1 block text-xs text-ink-muted">
                    {step.body}
                  </span>
                </button>
              </li>
            )
          })}
        </ol>
      </div>

      <ol className="mt-8 space-y-3 md:hidden">
        {howItWorks.map((step, i) => {
          const Icon = icons[i]!
          const isActive = active === i
          return (
            <li key={step.title}>
              <button
                type="button"
                className={cn(
                  'flex w-full gap-3 rounded-card border p-4 text-left focus-ring',
                  isActive ? 'border-brand-300 bg-brand-50' : 'border-line bg-surface',
                )}
                aria-expanded={isActive}
                onClick={() => setActive(i)}
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-700">
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <span>
                  <span className="block font-semibold text-heading">{step.title}</span>
                  {isActive ? (
                    <span className="mt-1 block text-sm text-ink-muted">{step.body}</span>
                  ) : null}
                </span>
              </button>
            </li>
          )
        })}
      </ol>
    </section>
  )
}

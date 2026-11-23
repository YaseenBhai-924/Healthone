'use client'

import { cn } from '@/lib/cn'

/**
 * Premium hero visual: floating glass “status card” over a soft clinical
 * light field — no cartoon capsules.
 */
export function PharmacyHeroArt({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'relative isolate mx-auto aspect-[5/4] w-full max-w-lg',
        className,
      )}
      aria-hidden
    >
      {/* Soft light field */}
      <div className="absolute inset-0 overflow-hidden rounded-[2rem]">
        <div className="absolute -left-1/4 -top-1/4 h-[70%] w-[70%] rounded-full bg-[#93c5fd]/45 blur-3xl sd-float-a" />
        <div className="absolute -bottom-1/4 -right-1/5 h-[65%] w-[65%] rounded-full bg-[#38bdf8]/30 blur-3xl sd-float-b" />
        <div className="absolute left-1/3 top-1/3 h-40 w-40 rounded-full bg-white/50 blur-2xl" />
        <div className="sd-noise absolute inset-0 opacity-[0.35]" />
      </div>

      {/* Back plate */}
      <div className="absolute inset-[8%] rounded-[1.75rem] border border-white/60 bg-gradient-to-br from-white/70 via-brand-50/80 to-brand-100/50 shadow-[0_24px_60px_-20px_rgba(37,99,235,0.35)] backdrop-blur-md" />

      {/* Floating status card */}
      <div className="absolute inset-x-[14%] top-[16%] sd-float-card">
        <div className="rounded-2xl border border-white/80 bg-white/90 p-5 shadow-[0_20px_50px_-18px_rgba(15,23,42,0.35)] backdrop-blur-xl">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-fg-muted">
                Script Direct
              </p>
              <p className="mt-1 font-display text-lg font-bold tracking-tight text-brand-800">
                Request confirmed
              </p>
            </div>
            <span className="rounded-full bg-success-subtle px-2.5 py-1 text-[11px] font-bold text-success-fg">
              Submitted
            </span>
          </div>

          <div className="mt-5 rounded-xl bg-brand-50/80 px-3.5 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-fg-muted">
              Reference
            </p>
            <p className="font-mono text-xl font-bold tracking-wide text-brand-700">
              SD-7K4M-2QXP
            </p>
          </div>

          <ol className="mt-5 space-y-3">
            {[
              { label: 'Submitted', done: true },
              { label: 'In progress', done: true },
              { label: 'Ready for collection', done: false },
            ].map((row, i) => (
              <li key={row.label} className="flex items-center gap-3">
                <span
                  className={cn(
                    'flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold',
                    row.done
                      ? 'bg-brand-600 text-white'
                      : 'bg-subtle text-fg-muted',
                  )}
                >
                  {row.done ? '✓' : String(i + 1)}
                </span>
                <span
                  className={cn(
                    'text-sm font-semibold',
                    row.done ? 'text-brand-800' : 'text-fg-muted',
                  )}
                >
                  {row.label}
                </span>
              </li>
            ))}
          </ol>
        </div>
      </div>

      {/* Accent chip — secure pay */}
      <div className="absolute bottom-[10%] left-[10%] sd-float-chip rounded-full border border-white/80 bg-white/95 px-3.5 py-2 text-xs font-semibold text-brand-700 shadow-md backdrop-blur">
        <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-success-fg" />
        Stripe secure pay
      </div>

      {/* Accent chip — no account */}
      <div className="absolute right-[8%] top-[12%] sd-float-chip-b rounded-full border border-white/80 bg-white/95 px-3.5 py-2 text-xs font-semibold text-fg-secondary shadow-md backdrop-blur">
        No account needed
      </div>
    </div>
  )
}

export function DeliveryAccentArt({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-brand-50 to-brand-100',
        className,
      )}
      aria-hidden
    >
      <svg viewBox="0 0 48 48" className="h-8 w-8 text-brand-700" fill="none">
        <path
          d="M8 28h18l8-10h6v16H8V28z"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinejoin="round"
        />
        <circle cx="16" cy="38" r="3.2" fill="currentColor" />
        <circle cx="34" cy="38" r="3.2" fill="currentColor" />
      </svg>
    </div>
  )
}

export function CollectionAccentArt({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-brand-50 to-brand-100',
        className,
      )}
      aria-hidden
    >
      <svg viewBox="0 0 48 48" className="h-8 w-8 text-brand-700" fill="none">
        <rect
          x="12"
          y="16"
          width="24"
          height="20"
          rx="3"
          stroke="currentColor"
          strokeWidth="2.2"
        />
        <path
          d="M18 16v-3a6 6 0 0 1 12 0v3"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        <circle cx="24" cy="27" r="2.5" fill="currentColor" />
      </svg>
    </div>
  )
}

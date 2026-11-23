'use client'

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { howItWorks } from '@/lib/patient/copy'
import { PhoneFrame } from '@/components/site/phone-frame'
import { Eyebrow } from '@/components/site/eyebrow'
import { cn } from '@/lib/cn'
import { stepScreens } from './phone-screens'

const DESKTOP_QUERY = '(min-width: 1024px)'
/** Matches `lg:top-24` on the sticky wrapper (6rem). */
const PIN_TOP = 96

/** Static classes (not inline styles): the nonce-based CSP blocks style="" attributes. */
const RAIL_HEIGHT = [
  'h-[calc((100%-1.5rem)*0.25)]',
  'h-[calc((100%-1.5rem)*0.5)]',
  'h-[calc((100%-1.5rem)*0.75)]',
  'h-[calc(100%-1.5rem)]',
] as const

function isDesktop(): boolean {
  return typeof window.matchMedia === 'function' && window.matchMedia(DESKTOP_QUERY).matches
}

/**
 * Scroll-told stepper.
 * lg+: the section is tall and the content is sticky. Scroll progress picks the
 *      active step; clicking a step scrolls to its slot, so scroll and click
 *      always agree.
 * <lg: a plain list where the active step expands to show its screen inline.
 */
export function HowItWorksStepper({
  eyebrow,
  title,
  lead,
}: {
  eyebrow?: string
  title?: ReactNode
  lead?: string
} = {}) {
  const [active, setActive] = useState(0)
  const outerRef = useRef<HTMLDivElement>(null)
  const innerRef = useRef<HTMLDivElement>(null)
  const count = howItWorks.length

  /** Pinned scroll distance (px) and how far the section has scrolled past the pin point. */
  const measure = useCallback(() => {
    const outer = outerRef.current
    const inner = innerRef.current
    if (!outer || !inner || !isDesktop()) return null
    const rect = outer.getBoundingClientRect()
    const distance = rect.height - inner.offsetHeight
    if (distance <= 0) return null
    return { rect, distance, scrolled: PIN_TOP - rect.top }
  }, [])

  useEffect(() => {
    let frame = 0
    const update = () => {
      frame = 0
      const m = measure()
      if (!m) return
      const progress = Math.min(0.999, Math.max(0, m.scrolled / m.distance))
      setActive(Math.floor(progress * count))
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [count, measure])

  const select = useCallback(
    (i: number) => {
      setActive(i)
      const m = measure()
      if (!m) return
      const target = ((i + 0.5) / count) * m.distance
      window.scrollTo({
        top: window.scrollY + (target - m.scrolled),
        behavior: 'instant' as ScrollBehavior,
      })
    },
    [count, measure],
  )

  const Screen = stepScreens[active] ?? stepScreens[0]

  return (
    <div ref={outerRef} className="relative lg:h-[230vh]">
      <div
        ref={innerRef}
        className="lg:sticky lg:top-24 lg:flex lg:h-[calc(100vh-7rem)] lg:min-h-[640px] lg:items-center"
      >
        <div className="grid w-full gap-10 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-center lg:gap-20">
          <div className="min-w-0">
            {(eyebrow || title || lead) && (
              <header className="mb-8 max-w-2xl lg:mb-10">
                {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
                {title ? (
                  <h2 className={cn('sd-display sd-display-lg', eyebrow && 'mt-4')}>{title}</h2>
                ) : null}
                {lead ? <p className="lead prose-measure mt-4 text-ink-muted">{lead}</p> : null}
              </header>
            )}

            <ol className="relative space-y-2 pl-0 lg:pl-5">
              {/* progress rail */}
              <span
                aria-hidden
                className="absolute bottom-3 left-0 top-3 hidden w-[2px] rounded-full bg-brand-100 lg:block"
              />
              <span
                aria-hidden
                className={cn(
                  'absolute left-0 top-3 hidden w-[2px] rounded-full bg-brand-600 transition-[height] duration-500 ease-out lg:block',
                  RAIL_HEIGHT[active] ?? RAIL_HEIGHT[0],
                )}
              />
              {howItWorks.map((step, i) => {
                const on = i === active
                return (
                  <li key={step.title}>
                    <button
                      type="button"
                      className={cn(
                        'group flex w-full items-start gap-5 rounded-3xl p-4 text-left transition-[background-color,box-shadow] duration-300 focus-ring sm:p-5',
                        on
                          ? 'bg-white shadow-[0_24px_48px_-28px_rgb(15_42_74/0.4)] ring-1 ring-ink/5'
                          : 'hover:bg-white/60',
                      )}
                      onClick={() => select(i)}
                      aria-current={on ? 'step' : undefined}
                    >
                      <span
                        aria-hidden
                        className={cn(
                          'w-12 shrink-0 font-[family-name:var(--font-editorial)] text-[2.75rem] leading-[0.9] tabular-nums transition-colors duration-300',
                          on ? 'text-brand-600' : 'text-brand-500/90 group-hover:text-brand-600',
                        )}
                      >
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span className="min-w-0">
                        <span className="block text-[1.075rem] font-semibold leading-snug text-heading">
                          {step.title}
                        </span>
                        <span className="mt-1.5 block text-[15px] leading-relaxed text-ink-muted">
                          {step.body}
                        </span>
                      </span>
                    </button>
                    {on ? (
                      <div className="mt-3 flex justify-center lg:hidden">
                        <PhoneFrame label="Sample" className="max-w-[280px]">
                          <Screen key={`m-${active}`} />
                        </PhoneFrame>
                      </div>
                    ) : null}
                  </li>
                )
              })}
            </ol>
          </div>

          <div className="hidden lg:block" data-testid="how-it-works-phone">
            <PhoneFrame label="Sample">
              <Screen key={active} />
            </PhoneFrame>
          </div>
        </div>
      </div>
    </div>
  )
}

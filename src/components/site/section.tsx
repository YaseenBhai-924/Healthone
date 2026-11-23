import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { Container } from './container'
import { Eyebrow } from './eyebrow'

type Tone = 'default' | 'canvas' | 'brand' | 'white' | 'dark'

const tones: Record<Tone, string> = {
  default: 'bg-transparent',
  canvas: 'bg-canvas',
  brand: 'bg-brand-50',
  white: 'bg-surface',
  dark: 'sd-dark relative isolate overflow-hidden bg-ink-950 text-white',
}

/**
 * Page section with an editorial heading block. `dark` adds the ink backdrop
 * (grid lines, glow orbs, grain) used for the trust section.
 */
export function Section({
  className,
  eyebrow,
  title,
  lead,
  children,
  id,
  tone = 'default',
  ...props
}: Omit<HTMLAttributes<HTMLElement>, 'title'> & {
  eyebrow?: string
  title?: ReactNode
  lead?: string
  tone?: Tone
}) {
  const dark = tone === 'dark'

  return (
    <section id={id} className={cn('sd-section', tones[tone], className)} {...props}>
      {dark ? (
        <>
          <div className="sd-grid-lines-dark absolute inset-0 -z-10" aria-hidden />
          <div
            className="sd-orb sd-orb-1 -left-32 -top-20 -z-10 h-[26rem] w-[26rem] opacity-60"
            aria-hidden
          />
          <div
            className="sd-orb sd-orb-3 -bottom-24 right-0 -z-10 h-[24rem] w-[24rem] opacity-70"
            aria-hidden
          />
          <div className="sd-noise absolute inset-0 -z-10 opacity-30" aria-hidden />
        </>
      ) : null}
      <Container>
        {(eyebrow || title || lead) && (
          <header className="mb-12 max-w-2xl sm:mb-14">
            {eyebrow ? <Eyebrow tone={dark ? 'dark' : 'light'}>{eyebrow}</Eyebrow> : null}
            {title ? (
              <h2 className={cn('sd-display sd-display-lg', eyebrow && 'mt-4')}>{title}</h2>
            ) : null}
            {lead ? (
              <p className={cn('lead prose-measure mt-4', dark ? 'text-white/70' : 'text-ink-muted')}>
                {lead}
              </p>
            ) : null}
          </header>
        )}
        {children}
      </Container>
    </section>
  )
}

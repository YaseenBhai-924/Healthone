import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { Container } from './container'
import { Eyebrow } from './eyebrow'

/**
 * Inner-page hero. Transparent on purpose: the continuous aurora comes from
 * `.patient-atmosphere`, so the navbar and hero never show a seam.
 */
export function PageHero({
  eyebrow,
  title,
  lead,
  children,
  className,
}: {
  eyebrow?: string
  title: string
  lead?: string
  children?: ReactNode
  className?: string
}) {
  return (
    <div className={cn('relative -mt-[76px] overflow-hidden', className)}>
      <div className="sd-grid-lines absolute inset-0 opacity-70" aria-hidden />
      <Container className="relative pb-14 pt-[calc(76px+3rem)] sm:pb-20 sm:pt-[calc(76px+4.5rem)]">
        {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
        <h1 className={cn('sd-display sd-display-lg max-w-3xl', eyebrow && 'mt-5')}>{title}</h1>
        {lead ? <p className="lead prose-measure mt-6 text-ink-muted">{lead}</p> : null}
        {children}
      </Container>
    </div>
  )
}

/** Spacing between PageHero and the first content block on marketing pages. */
export const pageHeroContentClass = 'pt-10 sm:pt-14 pb-16'

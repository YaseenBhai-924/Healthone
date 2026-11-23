'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { cn } from '@/lib/cn'

/**
 * Scroll / mount reveal: CSS-driven, respects prefers-reduced-motion.
 * The stagger delay is written with the CSSOM in an effect, because the
 * nonce-based CSP blocks server-rendered style="" attributes.
 */
export function Reveal({
  children,
  className,
  delayMs = 0,
  as: Tag = 'div',
}: {
  children: ReactNode
  className?: string
  delayMs?: number
  as?: 'div' | 'section' | 'li' | 'article'
}) {
  const ref = useRef<HTMLElement | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.style.transitionDelay = `${delayMs}ms`

    const prefersReduced =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (prefersReduced || typeof IntersectionObserver === 'undefined') {
      setVisible(true)
      return
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true)
          io.disconnect()
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [delayMs])

  return (
    <Tag
      ref={ref as never}
      className={cn('sd-reveal', visible && 'sd-reveal-in', className)}
    >
      {children}
    </Tag>
  )
}

'use client'

import type { HTMLAttributes, PointerEvent } from 'react'
import { cn } from '@/lib/cn'

/**
 * Card with a cursor-following spotlight (CSS `--mx` / `--my`, see `.sd-spot`).
 * Pointer position is written with the CSSOM (`style.setProperty`), which the
 * nonce-based CSP allows; no inline style attribute is ever server-rendered.
 * Theme the glow with a class, e.g. `[--sd-spot-color:rgb(96_165_250/0.18)]`.
 * Fine pointers only; touch and keyboard users simply see the static card.
 */
export function SpotCard({
  className,
  onPointerMove,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  function handleMove(e: PointerEvent<HTMLDivElement>) {
    onPointerMove?.(e)
    if (e.pointerType !== 'mouse') return
    const rect = e.currentTarget.getBoundingClientRect()
    e.currentTarget.style.setProperty('--mx', `${e.clientX - rect.left}px`)
    e.currentTarget.style.setProperty('--my', `${e.clientY - rect.top}px`)
  }

  return <div className={cn('sd-spot', className)} onPointerMove={handleMove} {...props} />
}

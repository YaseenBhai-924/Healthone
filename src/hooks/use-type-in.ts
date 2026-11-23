'use client'

import { useEffect, useState } from 'react'
import { usePrefersReducedMotion } from './use-prefers-reduced-motion'

/**
 * Reveals `text` one character at a time. Restarts whenever `restartKey`
 * changes. Under prefers-reduced-motion the full text is returned at once.
 * Returns the visible slice plus a `done` flag (for caret styling).
 */
export function useTypeIn(
  text: string,
  { restartKey = 0, delayMs = 250, stepMs = 55 } = {},
): { visible: string; done: boolean } {
  const reduced = usePrefersReducedMotion()
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (reduced) return
    setCount(0)
    let interval: number | undefined
    const start = window.setTimeout(() => {
      interval = window.setInterval(() => {
        setCount((c) => {
          if (c >= text.length) {
            window.clearInterval(interval)
            return c
          }
          return c + 1
        })
      }, stepMs)
    }, delayMs)
    return () => {
      window.clearTimeout(start)
      if (interval) window.clearInterval(interval)
    }
  }, [text, restartKey, delayMs, stepMs, reduced])

  const shown = reduced ? text.length : count
  return { visible: text.slice(0, shown), done: shown >= text.length }
}

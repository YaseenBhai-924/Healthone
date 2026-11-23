'use client'

import { useEffect, useRef, useState } from 'react'
import { usePrefersReducedMotion } from './use-prefers-reduced-motion'

export function useInView<T extends HTMLElement = HTMLDivElement>(
  options?: IntersectionObserverInit,
) {
  const ref = useRef<T | null>(null)
  const [inView, setInView] = useState(false)
  const reduced = usePrefersReducedMotion()

  useEffect(() => {
    if (reduced) {
      setInView(true)
      return
    }
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') {
      setInView(true)
      return
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setInView(true)
          io.disconnect()
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px', ...options },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [options, reduced])

  return { ref, inView }
}

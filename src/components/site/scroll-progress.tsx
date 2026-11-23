'use client'

import { useEffect, useRef } from 'react'

/**
 * Thin reading progress line along the bottom edge of the navbar pill.
 * Writes to a ref (not state) so scrolling never re-renders the header.
 */
export function ScrollProgress() {
  const barRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let frame = 0
    const update = () => {
      frame = 0
      const el = document.documentElement
      const max = el.scrollHeight - el.clientHeight
      const progress = max > 0 ? Math.min(1, el.scrollTop / max) : 0
      if (barRef.current) barRef.current.style.transform = `scaleX(${progress})`
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [])

  return (
    <div
      className="pointer-events-none absolute inset-x-6 bottom-0 h-[2px]"
      aria-hidden
    >
      <div
        ref={barRef}
        className="h-full origin-left rounded-full bg-gradient-to-r from-brand-600 via-accent-sky to-mint-500 [transform:scaleX(0)]"
      />
    </div>
  )
}

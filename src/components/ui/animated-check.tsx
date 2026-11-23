'use client'

import { cn } from '@/lib/cn'
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion'

export function AnimatedCheck({
  className,
  title = 'Success',
}: {
  className?: string
  title?: string
}) {
  const reduced = usePrefersReducedMotion()

  return (
    <svg
      viewBox="0 0 48 48"
      className={cn('h-12 w-12 text-success', className)}
      role="img"
      aria-label={title}
    >
      <circle
        cx="24"
        cy="24"
        r="22"
        fill="currentColor"
        className="opacity-15"
      />
      <path
        d="M14 24.5 L21 31.5 L34 16.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="36"
        strokeDashoffset={reduced ? 0 : 36}
        style={
          reduced
            ? undefined
            : { animation: 'sd-check-draw 0.55s ease-out forwards' }
        }
      />
    </svg>
  )
}

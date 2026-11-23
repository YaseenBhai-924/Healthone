import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

/** Small section label: dot + tracked uppercase text. */
export function Eyebrow({
  children,
  tone = 'light',
  className,
}: {
  children: ReactNode
  tone?: 'light' | 'dark'
  className?: string
}) {
  return (
    <p
      className={cn(
        'inline-flex items-center gap-2.5 text-xs font-semibold uppercase tracking-[0.18em]',
        tone === 'light' ? 'text-brand-700' : 'text-brand-200',
        className,
      )}
    >
      <span
        aria-hidden
        className={cn(
          'h-1.5 w-1.5 rounded-full',
          tone === 'light' ? 'bg-brand-600' : 'bg-mint-300',
        )}
      />
      {children}
    </p>
  )
}

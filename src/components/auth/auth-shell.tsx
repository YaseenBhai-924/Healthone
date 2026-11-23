import Link from 'next/link'
import type { ReactNode } from 'react'
import { Card } from '@/components/ui'
import { cn } from '@/lib/cn'

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
  className,
}: {
  title: string
  subtitle?: string
  children: ReactNode
  footer?: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'relative flex min-h-svh flex-col items-center justify-center overflow-hidden px-4 py-12',
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-0 sd-mesh" aria-hidden />
      <div className="sd-blob sd-blob-a -left-24 top-10 opacity-70" aria-hidden />
      <div className="sd-blob sd-blob-b -right-16 bottom-20 opacity-60" aria-hidden />
      <div className="sd-dot-grid absolute inset-0 opacity-40" aria-hidden />

      <div className="relative z-[1] w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <Link
            href="/"
            className="group inline-flex items-center gap-2.5 rounded-sm focus-ring"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-[10px] bg-brand-600 text-sm font-bold text-white shadow-md transition-transform duration-200 group-hover:scale-[1.03]">
              SD
            </span>
            <span className="font-display text-lg font-bold tracking-tight text-heading">
              Script Direct
            </span>
          </Link>
          <h1 className="font-display mt-6 !text-2xl font-bold leading-snug text-heading sm:!text-3xl">
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-2 max-w-sm text-sm leading-relaxed text-ink-muted">
              {subtitle}
            </p>
          ) : null}
        </div>

        <Card className="sd-glass border-white/70 p-6 shadow-lg sm:p-7">
          {children}
        </Card>

        {footer ? (
          <div className="mt-6 text-center text-sm text-ink-muted">{footer}</div>
        ) : null}
      </div>
    </div>
  )
}

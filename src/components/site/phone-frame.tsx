import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

/**
 * CSS phone mockup for sample UI previews.
 * Light-titanium rail, dark bezel, dynamic island, status bar. Decorative
 * chrome only; the content passed as children is the real, accessible UI.
 */
export function PhoneFrame({
  children,
  className,
  label = 'Sample',
  screenClassName,
}: {
  children: ReactNode
  className?: string
  label?: string
  screenClassName?: string
}) {
  return (
    <div className={cn('relative mx-auto w-full max-w-[300px]', className)}>
      {label ? (
        <p className="mb-3 text-center text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-muted">
          {label}
        </p>
      ) : null}
      <div className="relative rounded-[2.75rem] bg-gradient-to-b from-[#f4f7fc] via-[#d7dfec] to-[#bcc8da] p-[6px] shadow-[0_40px_80px_-24px_rgb(15_42_74/0.45),0_18px_36px_-18px_rgb(37_99_235/0.35)]">
        <div className="rounded-[2.4rem] bg-ink-950 p-[7px]">
          <div className="relative overflow-hidden rounded-[2rem] bg-white">
            {/* status bar + island */}
            <div
              className="relative flex h-9 items-center justify-between px-6 pt-1 text-[11px] font-semibold text-ink"
              aria-hidden
            >
              <span>9:41</span>
              <span className="absolute left-1/2 top-2 h-[18px] w-[76px] -translate-x-1/2 rounded-full bg-ink-950" />
              <span className="flex items-center gap-1">
                <span className="flex items-end gap-[2px]">
                  <i className="block h-[4px] w-[3px] rounded-[1px] bg-ink" />
                  <i className="block h-[6px] w-[3px] rounded-[1px] bg-ink" />
                  <i className="block h-[8px] w-[3px] rounded-[1px] bg-ink" />
                  <i className="block h-[10px] w-[3px] rounded-[1px] bg-ink/30" />
                </span>
                <span className="ml-1 block h-[10px] w-[20px] rounded-[3px] border border-ink/60 p-[1px]">
                  <i className="block h-full w-[70%] rounded-[1px] bg-ink" />
                </span>
              </span>
            </div>
            <div className={cn('min-h-[470px] px-4 pb-5 pt-2', screenClassName)}>
              {children}
            </div>
            <div className="flex justify-center pb-2" aria-hidden>
              <span className="h-1 w-24 rounded-full bg-ink/80" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

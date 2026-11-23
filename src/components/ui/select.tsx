'use client'

import { type SelectHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  ref?: React.Ref<HTMLSelectElement>
  hasError?: boolean
}

export function Select({ className, hasError, ref, ...props }: SelectProps) {
  return (
    <select
      ref={ref}
      className={cn(
        'w-full h-[var(--control-h)] px-3 rounded-control',
        'bg-surface text-fg',
        'border border-control',
        'text-sm font-normal',
        'appearance-none',
        // Custom dropdown arrow via background SVG
        'bg-[url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 12 12\'%3E%3Cpath fill=\'%234a6290\' d=\'M6 8L1 3h10z\'/%3E%3C/svg%3E")] bg-no-repeat bg-[right_0.75rem_center]',
        'pr-9',
        'transition-[border-color,box-shadow] duration-[150ms] ease-out',
        'motion-reduce:transition-none',
        'focus-ring',
        'disabled:bg-surface-muted disabled:text-fg-muted disabled:cursor-not-allowed',
        'cursor-pointer',
        hasError && 'border-danger-fg',
        className,
      )}
      aria-invalid={hasError || undefined}
      {...props}
    />
  )
}

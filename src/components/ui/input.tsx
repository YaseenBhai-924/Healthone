'use client'

import { type InputHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  ref?: React.Ref<HTMLInputElement>
  /** Renders the input in an error state (red border) */
  hasError?: boolean
}

export function Input({ className, hasError, ref, ...props }: InputProps) {
  return (
    <input
      ref={ref}
      className={cn(
        // Layout
        'w-full h-[var(--control-h)]',
        'px-3 rounded-control',
        // Colour
        'bg-surface text-fg',
        'border border-control',
        // Typography
        'text-sm font-normal',
        // Transitions
        'transition-[border-color,box-shadow] duration-[150ms] ease-out',
        'motion-reduce:transition-none',
        // States
        'placeholder:text-fg-muted',
        'focus-ring',
        'disabled:bg-surface-muted disabled:text-fg-muted disabled:cursor-not-allowed',
        // Error state
        hasError && 'border-danger-fg focus-visible:ring-danger-fg',
        className,
      )}
      aria-invalid={hasError || undefined}
      {...props}
    />
  )
}

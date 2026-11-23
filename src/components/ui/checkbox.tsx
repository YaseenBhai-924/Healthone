'use client'

import { type InputHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

export interface CheckboxProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  ref?: React.Ref<HTMLInputElement>
  /** Label text rendered next to the checkbox */
  label?: React.ReactNode
  hasError?: boolean
}

export function Checkbox({
  className,
  label,
  hasError,
  id,
  ref,
  ...props
}: CheckboxProps) {
  return (
    <div className={cn('flex items-start gap-3', className)}>
      <input
        ref={ref}
        type="checkbox"
        id={id}
        className={cn(
          // Size — minimum 20px for touch-friendliness
          'mt-0.5 h-5 w-5 flex-none',
          'rounded-[4px]',
          'border border-control',
          'text-brand-600',
          'accent-brand-600',
          'focus-ring',
          'cursor-pointer',
          'disabled:cursor-not-allowed disabled:opacity-50',
          hasError && 'border-danger-fg',
        )}
        aria-invalid={hasError || undefined}
        {...props}
      />
      {label && (
        <label
          htmlFor={id}
          className="text-sm text-fg leading-relaxed cursor-pointer select-none"
        >
          {label}
        </label>
      )}
    </div>
  )
}

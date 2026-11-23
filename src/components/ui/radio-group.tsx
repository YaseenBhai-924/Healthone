'use client'

import { type InputHTMLAttributes, type HTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

/* ── RadioItem ─────────────────────────────────────────── */

export interface RadioItemProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  ref?: React.Ref<HTMLInputElement>
  /** Visible label next to the radio button */
  label: React.ReactNode
  /** Optional description below the label */
  description?: React.ReactNode
}

export function RadioItem({
  className,
  label,
  description,
  id,
  ref,
  ...props
}: RadioItemProps) {
  const descId = description && id ? `${id}-desc` : undefined

  return (
    <div className={cn('flex items-start gap-3', className)}>
      <input
        ref={ref}
        type="radio"
        id={id}
        className={cn(
          'mt-0.5 h-5 w-5 flex-none',
          'accent-brand-600',
          'border border-control',
          'focus-ring',
          'cursor-pointer',
          'disabled:cursor-not-allowed disabled:opacity-50',
        )}
        aria-describedby={descId}
        {...props}
      />
      {/* Description is OUTSIDE the label so it does not affect accessible name */}
      <div className="cursor-pointer select-none">
        <label htmlFor={id} className="block text-sm font-medium text-fg cursor-pointer">
          {label}
        </label>
        {description && (
          <span id={descId} className="block text-sm text-fg-muted">
            {description}
          </span>
        )}
      </div>
    </div>
  )
}

/* ── RadioGroup ────────────────────────────────────────── */

export interface RadioGroupProps extends HTMLAttributes<HTMLFieldSetElement> {
  ref?: React.Ref<HTMLFieldSetElement>
  /** Visually hidden legend for screen readers */
  legend: string
  hasError?: boolean
}

export function RadioGroup({
  className,
  legend,
  hasError,
  children,
  ref,
  ...props
}: RadioGroupProps) {
  return (
    <fieldset
      ref={ref}
      className={cn('border-0 p-0 m-0 space-y-3', className)}
      aria-invalid={hasError || undefined}
      {...props}
    >
      <legend className="sr-only">{legend}</legend>
      {children}
    </fieldset>
  )
}

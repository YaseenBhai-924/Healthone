'use client'

import { type HTMLAttributes, type LabelHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

/* ── Label ─────────────────────────────────────────────── */

export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  ref?: React.Ref<HTMLLabelElement>
  required?: boolean
}

export function Label({ className, children, required, ref, ...props }: LabelProps) {
  return (
    <label
      ref={ref}
      className={cn(
        'block text-sm font-semibold text-fg-secondary',
        className,
      )}
      {...props}
    >
      {children}
      {required && (
        <span className="ml-1 text-danger-fg" aria-hidden="true">
          *
        </span>
      )}
    </label>
  )
}

/* ── HintText ──────────────────────────────────────────── */

export interface HintTextProps extends HTMLAttributes<HTMLParagraphElement> {
  ref?: React.Ref<HTMLParagraphElement>
}

export function HintText({ className, ref, ...props }: HintTextProps) {
  return (
    <p
      ref={ref}
      className={cn('mt-1 text-sm text-fg-muted', className)}
      {...props}
    />
  )
}

/* ── ErrorText ─────────────────────────────────────────── */

export interface ErrorTextProps extends HTMLAttributes<HTMLParagraphElement> {
  ref?: React.Ref<HTMLParagraphElement>
}

export function ErrorText({ className, ref, ...props }: ErrorTextProps) {
  return (
    <p
      ref={ref}
      className={cn('mt-1 text-sm font-medium text-danger-fg', className)}
      role="alert"
      aria-live="polite"
      {...props}
    />
  )
}

/* ── Field (wrapper) ───────────────────────────────────── */

export interface FieldProps extends HTMLAttributes<HTMLDivElement> {
  ref?: React.Ref<HTMLDivElement>
}

/**
 * Vertical stack that groups a Label, control, HintText and ErrorText.
 * Add `space-y-1` or similar on the parent if stacking multiple fields.
 */
export function Field({ className, ref, ...props }: FieldProps) {
  return (
    <div
      ref={ref}
      className={cn('flex flex-col gap-1', className)}
      {...props}
    />
  )
}

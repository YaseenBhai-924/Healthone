'use client'

import { type ButtonHTMLAttributes } from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/cn'
import {
  buttonVariants,
  type ButtonVariantProps,
} from './button-variants'

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    ButtonVariantProps {
  /** React 19 ref as prop (no forwardRef needed) */
  ref?: React.Ref<HTMLButtonElement>
  /** Show a spinner and disable interaction */
  loading?: boolean
  /** Accessible label when loading (defaults to "Loading…") */
  loadingLabel?: string
}

export function Button({
  className,
  variant,
  size,
  loading = false,
  loadingLabel = 'Loading…',
  disabled,
  children,
  ref,
  ...props
}: ButtonProps) {
  return (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size }), className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading && (
        <Loader2
          className="h-4 w-4 shrink-0 animate-spin"
          aria-hidden="true"
        />
      )}
      {loading ? <span className="sr-only">{loadingLabel}</span> : null}
      <span
        className="inline-flex items-center gap-2"
        aria-hidden={loading || undefined}
      >
        {children}
      </span>
    </button>
  )
}

export { buttonVariants }

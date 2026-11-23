'use client'

import { type HTMLAttributes, type ReactNode } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import {
  AlertCircle,
  CheckCircle2,
  Info,
  TriangleAlert,
  X,
} from 'lucide-react'
import { cn } from '@/lib/cn'

const alertVariants = cva('flex gap-3 rounded-card p-4 text-sm border', {
  variants: {
    variant: {
      info: 'bg-info-subtle text-info-fg border-info-fg/20',
      success: 'bg-success-subtle text-success-fg border-success-fg/20',
      warning: 'bg-warning-subtle text-warning-fg border-warning-fg/20',
      danger: 'bg-danger-subtle text-danger-fg border-danger-fg/20',
    },
  },
  defaultVariants: { variant: 'info' },
})

const icons = {
  info: Info,
  success: CheckCircle2,
  warning: TriangleAlert,
  danger: AlertCircle,
} as const

export interface AlertProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {
  ref?: React.Ref<HTMLDivElement>
  title?: string
  action?: ReactNode
  onDismiss?: () => void
}

export function Alert({
  className,
  variant = 'info',
  title,
  action,
  onDismiss,
  children,
  ref,
  ...props
}: AlertProps) {
  const Icon = icons[variant ?? 'info']
  const assertive = variant === 'danger' || variant === 'warning'

  return (
    <div
      ref={ref}
      className={cn(alertVariants({ variant }), className)}
      role={assertive ? 'alert' : 'status'}
      {...props}
    >
      <Icon className="h-5 w-5 shrink-0 mt-0.5" aria-hidden="true" />
      <div className="flex-1 min-w-0">
        {title ? <p className="font-semibold mb-1">{title}</p> : null}
        {children ? <div className="leading-relaxed">{children}</div> : null}
        {action ? <div className="mt-3">{action}</div> : null}
      </div>
      {onDismiss ? (
        <button
          type="button"
          onClick={onDismiss}
          className="shrink-0 rounded p-0.5 focus-ring opacity-70 hover:opacity-100"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      ) : null}
    </div>
  )
}

'use client'

import { type HTMLAttributes } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/cn'

/* ── Base Badge ─────────────────────────────────────────── */

const badgeVariants = cva(
  'inline-flex items-center rounded-badge px-2.5 py-0.5 text-xs font-bold',
  {
    variants: {
      variant: {
        info:    'bg-info-subtle    text-info-fg',
        success: 'bg-success-subtle text-success-fg',
        warning: 'bg-warning-subtle text-warning-fg',
        danger:  'bg-danger-subtle  text-danger-fg',
        neutral: 'bg-neutral-subtle text-neutral-fg',
      },
    },
    defaultVariants: {
      variant: 'neutral',
    },
  },
)

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  ref?: React.Ref<HTMLSpanElement>
}

export function Badge({ className, variant, ref, ...props }: BadgeProps) {
  return (
    <span
      ref={ref}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

/* ── Request Status ─────────────────────────────────────── */

/**
 * All prescription request statuses from the domain model.
 * Plain labels only — no icons or colours beyond the badge palette.
 */
export type RequestStatus =
  | 'Draft'
  | 'PaymentPending'
  | 'Submitted'
  | 'InProgress'
  | 'ReadyOrDispatched'
  | 'Completed'
  | 'Rejected'

const requestStatusConfig: Record<
  RequestStatus,
  { label: string; variant: VariantProps<typeof badgeVariants>['variant'] }
> = {
  Draft:              { label: 'Draft',                variant: 'neutral' },
  PaymentPending:     { label: 'Payment pending',      variant: 'warning' },
  Submitted:          { label: 'Submitted',            variant: 'info'    },
  InProgress:         { label: 'In progress',          variant: 'warning' },
  ReadyOrDispatched:  { label: 'Ready / Dispatched',   variant: 'success' },
  Completed:          { label: 'Completed',            variant: 'neutral' },
  Rejected:           { label: 'Rejected',             variant: 'danger'  },
}

export interface RequestStatusBadgeProps
  extends Omit<BadgeProps, 'variant' | 'children'> {
  status: RequestStatus
}

export function RequestStatusBadge({
  status,
  className,
  ...props
}: RequestStatusBadgeProps) {
  const { label, variant } = requestStatusConfig[status]
  return (
    <Badge variant={variant} className={className} {...props}>
      {label}
    </Badge>
  )
}

/* ── Payment Status ─────────────────────────────────────── */

/**
 * All payment statuses from the domain model.
 */
export type PaymentStatus =
  | 'None'
  | 'Pending'
  | 'Paid'
  | 'Failed'
  | 'RefundPending'
  | 'Refunded'
  | 'RefundFailed'

const paymentStatusConfig: Record<
  PaymentStatus,
  { label: string; variant: VariantProps<typeof badgeVariants>['variant'] }
> = {
  None:          { label: 'None',           variant: 'neutral' },
  Pending:       { label: 'Pending',        variant: 'warning' },
  Paid:          { label: 'Paid',           variant: 'success' },
  Failed:        { label: 'Failed',         variant: 'danger'  },
  RefundPending: { label: 'Refund pending', variant: 'warning' },
  Refunded:      { label: 'Refunded',       variant: 'neutral' },
  RefundFailed:  { label: 'Refund failed',  variant: 'danger'  },
}

export interface PaymentStatusBadgeProps
  extends Omit<BadgeProps, 'variant' | 'children'> {
  status: PaymentStatus
}

export function PaymentStatusBadge({
  status,
  className,
  ...props
}: PaymentStatusBadgeProps) {
  const { label, variant } = paymentStatusConfig[status]
  return (
    <Badge variant={variant} className={className} {...props}>
      {label}
    </Badge>
  )
}

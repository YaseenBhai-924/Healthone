import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/cn'

export function IconBadge({
  icon: Icon,
  className,
  tone = 'brand',
}: {
  icon: LucideIcon
  className?: string
  tone?: 'brand' | 'success' | 'warning' | 'danger'
}) {
  const tones = {
    brand: 'bg-brand-100 text-brand-700',
    success: 'bg-success-bg text-success',
    warning: 'bg-warning-bg text-warning',
    danger: 'bg-danger-bg text-danger',
  } as const

  return (
    <span
      className={cn(
        'inline-flex h-11 w-11 items-center justify-center rounded-card',
        tones[tone],
        className,
      )}
      aria-hidden
    >
      <Icon className="h-5 w-5" strokeWidth={2} />
    </span>
  )
}

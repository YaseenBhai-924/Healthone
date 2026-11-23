'use client'

import Image from 'next/image'
import { useClinicBranding } from './clinic-branding'
import { cn } from '@/lib/cn'

export interface ClinicLogoProps {
  /** Width in pixels (default: 120) */
  width?: number
  /** Height in pixels (default: 40) */
  height?: number
  className?: string
}

/**
 * Renders the clinic's logo if a logoUrl is provided, otherwise renders
 * a styled text wordmark using the brand name.
 */
export function ClinicLogo({
  width = 120,
  height = 40,
  className,
}: ClinicLogoProps) {
  const brand = useClinicBranding()

  if (brand.logoUrl) {
    return (
      <Image
        src={brand.logoUrl}
        alt={`${brand.name} logo`}
        width={width}
        height={height}
        className={cn('object-contain', className)}
        priority
      />
    )
  }

  return (
    <span
      className={cn(
        'inline-flex items-center',
        'font-bold text-lg leading-none',
        'text-brand-700',
        className,
      )}
      aria-label={brand.name}
      role="img"
    >
      {brand.name}
    </span>
  )
}

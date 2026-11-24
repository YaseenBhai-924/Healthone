'use client'

import { MapPin } from 'lucide-react'
import type { PharmacyAddressDto } from '@/lib/api/public-types'
import { formatAuAddress } from '@/lib/static/address'
import { cn } from '@/lib/cn'

export function CollectionPharmacyAddress({
  pharmacyName,
  pharmacyAddress,
  className,
}: {
  pharmacyName?: string | null
  pharmacyAddress?: PharmacyAddressDto | null
  className?: string
}) {
  const formatted = formatAuAddress(pharmacyAddress ?? null)
  if (!formatted || !pharmacyName?.trim()) return null

  return (
    <div
      className={cn(
        'flex items-start gap-2 rounded-control bg-brand-50/80 px-3 py-2 text-sm text-ink ring-1 ring-brand-100',
        className,
      )}
      data-testid="collection-pharmacy-address"
    >
      <MapPin
        className="mt-0.5 h-4 w-4 shrink-0 text-brand-600"
        aria-hidden
      />
      <div className="min-w-0">
        <p className="font-semibold text-heading">
          Collect from {pharmacyName.trim()}
        </p>
        <p className="mt-0.5 text-ink-muted">{formatted}</p>
      </div>
    </div>
  )
}

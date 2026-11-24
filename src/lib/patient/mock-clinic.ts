import type { ClinicDto } from '@/lib/api/public-types'
import { DEFAULT_CLINIC_SLUG } from '@/lib/patient/defaults'
import {
  getDefaultStaticClinic,
  getStaticClinicBySlug,
  toPublicClinicDto,
} from '@/lib/static/store'

/** Local fallback when the public API is unavailable (frontend-only prototype). */
export function mockClinic(slug: string = DEFAULT_CLINIC_SLUG): ClinicDto {
  const fromStore =
    (slug ? getStaticClinicBySlug(slug) : null) ?? getDefaultStaticClinic()
  if (fromStore) return toPublicClinicDto(fromStore)

  return {
    slug: slug || DEFAULT_CLINIC_SLUG,
    name: 'Shaheen Chemist',
    logoUrl: null,
    brandColour: '#2563eb',
    priceCents: 1500,
    deliveryFeeCents: 800,
    currency: 'AUD',
    orderingEnabled: true,
    pharmacyName: 'Shaheen Chemist',
    pharmacyAddress: {
      line1: '14 Circular Quay West',
      line2: 'Shop 2',
      suburb: 'Sydney',
      state: 'NSW',
      postcode: '2000',
    },
  }
}

/** Display label: prefer partner pharmacy name over generic clinic demo name. */
export function clinicDisplayName(clinic: ClinicDto): string {
  return clinic.pharmacyName?.trim() || clinic.name
}

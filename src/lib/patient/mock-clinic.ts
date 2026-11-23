import type { ClinicDto } from '@/lib/api/public-types'
import { DEFAULT_CLINIC_SLUG } from '@/lib/patient/defaults'

/** Local fallback when the public API is unavailable (frontend-only prototype). */
export function mockClinic(slug: string = DEFAULT_CLINIC_SLUG): ClinicDto {
  return {
    slug: slug || DEFAULT_CLINIC_SLUG,
    name: 'Riverside Medical Clinic',
    logoUrl: null,
    brandColour: '#2563eb',
    priceCents: 1500,
    deliveryFeeCents: 800,
    currency: 'AUD',
    orderingEnabled: true,
  }
}

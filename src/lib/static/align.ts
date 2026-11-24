import { DEFAULT_CLINIC_SLUG } from '@/lib/patient/defaults'
import { selectFeaturedComparison } from './featured'
import type { MedicinePriceComparison, StaticClinic, StaticPharmacy } from './types'

/**
 * Align the default patient clinic to the partner pharmacy with the
 * lowest comparison price (same selection rule as featured).
 */
export function alignDefaultClinicToCheapestPartner(
  clinics: StaticClinic[],
  pharmacies: StaticPharmacy[],
  comparisons: MedicinePriceComparison[],
  defaultSlug: string = DEFAULT_CLINIC_SLUG,
): StaticClinic[] {
  const featured = selectFeaturedComparison(comparisons)
  if (!featured) return clinics

  const pharmacy = pharmacies.find((p) => p.id === featured.partnerPharmacyId)
  if (!pharmacy) return clinics

  return clinics.map((clinic) => {
    if (clinic.slug !== defaultSlug) return clinic
    return {
      ...clinic,
      pharmacyId: pharmacy.id,
      name: pharmacy.name,
    }
  })
}

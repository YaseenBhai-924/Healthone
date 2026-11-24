import type { PharmacyAddress } from './types'

const AU_STATES = new Set([
  'NSW',
  'VIC',
  'QLD',
  'SA',
  'WA',
  'TAS',
  'ACT',
  'NT',
])

/** Seed / migration backfill for rows missing a usable AU address. */
export function ensureAddress(
  address: Partial<PharmacyAddress> | null | undefined,
  pharmacyName = 'Partner Pharmacy',
): PharmacyAddress {
  const line1 = address?.line1?.trim()
  const suburb = address?.suburb?.trim()
  const state = address?.state?.trim().toUpperCase()
  const postcode = address?.postcode?.trim()

  if (
    line1 &&
    suburb &&
    state &&
    AU_STATES.has(state) &&
    /^\d{4}$/.test(postcode ?? '')
  ) {
    return {
      line1,
      line2: address?.line2?.trim() || null,
      suburb,
      state,
      postcode: postcode!,
    }
  }

  return {
    line1: line1 || `1 Pharmacy Lane (${pharmacyName})`,
    line2: address?.line2?.trim() || null,
    suburb: suburb || 'Sydney',
    state: state && AU_STATES.has(state) ? state : 'NSW',
    postcode: postcode && /^\d{4}$/.test(postcode) ? postcode : '2000',
  }
}

/** Single-line Australian address for collection UI. */
export function formatAuAddress(address: PharmacyAddress | null | undefined): string | null {
  if (!address?.line1?.trim() || !address.suburb?.trim()) return null
  if (!address.state?.trim() || !address.postcode?.trim()) return null

  const street = [address.line1.trim(), address.line2?.trim()]
    .filter(Boolean)
    .join(', ')
  return `${street}, ${address.suburb.trim()} ${address.state.trim().toUpperCase()} ${address.postcode.trim()}`
}

export function hasUsableAddress(
  address: PharmacyAddress | null | undefined,
): boolean {
  return formatAuAddress(address) !== null
}

/**
 * Clinic branding types and utilities.
 *
 * Branding is loaded per-request from the API (GET /api/public/clinics/{slug})
 * and provided to components through the ClinicBrandingProvider.
 */

import { isWhiteTextTooLow, contrastRatio } from './contrast'

export interface ClinicBrand {
  /** Clinic display name */
  name: string
  /** Partner pharmacy name */
  pharmacyName: string
  /**
   * Primary colour as a CSS hex string (e.g. "#2563eb").
   * Used for CTAs and accents. Must be tested for contrast.
   */
  primaryColor: string
  /** Logo URL – undefined uses the default Script Direct wordmark */
  logoUrl?: string
  /** Clinic slug (lowercase, URL-safe) */
  slug: string
}

/** Default brand used in the root layout and as a fallback. */
export const defaultBrand: ClinicBrand = {
  name: 'Script Direct',
  pharmacyName: '',
  primaryColor: '#2563eb',
  slug: '',
}

/**
 * Returns true when white text on the given primary colour passes
 * WCAG AA (≥ 4.5 : 1).
 *
 * If this returns false the UI should switch to dark text on the
 * primary colour to maintain accessibility.
 */
export function primarySupportsWhiteText(brand: ClinicBrand): boolean {
  return !isWhiteTextTooLow(brand.primaryColor)
}

/**
 * Returns the contrast ratio of white text on the brand primary colour.
 * Useful for the component gallery contrast audit.
 */
export function primaryWhiteContrast(brand: ClinicBrand): number {
  return contrastRatio('#ffffff', brand.primaryColor)
}

/**
 * Returns the recommended text colour (white or near-black) for use on
 * the brand primary colour, honouring WCAG AA.
 */
export function primaryTextColor(brand: ClinicBrand): string {
  return primarySupportsWhiteText(brand) ? '#ffffff' : '#0f2a55'
}

/**
 * Validate a hex colour string (3 or 6 digits with optional #).
 */
export function isValidHex(value: string): boolean {
  return /^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(value)
}

/** A sample brand with a too-light primary for gallery demonstration. */
export const tooLightBrand: ClinicBrand = {
  name: 'Bright Clinic',
  pharmacyName: 'Sample Pharmacy',
  primaryColor: '#93c5fd', // brand-300 – fails white-text AA
  slug: 'bright',
}

/** A sample brand for gallery demonstration. */
export const sampleBrands: ClinicBrand[] = [
  defaultBrand,
  {
    name: 'Riverside Medical Clinic',
    pharmacyName: 'Sample Pharmacy A',
    primaryColor: '#2563eb',
    slug: 'riverside',
  },
  {
    name: 'Harbour Health Centre',
    pharmacyName: 'Sample Pharmacy B',
    primaryColor: '#0f766e', // teal – test contrast
    slug: 'harbour',
  },
  tooLightBrand,
]

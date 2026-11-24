import 'server-only'

import { getServerConfig } from '@/lib/config'
import { CLINIC_SLUG_CANDIDATES } from '@/lib/patient/defaults'
import { isStaticDemo } from '@/lib/static/is-static-demo'
import {
  getDefaultStaticClinic,
  getFeaturedStaticComparison,
  getStaticClinicBySlug,
  toPublicClinicDto,
} from '@/lib/static/store'
import type { ClinicDto, FeaturedPriceComparisonDto } from './public-types'

function apiBase(): string {
  return (
    process.env.API_BASE_URL?.replace(/\/$/, '') ||
    getServerConfig().API_BASE_URL
  )
}

/**
 * Server-side clinic fetch (uses API_BASE_URL directly — no browser rewrite).
 * Returns null on failure so marketing pages can degrade gracefully.
 * In static demo mode, serves the in-memory seed store.
 */
export async function getClinicServer(
  slug: string,
): Promise<ClinicDto | null> {
  if (isStaticDemo()) {
    const clinic = getStaticClinicBySlug(slug)
    return clinic ? toPublicClinicDto(clinic) : null
  }

  try {
    const res = await fetch(
      `${apiBase()}/api/public/clinics/${encodeURIComponent(slug)}`,
      {
        cache: 'no-store',
        headers: { Accept: 'application/json' },
      },
    )
    if (!res.ok) return null
    return (await res.json()) as ClinicDto
  } catch {
    return null
  }
}

/** Resolve the MVP default clinic, trying known seeded slugs. */
export async function getDefaultClinicServer(): Promise<ClinicDto | null> {
  if (isStaticDemo()) {
    const clinic = getDefaultStaticClinic(CLINIC_SLUG_CANDIDATES)
    return clinic ? toPublicClinicDto(clinic) : null
  }

  for (const slug of CLINIC_SLUG_CANDIDATES) {
    const clinic = await getClinicServer(slug)
    if (clinic) return clinic
  }
  return null
}

export async function getFeaturedComparisonServer(): Promise<FeaturedPriceComparisonDto | null> {
  if (isStaticDemo()) {
    return getFeaturedStaticComparison()
  }

  try {
    const res = await fetch(
      `${apiBase()}/api/public/price-comparisons/featured`,
      {
        cache: 'no-store',
        headers: { Accept: 'application/json' },
      },
    )
    if (!res.ok) return null
    return (await res.json()) as FeaturedPriceComparisonDto
  } catch {
    return getFeaturedStaticComparison()
  }
}

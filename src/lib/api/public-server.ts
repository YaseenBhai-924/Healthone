import 'server-only'

import { getServerConfig } from '@/lib/config'
import { CLINIC_SLUG_CANDIDATES } from '@/lib/patient/defaults'
import type { ClinicDto } from './public-types'

function apiBase(): string {
  return (
    process.env.API_BASE_URL?.replace(/\/$/, '') ||
    getServerConfig().API_BASE_URL
  )
}

/**
 * Server-side clinic fetch (uses API_BASE_URL directly — no browser rewrite).
 * Returns null on failure so marketing pages can degrade gracefully.
 */
export async function getClinicServer(
  slug: string,
): Promise<ClinicDto | null> {
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
  for (const slug of CLINIC_SLUG_CANDIDATES) {
    const clinic = await getClinicServer(slug)
    if (clinic) return clinic
  }
  return null
}

/**
 * MVP has a single partner pharmacy / clinic for public online ordering.
 * Dev/Azure seed uses `demo-clinic-a` (SeedRunner). DevelopmentSeeder may
 * also create `test-clinic-a` — we try both when resolving.
 */
export const DEFAULT_CLINIC_SLUG =
  process.env.NEXT_PUBLIC_DEFAULT_CLINIC_SLUG?.trim() || 'demo-clinic-a'

/** Ordered fallbacks when the preferred slug is missing from the DB. */
export const CLINIC_SLUG_CANDIDATES = [
  DEFAULT_CLINIC_SLUG,
  'demo-clinic-a',
  'test-clinic-a',
].filter((s, i, arr) => arr.indexOf(s) === i)

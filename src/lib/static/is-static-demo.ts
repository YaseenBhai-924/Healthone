/**
 * Frontend-only / no-API mode.
 * Defaults ON outside production so HQ pharmacies, price comparisons, and
 * patient featured/collection UI work without the .NET API / Entra.
 * Set STATIC_DEMO=0 to force live API behaviour.
 */
export function isStaticDemo(
  env: NodeJS.ProcessEnv | Record<string, string | undefined> = process.env,
): boolean {
  const flag = env.STATIC_DEMO?.trim().toLowerCase()
  if (flag === '0' || flag === 'false' || flag === 'off') return false
  if (flag === '1' || flag === 'true' || flag === 'on') return true
  return env.NODE_ENV !== 'production'
}


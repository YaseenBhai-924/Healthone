/**
 * Content-Security-Policy builder (task 6.4.5 / architecture §12).
 *
 * Scripts: per-request nonce + strict-dynamic (Next.js App Router).
 * Stripe Checkout / Elements domains allowed for script, frame, connect.
 * Entra sign-in allowed on form-action.
 * Clinic logos may be any https host (URL validated in ClinicLogo).
 */

export type CspOptions = {
  nonce: string
  /** When true, allow unsafe-eval for Next.js / Turbopack HMR. */
  isDev?: boolean
  /**
   * Extra img-src hosts (space-separated), e.g. a known CDN.
   * Always includes 'self', data:, blob:, and https: for clinic logos.
   */
  extraImgSrc?: string
}

/** Generate a CSP nonce (base64 of 16 random bytes). */
export function createCspNonce(): string {
  const bytes = new Uint8Array(16)
  crypto.getRandomValues(bytes)
  let binary = ''
  for (const b of bytes) binary += String.fromCharCode(b)
  return btoa(binary)
}

/**
 * Build a single-line Content-Security-Policy value.
 * Keep directives ordered and deterministic for tests.
 */
export function buildContentSecurityPolicy({
  nonce,
  isDev = false,
  extraImgSrc = '',
}: CspOptions): string {
  const scriptSrc = [
    "'self'",
    `'nonce-${nonce}'`,
    "'strict-dynamic'",
    'https://js.stripe.com',
    ...(isDev ? ["'unsafe-eval'"] : []),
  ]

  const imgSrc = [
    "'self'",
    'data:',
    'blob:',
    'https:',
    ...extraImgSrc.split(/\s+/).filter(Boolean),
  ]

  const directives: string[] = [
    "default-src 'self'",
    `script-src ${scriptSrc.join(' ')}`,
    // React inline style="" attributes require unsafe-inline for style-src-attr;
    // stylesheets remain same-origin. Nonces cover Next-injected <style> tags.
    `style-src 'self' 'nonce-${nonce}' 'unsafe-inline'`,
    `img-src ${[...new Set(imgSrc)].join(' ')}`,
    "font-src 'self'",
    "worker-src 'self' blob:",
    [
      'frame-src',
      "'self'",
      'https://js.stripe.com',
      'https://hooks.stripe.com',
      'https://checkout.stripe.com',
    ].join(' '),
    [
      'connect-src',
      "'self'",
      'https://api.stripe.com',
      'https://m.stripe.network',
    ].join(' '),
    [
      'form-action',
      "'self'",
      'https://login.microsoftonline.com',
    ].join(' '),
    "base-uri 'self'",
    "object-src 'none'",
    "frame-ancestors 'none'",
  ]

  if (!isDev) {
    directives.push('upgrade-insecure-requests')
  }

  return directives.join('; ').replace(/\s{2,}/g, ' ').trim()
}

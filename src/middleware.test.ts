import { NextRequest } from 'next/server'
import { beforeAll, describe, expect, it, vi } from 'vitest'

vi.mock('next-auth', () => ({
  default: () => ({
    auth: (handler: (req: unknown) => unknown) => handler,
  }),
}))
vi.mock('@/auth.config', () => ({
  default: { providers: [], callbacks: {} },
}))

describe('security middleware headers', () => {
  let applySecurityHeaders: typeof import('./middleware').applySecurityHeaders
  let isCacheablePath: typeof import('./middleware').isCacheablePath

  beforeAll(async () => {
    const mod = await import('./middleware')
    applySecurityHeaders = mod.applySecurityHeaders
    isCacheablePath = mod.isCacheablePath
  })

  function requestFor(path: string): NextRequest {
    return new NextRequest(new URL(path, 'http://localhost:3000'))
  }

  it('sets no-store and baseline headers on dynamic routes', () => {
    const response = applySecurityHeaders(requestFor('/admin'))

    expect(response.headers.get('Cache-Control')).toBe('no-store')
    expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff')
    expect(response.headers.get('Referrer-Policy')).toBe('no-referrer')
    expect(response.headers.get('X-Frame-Options')).toBe('DENY')
    expect(response.headers.get('Permissions-Policy')).toBe(
      'camera=(), microphone=(), geolocation=()',
    )
  })

  it('sets a nonce-based Content-Security-Policy', () => {
    const response = applySecurityHeaders(requestFor('/'))
    const csp = response.headers.get('Content-Security-Policy') ?? ''

    expect(csp).toContain("default-src 'self'")
    expect(csp).toMatch(/'nonce-[A-Za-z0-9+/=]+'/)
    expect(csp).toContain("'strict-dynamic'")
    expect(csp).toContain('https://js.stripe.com')
    expect(csp).toContain('https://login.microsoftonline.com')
    expect(csp).toContain("frame-ancestors 'none'")
    expect(csp).toContain("object-src 'none'")
  })

  it('does not set no-store on /_next/static assets', () => {
    expect(isCacheablePath('/_next/static/chunks/main.js')).toBe(true)

    const response = applySecurityHeaders(
      requestFor('/_next/static/chunks/main.js'),
    )

    expect(response.headers.get('Cache-Control')).toBeNull()
    expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff')
    expect(response.headers.get('Content-Security-Policy')).toBeTruthy()
  })
})

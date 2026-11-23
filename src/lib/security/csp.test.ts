import { describe, expect, it } from 'vitest'
import { buildContentSecurityPolicy, createCspNonce } from './csp'

describe('createCspNonce', () => {
  it('returns a non-empty base64-looking string', () => {
    const nonce = createCspNonce()
    expect(nonce.length).toBeGreaterThan(10)
    expect(nonce).toMatch(/^[A-Za-z0-9+/=]+$/)
  })

  it('returns unique values', () => {
    const a = createCspNonce()
    const b = createCspNonce()
    expect(a).not.toBe(b)
  })
})

describe('buildContentSecurityPolicy', () => {
  const nonce = 'testNonceValue=='

  it('includes the nonce on script-src and style-src', () => {
    const csp = buildContentSecurityPolicy({ nonce })
    expect(csp).toContain(`'nonce-${nonce}'`)
    expect(csp).toContain("'strict-dynamic'")
    expect(csp).toContain('https://js.stripe.com')
  })

  it('allows Entra form-action and Stripe frames', () => {
    const csp = buildContentSecurityPolicy({ nonce })
    expect(csp).toContain('form-action')
    expect(csp).toContain('https://login.microsoftonline.com')
    expect(csp).toContain('https://checkout.stripe.com')
    expect(csp).toContain('https://api.stripe.com')
  })

  it('blocks framing and plugins', () => {
    const csp = buildContentSecurityPolicy({ nonce })
    expect(csp).toContain("frame-ancestors 'none'")
    expect(csp).toContain("object-src 'none'")
  })

  it('adds unsafe-eval only in development', () => {
    const prod = buildContentSecurityPolicy({ nonce, isDev: false })
    const dev = buildContentSecurityPolicy({ nonce, isDev: true })
    expect(prod).not.toContain("'unsafe-eval'")
    expect(dev).toContain("'unsafe-eval'")
    expect(prod).toContain('upgrade-insecure-requests')
    expect(dev).not.toContain('upgrade-insecure-requests')
  })

  it('allows https images for clinic logos', () => {
    const csp = buildContentSecurityPolicy({ nonce })
    expect(csp).toMatch(/img-src[^;]*https:/)
  })
})

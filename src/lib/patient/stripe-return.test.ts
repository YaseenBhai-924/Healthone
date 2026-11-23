import { describe, expect, it } from 'vitest'
import {
  parseStripePaymentReturn,
  stripStripeReturnParams,
} from './stripe-return'

describe('parseStripePaymentReturn', () => {
  it('detects a successful 3DS return', () => {
    const r = parseStripePaymentReturn(
      'payment_intent=pi_1&payment_intent_client_secret=pi_1_secret_x&redirect_status=succeeded',
    )
    expect(r.isReturn).toBe(true)
    expect(r.isPaid).toBe(true)
    expect(r.isFailed).toBe(false)
    expect(r.paymentIntentId).toBe('pi_1')
  })

  it('detects a failed return', () => {
    const r = parseStripePaymentReturn('redirect_status=failed&paid=1')
    expect(r.isReturn).toBe(true)
    expect(r.isPaid).toBe(false)
    expect(r.isFailed).toBe(true)
  })

  it('treats paid=1 without failure as paid (same-page confirm)', () => {
    const r = parseStripePaymentReturn('paid=1')
    expect(r.isReturn).toBe(true)
    expect(r.isPaid).toBe(true)
  })

  it('ignores unrelated query strings', () => {
    const r = parseStripePaymentReturn('utm_source=test')
    expect(r.isReturn).toBe(false)
    expect(r.isPaid).toBe(false)
  })
})

describe('stripStripeReturnParams', () => {
  it('removes Stripe params and keeps the path', () => {
    const url = new URL(
      'http://localhost:3000/c/demo/request?paid=1&payment_intent=pi_x&redirect_status=succeeded&keep=1',
    )
    expect(stripStripeReturnParams(url)).toBe('/c/demo/request?keep=1')
  })
})

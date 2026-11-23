import { describe, expect, it } from 'vitest'
import {
  centsToDollarsInput,
  dollarsToCents,
  invoiceTotalCents,
} from './invoice-totals'

describe('invoice-totals', () => {
  it('converts dollars to cents with rounding', () => {
    expect(dollarsToCents('12.34')).toBe(1234)
    expect(dollarsToCents('0.005')).toBe(1)
    expect(dollarsToCents('-1')).toBeNull()
    expect(dollarsToCents('abc')).toBeNull()
  })

  it('formats cents for input', () => {
    expect(centsToDollarsInput(800)).toBe('8.00')
    expect(centsToDollarsInput(0)).toBe('0.00')
  })

  it('sums line items and optional delivery', () => {
    const lines = [
      { quantity: '2', unitPriceDollars: '10.00' },
      { quantity: '1', unitPriceDollars: '5.50' },
    ]
    expect(invoiceTotalCents(lines, '8.00', true)).toBe(3350)
    expect(invoiceTotalCents(lines, '8.00', false)).toBe(2550)
  })

  it('skips incomplete lines in the live total', () => {
    expect(
      invoiceTotalCents(
        [{ quantity: '1', unitPriceDollars: '' }],
        '0',
        false,
      ),
    ).toBe(0)
  })
})

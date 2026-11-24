import { describe, expect, it } from 'vitest'
import { ensureAddress, formatAuAddress, hasUsableAddress } from './address'

describe('ensureAddress', () => {
  it('backfills incomplete pharmacy addresses', () => {
    const address = ensureAddress({ line1: '' }, 'Harbour Partner Pharmacy')
    expect(address.line1).toContain('Harbour Partner Pharmacy')
    expect(address.suburb).toBe('Sydney')
    expect(address.state).toBe('NSW')
    expect(address.postcode).toBe('2000')
  })

  it('keeps a complete AU address', () => {
    const address = ensureAddress({
      line1: '14 Circular Quay West',
      line2: 'Shop 2',
      suburb: 'Sydney',
      state: 'nsw',
      postcode: '2000',
    })
    expect(address).toEqual({
      line1: '14 Circular Quay West',
      line2: 'Shop 2',
      suburb: 'Sydney',
      state: 'NSW',
      postcode: '2000',
    })
  })
})

describe('formatAuAddress', () => {
  it('formats a single-line AU address', () => {
    expect(
      formatAuAddress({
        line1: '14 Circular Quay West',
        line2: 'Shop 2',
        suburb: 'Sydney',
        state: 'NSW',
        postcode: '2000',
      }),
    ).toBe('14 Circular Quay West, Shop 2, Sydney NSW 2000')
  })

  it('returns null when required parts are missing', () => {
    expect(
      formatAuAddress({
        line1: '',
        suburb: 'Sydney',
        state: 'NSW',
        postcode: '2000',
      }),
    ).toBeNull()
    expect(hasUsableAddress(null)).toBe(false)
  })
})

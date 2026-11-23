import { describe, it, expect } from 'vitest'
import {
  primarySupportsWhiteText,
  primaryWhiteContrast,
  primaryTextColor,
  isValidHex,
  defaultBrand,
  tooLightBrand,
} from './branding'

describe('primarySupportsWhiteText', () => {
  it('returns true for the default brand (#2563eb)', () => {
    expect(primarySupportsWhiteText(defaultBrand)).toBe(true)
  })

  it('returns false for a too-light brand colour', () => {
    expect(primarySupportsWhiteText(tooLightBrand)).toBe(false)
  })
})

describe('primaryWhiteContrast', () => {
  it('returns ≥ 4.5 for the default brand', () => {
    expect(primaryWhiteContrast(defaultBrand)).toBeGreaterThanOrEqual(4.5)
  })

  it('returns < 4.5 for the too-light brand', () => {
    expect(primaryWhiteContrast(tooLightBrand)).toBeLessThan(4.5)
  })
})

describe('primaryTextColor', () => {
  it('returns white for a dark primary', () => {
    expect(primaryTextColor(defaultBrand)).toBe('#ffffff')
  })

  it('returns dark for a light primary', () => {
    expect(primaryTextColor(tooLightBrand)).toBe('#0f2a55')
  })
})

describe('isValidHex', () => {
  it('accepts 6-digit hex with hash', () => {
    expect(isValidHex('#2563eb')).toBe(true)
  })

  it('accepts 3-digit hex', () => {
    expect(isValidHex('#fff')).toBe(true)
  })

  it('accepts hex without hash', () => {
    expect(isValidHex('2563eb')).toBe(true)
  })

  it('rejects invalid strings', () => {
    expect(isValidHex('not-a-colour')).toBe(false)
    expect(isValidHex('#gggggg')).toBe(false)
    expect(isValidHex('')).toBe(false)
  })
})

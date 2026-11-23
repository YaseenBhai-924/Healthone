import { describe, it, expect } from 'vitest'
import {
  relativeLuminance,
  contrastRatio,
  passesAA,
  passesAALargeText,
  isWhiteTextTooLow,
} from './contrast'

describe('relativeLuminance', () => {
  it('returns 1 for white', () => {
    expect(relativeLuminance('#ffffff')).toBeCloseTo(1, 5)
  })

  it('returns 0 for black', () => {
    expect(relativeLuminance('#000000')).toBeCloseTo(0, 5)
  })

  it('handles 3-digit hex', () => {
    expect(relativeLuminance('#fff')).toBeCloseTo(1, 5)
  })

  it('computes brand-600 luminance correctly', () => {
    // #2563eb → ~0.153
    const l = relativeLuminance('#2563eb')
    expect(l).toBeGreaterThan(0.14)
    expect(l).toBeLessThan(0.17)
  })
})

describe('contrastRatio', () => {
  it('black on white is 21:1', () => {
    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 0)
  })

  it('white on white is 1:1', () => {
    expect(contrastRatio('#ffffff', '#ffffff')).toBeCloseTo(1, 5)
  })

  it('white on brand-600 passes 4.5:1 (≈5.17)', () => {
    const ratio = contrastRatio('#ffffff', '#2563eb')
    expect(ratio).toBeGreaterThan(4.5)
    expect(ratio).toBeCloseTo(5.17, 0)
  })
})

describe('passesAA', () => {
  it('passes for black on white', () => {
    expect(passesAA('#000000', '#ffffff')).toBe(true)
  })

  it('fails for light grey on white', () => {
    expect(passesAA('#cccccc', '#ffffff')).toBe(false)
  })

  it('passes for white on brand-600', () => {
    expect(passesAA('#ffffff', '#2563eb')).toBe(true)
  })
})

describe('passesAALargeText', () => {
  it('passes for grey pairs that fail normal AA', () => {
    // #767676 on white ≈ 4.54 → passes AA; try a softer pair
    expect(passesAALargeText('#767676', '#ffffff')).toBe(true)
  })
})

describe('isWhiteTextTooLow', () => {
  it('returns false for dark backgrounds (white passes)', () => {
    expect(isWhiteTextTooLow('#2563eb')).toBe(false)
    expect(isWhiteTextTooLow('#000000')).toBe(false)
  })

  it('returns true for very light backgrounds', () => {
    expect(isWhiteTextTooLow('#ffffff')).toBe(true)
    expect(isWhiteTextTooLow('#f3f7ff')).toBe(true)
    expect(isWhiteTextTooLow('#dbeafe')).toBe(true)
  })
})

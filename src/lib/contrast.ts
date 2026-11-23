/**
 * WCAG 2.1 colour contrast utilities.
 *
 * Reference: https://www.w3.org/TR/WCAG21/#dfn-relative-luminance
 */

/** Parse a 3- or 6-digit hex colour into { r, g, b } in [0, 255]. */
function parseHex(hex: string): { r: number; g: number; b: number } {
  const h = hex.replace(/^#/, '')
  if (h.length === 3) {
    return {
      r: parseInt(h[0] + h[0], 16),
      g: parseInt(h[1] + h[1], 16),
      b: parseInt(h[2] + h[2], 16),
    }
  }
  if (h.length === 6) {
    return {
      r: parseInt(h.slice(0, 2), 16),
      g: parseInt(h.slice(2, 4), 16),
      b: parseInt(h.slice(4, 6), 16),
    }
  }
  throw new Error(`Invalid hex colour: ${hex}`)
}

/** Convert a sRGB channel value [0, 255] to linear light. */
function toLinear(c: number): number {
  const s = c / 255
  return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
}

/**
 * Compute the WCAG relative luminance of a hex colour.
 * Returns a value in [0, 1].
 */
export function relativeLuminance(hex: string): number {
  const { r, g, b } = parseHex(hex)
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b)
}

/**
 * Compute the WCAG contrast ratio between two luminance values.
 * Returns a value ≥ 1.
 */
export function contrastRatioFromLuminance(l1: number, l2: number): number {
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)
  return (lighter + 0.05) / (darker + 0.05)
}

/**
 * Compute the WCAG contrast ratio between two hex colours.
 * Returns a value ≥ 1.
 */
export function contrastRatio(hex1: string, hex2: string): number {
  return contrastRatioFromLuminance(
    relativeLuminance(hex1),
    relativeLuminance(hex2),
  )
}

/** WCAG AA normal text requires ≥ 4.5 : 1. */
export function passesAA(hex1: string, hex2: string): boolean {
  return contrastRatio(hex1, hex2) >= 4.5
}

/** WCAG AA large text / UI components requires ≥ 3 : 1. */
export function passesAALargeText(hex1: string, hex2: string): boolean {
  return contrastRatio(hex1, hex2) >= 3
}

/**
 * Returns true if white text (#ffffff) on the given background colour
 * fails WCAG AA contrast (< 4.5 : 1).
 *
 * Use this to decide whether a custom brand colour needs fallback
 * handling (e.g. switch to dark text).
 */
export function isWhiteTextTooLow(backgroundHex: string): boolean {
  return !passesAA('#ffffff', backgroundHex)
}

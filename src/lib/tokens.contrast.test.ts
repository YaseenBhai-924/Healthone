import { describe, it, expect } from 'vitest'
import { contrastRatio } from './contrast'

/** Default token pairs from task 1.4.5 — text ≥4.5:1, control borders ≥3:1. */
const TEXT_PAIRS: Array<[string, string, string]> = [
  ['fg on surface', '#0f172a', '#ffffff'],
  ['fg-muted on page', '#475569', '#f8fafc'],
  ['fg-muted on surface', '#475569', '#ffffff'],
  ['white on brand-600', '#ffffff', '#2563eb'],
  ['white on brand-700', '#ffffff', '#1d4ed8'],
  ['white on brand-800', '#ffffff', '#1e40af'],
  ['success-fg on success-bg', '#15803d', '#f0fdf4'],
  ['warning-fg on warning-bg', '#92400e', '#fffbeb'],
  ['danger-fg on danger-bg', '#b91c1c', '#fef2f2'],
  ['info-fg on brand-50', '#2563eb', '#eff6ff'],
]

const BORDER_PAIRS: Array<[string, string, string]> = [
  ['border-control on surface', '#64748b', '#ffffff'],
  ['border-control on page', '#64748b', '#f8fafc'],
]

describe('default token contrast', () => {
  it.each(TEXT_PAIRS)('%s is at least 4.5:1', (_name, fg, bg) => {
    expect(contrastRatio(fg, bg)).toBeGreaterThanOrEqual(4.5)
  })

  it.each(BORDER_PAIRS)('%s is at least 3:1', (_name, border, bg) => {
    expect(contrastRatio(border, bg)).toBeGreaterThanOrEqual(3)
  })

  it('focus ring brand-600 on white is at least 3:1', () => {
    expect(contrastRatio('#2563eb', '#ffffff')).toBeGreaterThanOrEqual(3)
  })
})

import { describe, expect, it } from 'vitest'
import {
  getFeaturedPriceComparison,
  selectFeaturedComparison,
} from './featured'
import type { MedicinePriceComparison } from './types'

function cmp(
  partial: Partial<MedicinePriceComparison> &
    Pick<
      MedicinePriceComparison,
      'id' | 'medicineName' | 'ourPriceCents' | 'competitors'
    >,
): MedicinePriceComparison {
  return {
    partnerPharmacyId: 'p1',
    partnerPharmacyName: 'Partner A',
    notes: null,
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...partial,
  }
}

describe('selectFeaturedComparison', () => {
  it('ignores comparisons without competitors', () => {
    expect(
      selectFeaturedComparison([
        cmp({
          id: '1',
          medicineName: 'Solo',
          ourPriceCents: 100,
          competitors: [],
        }),
      ]),
    ).toBeNull()
  })

  it('picks lowest partner price, then largest saving, then newest', () => {
    const selected = selectFeaturedComparison([
      cmp({
        id: 'high',
        medicineName: 'High',
        ourPriceCents: 20000,
        competitors: [{ pharmacyName: 'X', priceCents: 30000 }],
        updatedAt: '2026-06-01T00:00:00.000Z',
      }),
      cmp({
        id: 'low-small-save',
        medicineName: 'Low small',
        ourPriceCents: 10000,
        competitors: [{ pharmacyName: 'Y', priceCents: 11000 }],
        updatedAt: '2026-06-02T00:00:00.000Z',
      }),
      cmp({
        id: 'low-big-save',
        medicineName: 'Low big',
        ourPriceCents: 10000,
        competitors: [{ pharmacyName: 'Z', priceCents: 25000 }],
        updatedAt: '2026-05-01T00:00:00.000Z',
      }),
    ])
    expect(selected?.id).toBe('low-big-save')
  })

  it('builds featured dto with 2–3 highest competitors and deltas', () => {
    const featured = getFeaturedPriceComparison([
      cmp({
        id: '1',
        medicineName: 'Voren 500',
        ourPriceCents: 1000,
        partnerPharmacyName: 'Shaheen Chemist',
        competitors: [
          { pharmacyName: 'A', priceCents: 2000 },
          { pharmacyName: 'B', priceCents: 10000 },
          { pharmacyName: 'C', priceCents: 5000 },
          { pharmacyName: 'D', priceCents: 3000 },
        ],
      }),
    ])
    expect(featured).toMatchObject({
      medicineName: 'Voren 500',
      ourPriceCents: 1000,
      partnerPharmacyName: 'Shaheen Chemist',
      currency: 'AUD',
      maxSavingCents: 9000,
    })
    expect(featured?.competitors).toHaveLength(3)
    expect(featured?.competitors.map((c) => c.pharmacyName)).toEqual([
      'B',
      'C',
      'D',
    ])
    expect(featured?.competitors[0]?.deltaCents).toBe(9000)
  })
})

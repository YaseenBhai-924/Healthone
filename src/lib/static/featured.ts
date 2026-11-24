import type {
  FeaturedCompetitor,
  FeaturedPriceComparison,
  MedicinePriceComparison,
} from './types'

function maxCompetitorPrice(c: MedicinePriceComparison): number {
  return Math.max(...c.competitors.map((x) => x.priceCents), 0)
}

function savingCents(c: MedicinePriceComparison): number {
  return Math.max(0, maxCompetitorPrice(c) - c.ourPriceCents)
}

/**
 * Pick the comparison with the lowest partner OurPriceCents,
 * then largest saving, then most recently updated.
 * Only comparisons that have competitors are eligible.
 */
export function selectFeaturedComparison(
  comparisons: MedicinePriceComparison[],
): MedicinePriceComparison | null {
  const eligible = comparisons.filter((c) => c.competitors.length > 0)
  if (eligible.length === 0) return null

  return [...eligible].sort((a, b) => {
    if (a.ourPriceCents !== b.ourPriceCents) {
      return a.ourPriceCents - b.ourPriceCents
    }
    const saveDiff = savingCents(b) - savingCents(a)
    if (saveDiff !== 0) return saveDiff
    return b.updatedAt.localeCompare(a.updatedAt)
  })[0]!
}

/** 2–3 highest competitor prices with delta vs partner. */
export function toFeaturedDto(
  comparison: MedicinePriceComparison,
  currency = 'AUD',
): FeaturedPriceComparison {
  const competitors: FeaturedCompetitor[] = [...comparison.competitors]
    .sort((a, b) => b.priceCents - a.priceCents)
    .slice(0, 3)
    .map((c) => ({
      pharmacyName: c.pharmacyName,
      priceCents: c.priceCents,
      deltaCents: c.priceCents - comparison.ourPriceCents,
    }))

  const maxSavingCents = Math.max(
    0,
    ...competitors.map((c) => c.deltaCents),
  )

  return {
    medicineName: comparison.medicineName,
    ourPriceCents: comparison.ourPriceCents,
    partnerPharmacyName: comparison.partnerPharmacyName,
    currency,
    maxSavingCents,
    competitors,
  }
}

export function getFeaturedPriceComparison(
  comparisons: MedicinePriceComparison[],
  currency = 'AUD',
): FeaturedPriceComparison | null {
  const selected = selectFeaturedComparison(comparisons)
  return selected ? toFeaturedDto(selected, currency) : null
}

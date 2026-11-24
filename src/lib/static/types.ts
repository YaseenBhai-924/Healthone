export type PharmacyAddress = {
  line1: string
  line2?: string | null
  suburb: string
  state: string
  postcode: string
}

export type StaticPharmacy = {
  id: string
  name: string
  alertRecipients: string[]
  entraGroupId: string
  isActive: boolean
  orders: number
  grossCents: number
  newRequests: number
  address: PharmacyAddress
}

export type CompetitorPrice = {
  pharmacyName: string
  priceCents: number
}

export type MedicinePriceComparison = {
  id: string
  medicineName: string
  ourPriceCents: number
  partnerPharmacyId: string
  partnerPharmacyName: string
  notes: string | null
  competitors: CompetitorPrice[]
  updatedAt: string // ISO UTC
}

export type StaticClinic = {
  id: string
  slug: string
  name: string
  pharmacyId: string
  pricingItemId: string
  logoUrl: string | null
  brandColour: string
  isActive: boolean
  priceCents: number
  deliveryFeeCents: number
  currency: string
  orderingEnabled: boolean
}

export type FeaturedCompetitor = {
  pharmacyName: string
  priceCents: number
  deltaCents: number
}

export type FeaturedPriceComparison = {
  medicineName: string
  ourPriceCents: number
  partnerPharmacyName: string
  currency: string
  maxSavingCents: number
  competitors: FeaturedCompetitor[]
}

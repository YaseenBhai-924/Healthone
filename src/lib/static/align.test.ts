import { describe, expect, it } from 'vitest'
import { alignDefaultClinicToCheapestPartner } from './align'
import {
  CLINIC_A_ID,
  PHARMACY_A_ID,
  PHARMACY_B_ID,
  PRICING_ITEM_ID,
} from './seed'
import type { MedicinePriceComparison, StaticClinic, StaticPharmacy } from './types'

const pharmacies: StaticPharmacy[] = [
  {
    id: PHARMACY_A_ID,
    name: 'Harbour Partner Pharmacy',
    alertRecipients: ['a@example.com'],
    entraGroupId: 'aaaaaaaa-0000-4000-8000-000000000001',
    isActive: true,
    orders: 0,
    grossCents: 0,
    newRequests: 0,
    address: {
      line1: '1 A St',
      suburb: 'Sydney',
      state: 'NSW',
      postcode: '2000',
    },
  },
  {
    id: PHARMACY_B_ID,
    name: 'Riverside Compounding',
    alertRecipients: ['b@example.com'],
    entraGroupId: 'aaaaaaaa-0000-4000-8000-000000000002',
    isActive: true,
    orders: 0,
    grossCents: 0,
    newRequests: 0,
    address: {
      line1: '2 B St',
      suburb: 'Richmond',
      state: 'VIC',
      postcode: '3121',
    },
  },
]

const baseClinic: StaticClinic = {
  id: CLINIC_A_ID,
  slug: 'demo-clinic-a',
  name: 'Old Demo Name',
  pharmacyId: PHARMACY_B_ID,
  pricingItemId: PRICING_ITEM_ID,
  logoUrl: null,
  brandColour: '#2563eb',
  isActive: true,
  priceCents: 1500,
  deliveryFeeCents: 800,
  currency: 'AUD',
  orderingEnabled: true,
}

describe('alignDefaultClinicToCheapestPartner', () => {
  it('sets default clinic pharmacy + display name to cheapest partner', () => {
    const comparisons: MedicinePriceComparison[] = [
      {
        id: '1',
        medicineName: 'Cheap at A',
        ourPriceCents: 10000,
        partnerPharmacyId: PHARMACY_A_ID,
        partnerPharmacyName: 'Harbour Partner Pharmacy',
        notes: null,
        competitors: [{ pharmacyName: 'Retail', priceCents: 20000 }],
        updatedAt: '2026-01-01T00:00:00.000Z',
      },
      {
        id: '2',
        medicineName: 'Dearer at B',
        ourPriceCents: 20000,
        partnerPharmacyId: PHARMACY_B_ID,
        partnerPharmacyName: 'Riverside Compounding',
        notes: null,
        competitors: [{ pharmacyName: 'Retail', priceCents: 25000 }],
        updatedAt: '2026-01-01T00:00:00.000Z',
      },
    ]

    const [aligned] = alignDefaultClinicToCheapestPartner(
      [baseClinic],
      pharmacies,
      comparisons,
    )
    expect(aligned?.pharmacyId).toBe(PHARMACY_A_ID)
    expect(aligned?.name).toBe('Harbour Partner Pharmacy')
  })
})

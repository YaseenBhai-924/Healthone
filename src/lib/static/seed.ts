import { ensureAddress } from './address'
import type {
  MedicinePriceComparison,
  StaticClinic,
  StaticPharmacy,
} from './types'

export const PHARMACY_A_ID = '11111111-1111-4111-8111-111111111111'
export const PHARMACY_B_ID = '22222222-2222-4222-8222-222222222222'
export const CLINIC_A_ID = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
export const PRICING_ITEM_ID = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'

export function createSeedPharmacies(): StaticPharmacy[] {
  return [
    {
      id: PHARMACY_A_ID,
      name: 'Shaheen Chemist',
      alertRecipients: ['orders@shaheen.example'],
      entraGroupId: 'aaaaaaaa-0000-4000-8000-000000000001',
      isActive: true,
      orders: 42,
      grossCents: 126000,
      newRequests: 3,
      address: ensureAddress({
        line1: '14 Circular Quay West',
        line2: 'Shop 2',
        suburb: 'Sydney',
        state: 'NSW',
        postcode: '2000',
      }),
    },
    {
      id: PHARMACY_B_ID,
      name: 'Riverside Compounding',
      alertRecipients: ['dispensary@riverside.example'],
      entraGroupId: 'aaaaaaaa-0000-4000-8000-000000000002',
      isActive: true,
      orders: 18,
      grossCents: 54000,
      newRequests: 1,
      address: ensureAddress({
        line1: '88 Bridge Road',
        suburb: 'Richmond',
        state: 'VIC',
        postcode: '3121',
      }),
    },
  ]
}

export function createSeedClinics(): StaticClinic[] {
  return [
    {
      id: CLINIC_A_ID,
      slug: 'demo-clinic-a',
      name: 'Shaheen Chemist',
      pharmacyId: PHARMACY_A_ID,
      pricingItemId: PRICING_ITEM_ID,
      logoUrl: null,
      brandColour: '#2563eb',
      isActive: true,
      priceCents: 1500,
      deliveryFeeCents: 800,
      currency: 'AUD',
      orderingEnabled: true,
    },
  ]
}

export function createSeedComparisons(
  nowIso = new Date().toISOString(),
): MedicinePriceComparison[] {
  return [
    {
      id: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
      medicineName: 'Voren 500',
      ourPriceCents: 1000,
      partnerPharmacyId: PHARMACY_A_ID,
      partnerPharmacyName: 'Shaheen Chemist',
      notes: 'Partner network rate',
      competitors: [
        { pharmacyName: 'D watson', priceCents: 10000 },
        { pharmacyName: 'Asim Pharmacy', priceCents: 5000 },
      ],
      updatedAt: nowIso,
    },
    {
      id: 'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
      medicineName: 'Mounjaro 5 mg',
      ourPriceCents: 24500,
      partnerPharmacyId: PHARMACY_B_ID,
      partnerPharmacyName: 'Riverside Compounding',
      notes: null,
      competitors: [
        { pharmacyName: 'Coastal Care Pharmacy', priceCents: 29900 },
        { pharmacyName: 'QuickScripts Hub', priceCents: 31200 },
      ],
      updatedAt: nowIso,
    },
  ]
}

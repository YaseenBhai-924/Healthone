import { DEFAULT_CLINIC_SLUG } from '@/lib/patient/defaults'
import { ensureAddress, hasUsableAddress } from './address'
import { alignDefaultClinicToCheapestPartner } from './align'
import {
  comparisonsToCsv,
  groupCsvRowsIntoComparisons,
  parsePriceComparisonCsv,
} from './csv'
import { getFeaturedPriceComparison } from './featured'
import {
  createSeedClinics,
  createSeedComparisons,
  createSeedPharmacies,
} from './seed'
import type {
  FeaturedPriceComparison,
  MedicinePriceComparison,
  PharmacyAddress,
  StaticClinic,
  StaticPharmacy,
} from './types'
import type { ClinicDto } from '@/lib/api/public-types'

type StoreState = {
  pharmacies: StaticPharmacy[]
  clinics: StaticClinic[]
  comparisons: MedicinePriceComparison[]
}

const globalForStore = globalThis as unknown as {
  __sdStaticStore?: StoreState
}

function nowIso(): string {
  return new Date().toISOString()
}

function createInitialState(): StoreState {
  const pharmacies = createSeedPharmacies().map((p) => ({
    ...p,
    address: ensureAddress(p.address, p.name),
  }))
  const comparisons = createSeedComparisons(nowIso())
  let clinics = createSeedClinics()
  clinics = alignDefaultClinicToCheapestPartner(
    clinics,
    pharmacies,
    comparisons,
  )
  return { pharmacies, clinics, comparisons }
}

function state(): StoreState {
  if (!globalForStore.__sdStaticStore) {
    globalForStore.__sdStaticStore = createInitialState()
  }
  return globalForStore.__sdStaticStore
}

function realign(): void {
  const s = state()
  s.clinics = alignDefaultClinicToCheapestPartner(
    s.clinics,
    s.pharmacies,
    s.comparisons,
  )
}

/** Test helper — reset to seed. */
export function resetStaticStore(): void {
  globalForStore.__sdStaticStore = createInitialState()
}

export function listStaticPharmacies(): StaticPharmacy[] {
  return state().pharmacies.map((p) => ({ ...p }))
}

export function getStaticPharmacy(id: string): StaticPharmacy | null {
  const p = state().pharmacies.find((x) => x.id === id)
  return p ? { ...p, address: { ...p.address } } : null
}

export function upsertStaticPharmacy(input: {
  id?: string | null
  name: string
  alertRecipients: string[]
  entraGroupId: string
  isActive: boolean
  address: PharmacyAddress
}): StaticPharmacy {
  const s = state()
  const address = ensureAddress(input.address, input.name)
  if (input.id) {
    const idx = s.pharmacies.findIndex((p) => p.id === input.id)
    if (idx < 0) throw new Error('Pharmacy not found')
    const prev = s.pharmacies[idx]!
    const next: StaticPharmacy = {
      ...prev,
      name: input.name.trim(),
      alertRecipients: input.alertRecipients,
      entraGroupId: input.entraGroupId.trim(),
      isActive: input.isActive,
      address,
    }
    s.pharmacies[idx] = next
    s.comparisons = s.comparisons.map((c) =>
      c.partnerPharmacyId === next.id
        ? { ...c, partnerPharmacyName: next.name, updatedAt: nowIso() }
        : c,
    )
    realign()
    return { ...next }
  }

  const created: StaticPharmacy = {
    id: crypto.randomUUID(),
    name: input.name.trim(),
    alertRecipients: input.alertRecipients,
    entraGroupId: input.entraGroupId.trim(),
    isActive: input.isActive,
    orders: 0,
    grossCents: 0,
    newRequests: 0,
    address,
  }
  s.pharmacies.push(created)
  realign()
  return { ...created }
}

export function deactivateStaticPharmacy(id: string): boolean {
  const p = state().pharmacies.find((x) => x.id === id)
  if (!p) return false
  p.isActive = false
  return true
}

export function listStaticComparisons(): MedicinePriceComparison[] {
  return state().comparisons.map((c) => ({
    ...c,
    competitors: c.competitors.map((x) => ({ ...x })),
  }))
}

export function getStaticComparison(
  id: string,
): MedicinePriceComparison | null {
  const c = state().comparisons.find((x) => x.id === id)
  return c
    ? { ...c, competitors: c.competitors.map((x) => ({ ...x })) }
    : null
}

export type ComparisonInput = {
  medicineName: string
  ourPriceCents: number
  partnerPharmacyId: string
  notes?: string | null
  competitors: { pharmacyName: string; priceCents: number }[]
}

function resolvePartner(partnerPharmacyId: string): StaticPharmacy {
  const pharmacy = state().pharmacies.find((p) => p.id === partnerPharmacyId)
  if (!pharmacy) throw new Error('Partner pharmacy not found')
  return pharmacy
}

export function createStaticComparison(
  input: ComparisonInput,
): MedicinePriceComparison {
  const pharmacy = resolvePartner(input.partnerPharmacyId)
  const created: MedicinePriceComparison = {
    id: crypto.randomUUID(),
    medicineName: input.medicineName.trim(),
    ourPriceCents: input.ourPriceCents,
    partnerPharmacyId: pharmacy.id,
    partnerPharmacyName: pharmacy.name,
    notes: input.notes?.trim() || null,
    competitors: input.competitors.map((c) => ({
      pharmacyName: c.pharmacyName.trim(),
      priceCents: c.priceCents,
    })),
    updatedAt: nowIso(),
  }
  state().comparisons.push(created)
  realign()
  return {
    ...created,
    competitors: created.competitors.map((x) => ({ ...x })),
  }
}

export function updateStaticComparison(
  id: string,
  input: ComparisonInput,
): MedicinePriceComparison {
  const s = state()
  const idx = s.comparisons.findIndex((c) => c.id === id)
  if (idx < 0) throw new Error('Comparison not found')
  const pharmacy = resolvePartner(input.partnerPharmacyId)
  const next: MedicinePriceComparison = {
    id,
    medicineName: input.medicineName.trim(),
    ourPriceCents: input.ourPriceCents,
    partnerPharmacyId: pharmacy.id,
    partnerPharmacyName: pharmacy.name,
    notes: input.notes?.trim() || null,
    competitors: input.competitors.map((c) => ({
      pharmacyName: c.pharmacyName.trim(),
      priceCents: c.priceCents,
    })),
    updatedAt: nowIso(),
  }
  s.comparisons[idx] = next
  realign()
  return { ...next, competitors: next.competitors.map((x) => ({ ...x })) }
}

export function deleteStaticComparison(id: string): boolean {
  const s = state()
  const before = s.comparisons.length
  s.comparisons = s.comparisons.filter((c) => c.id !== id)
  if (s.comparisons.length === before) return false
  realign()
  return true
}

export function exportComparisonsCsv(): string {
  return comparisonsToCsv(state().comparisons)
}

export function importComparisonsCsv(raw: string): {
  imported: number
  errors: string[]
} {
  const parsed = parsePriceComparisonCsv(raw)
  if (parsed.errors.length) return { imported: 0, errors: parsed.errors }

  const grouped = groupCsvRowsIntoComparisons(
    parsed.rows,
    state().pharmacies,
    nowIso(),
  )
  if (grouped.errors.length) return { imported: 0, errors: grouped.errors }

  const s = state()
  for (const incoming of grouped.comparisons) {
    const existingIdx = s.comparisons.findIndex(
      (c) =>
        c.medicineName.toLowerCase() === incoming.medicineName.toLowerCase() &&
        c.partnerPharmacyId === incoming.partnerPharmacyId,
    )
    if (existingIdx >= 0) {
      s.comparisons[existingIdx] = {
        ...incoming,
        id: s.comparisons[existingIdx]!.id,
      }
    } else {
      s.comparisons.push(incoming)
    }
  }
  realign()
  return { imported: grouped.comparisons.length, errors: [] }
}

export function getFeaturedStaticComparison(): FeaturedPriceComparison | null {
  return getFeaturedPriceComparison(state().comparisons, 'AUD')
}

export function getStaticClinicBySlug(slug: string): StaticClinic | null {
  const clinic = state().clinics.find(
    (c) => c.slug === slug && c.isActive,
  )
  return clinic ? { ...clinic } : null
}

export function getDefaultStaticClinic(
  candidates: string[] = [DEFAULT_CLINIC_SLUG, 'demo-clinic-a', 'test-clinic-a'],
): StaticClinic | null {
  for (const slug of candidates) {
    const clinic = getStaticClinicBySlug(slug)
    if (clinic) return clinic
  }
  return state().clinics[0] ? { ...state().clinics[0]! } : null
}

export function toPublicClinicDto(clinic: StaticClinic): ClinicDto {
  const pharmacy = getStaticPharmacy(clinic.pharmacyId)
  const address =
    pharmacy && hasUsableAddress(pharmacy.address) ? pharmacy.address : null

  return {
    slug: clinic.slug,
    name: clinic.name,
    logoUrl: clinic.logoUrl,
    brandColour: clinic.brandColour,
    priceCents: clinic.priceCents,
    deliveryFeeCents: clinic.deliveryFeeCents,
    currency: clinic.currency,
    orderingEnabled: clinic.orderingEnabled && clinic.isActive,
    pharmacyName: pharmacy?.name ?? null,
    pharmacyAddress: address
      ? {
          line1: address.line1,
          line2: address.line2 ?? null,
          suburb: address.suburb,
          state: address.state,
          postcode: address.postcode,
        }
      : null,
  }
}

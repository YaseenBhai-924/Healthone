import type { MedicinePriceComparison, StaticPharmacy } from './types'

export const PRICE_COMPARISON_CSV_HEADERS = [
  'MedicineName',
  'OurPriceCents',
  'PartnerPharmacyName',
  'CompetitorPharmacyName',
  'CompetitorPriceCents',
  'Notes',
] as const

export type PriceComparisonCsvRow = {
  medicineName: string
  ourPriceCents: number
  partnerPharmacyName: string
  competitorPharmacyName: string
  competitorPriceCents: number
  notes: string
}

function escapeCsv(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

export function comparisonsToCsv(
  comparisons: MedicinePriceComparison[],
): string {
  const lines = [PRICE_COMPARISON_CSV_HEADERS.join(',')]
  for (const c of comparisons) {
    const competitors =
      c.competitors.length > 0
        ? c.competitors
        : [{ pharmacyName: '', priceCents: 0 }]
    for (const comp of competitors) {
      lines.push(
        [
          escapeCsv(c.medicineName),
          String(c.ourPriceCents),
          escapeCsv(c.partnerPharmacyName),
          escapeCsv(comp.pharmacyName),
          String(comp.priceCents || ''),
          escapeCsv(c.notes ?? ''),
        ].join(','),
      )
    }
  }
  return `${lines.join('\n')}\n`
}

function parseCsvLine(line: string): string[] {
  const cells: string[] = []
  let current = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]!
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          current += '"'
          i++
        } else {
          inQuotes = false
        }
      } else {
        current += ch
      }
    } else if (ch === '"') {
      inQuotes = true
    } else if (ch === ',') {
      cells.push(current)
      current = ''
    } else {
      current += ch
    }
  }
  cells.push(current)
  return cells
}

export function parsePriceComparisonCsv(raw: string): {
  rows: PriceComparisonCsvRow[]
  errors: string[]
} {
  const errors: string[] = []
  const rows: PriceComparisonCsvRow[] = []
  const lines = raw
    .replace(/^\uFEFF/, '')
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)

  if (lines.length === 0) {
    return { rows, errors: ['CSV is empty.'] }
  }

  const header = parseCsvLine(lines[0]!).map((h) => h.trim())
  const expected = [...PRICE_COMPARISON_CSV_HEADERS]
  if (
    header.length < expected.length ||
    expected.some((h, i) => header[i]?.toLowerCase() !== h.toLowerCase())
  ) {
    return {
      rows,
      errors: [
        `CSV header must be: ${PRICE_COMPARISON_CSV_HEADERS.join(',')}`,
      ],
    }
  }

  for (let i = 1; i < lines.length; i++) {
    const cells = parseCsvLine(lines[i]!)
    const medicineName = (cells[0] ?? '').trim()
    const ourRaw = (cells[1] ?? '').trim()
    const partnerPharmacyName = (cells[2] ?? '').trim()
    const competitorPharmacyName = (cells[3] ?? '').trim()
    const competitorRaw = (cells[4] ?? '').trim()
    const notes = (cells[5] ?? '').trim()

    const ourPriceCents = Number.parseInt(ourRaw, 10)
    const competitorPriceCents = Number.parseInt(competitorRaw, 10)

    if (!medicineName) {
      errors.push(`Row ${i + 1}: MedicineName is required.`)
      continue
    }
    if (!Number.isFinite(ourPriceCents) || ourPriceCents < 0) {
      errors.push(`Row ${i + 1}: OurPriceCents must be a non-negative integer.`)
      continue
    }
    if (!partnerPharmacyName) {
      errors.push(`Row ${i + 1}: PartnerPharmacyName is required.`)
      continue
    }
    if (!competitorPharmacyName) {
      errors.push(`Row ${i + 1}: CompetitorPharmacyName is required.`)
      continue
    }
    if (!Number.isFinite(competitorPriceCents) || competitorPriceCents < 0) {
      errors.push(
        `Row ${i + 1}: CompetitorPriceCents must be a non-negative integer.`,
      )
      continue
    }

    rows.push({
      medicineName,
      ourPriceCents,
      partnerPharmacyName,
      competitorPharmacyName,
      competitorPriceCents,
      notes,
    })
  }

  return { rows, errors }
}

/** Group CSV rows into medicine comparisons; validate partner pharmacy by name. */
export function groupCsvRowsIntoComparisons(
  rows: PriceComparisonCsvRow[],
  pharmacies: StaticPharmacy[],
  nowIso: string,
): { comparisons: MedicinePriceComparison[]; errors: string[] } {
  const errors: string[] = []
  const byKey = new Map<
    string,
    {
      medicineName: string
      ourPriceCents: number
      partnerPharmacyId: string
      partnerPharmacyName: string
      notes: string | null
      competitors: { pharmacyName: string; priceCents: number }[]
    }
  >()

  for (const row of rows) {
    const pharmacy = pharmacies.find(
      (p) =>
        p.name.localeCompare(row.partnerPharmacyName, undefined, {
          sensitivity: 'accent',
        }) === 0,
    )
    if (!pharmacy) {
      errors.push(
        `Partner pharmacy not found: "${row.partnerPharmacyName}".`,
      )
      continue
    }

    const key = `${row.medicineName.toLowerCase()}::${pharmacy.id}`
    const existing = byKey.get(key)
    if (!existing) {
      byKey.set(key, {
        medicineName: row.medicineName,
        ourPriceCents: row.ourPriceCents,
        partnerPharmacyId: pharmacy.id,
        partnerPharmacyName: pharmacy.name,
        notes: row.notes || null,
        competitors: [
          {
            pharmacyName: row.competitorPharmacyName,
            priceCents: row.competitorPriceCents,
          },
        ],
      })
    } else {
      if (existing.ourPriceCents !== row.ourPriceCents) {
        errors.push(
          `Conflicting OurPriceCents for ${row.medicineName} / ${pharmacy.name}.`,
        )
        continue
      }
      existing.competitors.push({
        pharmacyName: row.competitorPharmacyName,
        priceCents: row.competitorPriceCents,
      })
      if (row.notes) existing.notes = row.notes
    }
  }

  const comparisons: MedicinePriceComparison[] = [...byKey.values()].map(
    (c) => ({
      id: crypto.randomUUID(),
      medicineName: c.medicineName,
      ourPriceCents: c.ourPriceCents,
      partnerPharmacyId: c.partnerPharmacyId,
      partnerPharmacyName: c.partnerPharmacyName,
      notes: c.notes,
      competitors: c.competitors,
      updatedAt: nowIso,
    }),
  )

  return { comparisons, errors }
}

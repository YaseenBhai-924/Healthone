/** Pure helpers for the pharmacy invoice panel (AUD cents). */

export function dollarsToCents(value: string): number | null {
  const n = Number.parseFloat(value.trim())
  if (!Number.isFinite(n) || n < 0) return null
  return Math.round(n * 100)
}

export function centsToDollarsInput(cents: number): string {
  return (cents / 100).toFixed(2)
}

export function invoiceTotalCents(
  lines: { quantity: string; unitPriceDollars: string }[],
  deliveryDollars: string,
  includeDelivery: boolean,
): number {
  let sum = 0
  for (const line of lines) {
    const qty = Number.parseInt(line.quantity, 10)
    const unit = dollarsToCents(line.unitPriceDollars)
    if (!Number.isFinite(qty) || qty < 1 || unit === null) continue
    sum += qty * unit
  }
  if (includeDelivery) {
    const d = dollarsToCents(deliveryDollars)
    if (d !== null) sum += d
  }
  return sum
}

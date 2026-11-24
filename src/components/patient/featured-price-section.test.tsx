import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { FeaturedPriceSection } from './featured-price-section'

const featured = {
  medicineName: 'Voren 500',
  ourPriceCents: 1000,
  partnerPharmacyName: 'Shaheen Chemist',
  currency: 'AUD',
  maxSavingCents: 9000,
  competitors: [
    { pharmacyName: 'D watson', priceCents: 10000, deltaCents: 9000 },
    { pharmacyName: 'Asim Pharmacy', priceCents: 5000, deltaCents: 4000 },
  ],
}

describe('FeaturedPriceSection', () => {
  it('renders the split marketing + comparison card layout', () => {
    render(<FeaturedPriceSection featured={featured} />)
    expect(
      screen.getByRole('heading', {
        name: /Partner pharmacy prices built for value/i,
      }),
    ).toBeInTheDocument()
    expect(screen.getByText('Voren 500')).toBeInTheDocument()
    expect(screen.getAllByText('Shaheen Chemist').length).toBeGreaterThan(0)
    expect(screen.getByText(/Save up to \$90\.00/)).toBeInTheDocument()
    expect(screen.getAllByText('D watson').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Asim Pharmacy').length).toBeGreaterThan(0)
    expect(
      screen.getByRole('link', { name: /Start online order/i }),
    ).toHaveAttribute('href', '/order')
  })

  it('supports compact card-only mode', () => {
    render(<FeaturedPriceSection featured={featured} compact />)
    expect(
      screen.queryByRole('heading', {
        name: /Partner pharmacy prices built for value/i,
      }),
    ).toBeNull()
    expect(screen.getByTestId('featured-price-card')).toBeInTheDocument()
  })
})

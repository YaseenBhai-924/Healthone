import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { CollectionPharmacyAddress } from './collection-pharmacy-address'

describe('CollectionPharmacyAddress', () => {
  it('renders collect-from copy and formatted address', () => {
    render(
      <CollectionPharmacyAddress
        pharmacyName="Harbour Partner Pharmacy"
        pharmacyAddress={{
          line1: '14 Circular Quay West',
          line2: 'Shop 2',
          suburb: 'Sydney',
          state: 'NSW',
          postcode: '2000',
        }}
      />,
    )
    expect(
      screen.getByText('Collect from Harbour Partner Pharmacy'),
    ).toBeInTheDocument()
    expect(
      screen.getByText('14 Circular Quay West, Shop 2, Sydney NSW 2000'),
    ).toBeInTheDocument()
  })

  it('hides when address or name is missing', () => {
    const { container } = render(
      <CollectionPharmacyAddress
        pharmacyName="Harbour Partner Pharmacy"
        pharmacyAddress={null}
      />,
    )
    expect(container).toBeEmptyDOMElement()
  })
})

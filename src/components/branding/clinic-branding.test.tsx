import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ClinicBrandingProvider, useClinicBranding } from './clinic-branding'
import { defaultBrand } from '@/lib/branding'

function BrandDisplay() {
  const brand = useClinicBranding()
  return <p data-testid="brand-name">{brand.name}</p>
}

describe('ClinicBrandingProvider', () => {
  it('provides brand data to children', () => {
    const brand = {
      ...defaultBrand,
      name: 'Riverside Medical Clinic',
    }
    render(
      <ClinicBrandingProvider brand={brand}>
        <BrandDisplay />
      </ClinicBrandingProvider>,
    )
    expect(screen.getByTestId('brand-name')).toHaveTextContent('Riverside Medical Clinic')
  })

  it('injects CSS custom properties for primary colour', () => {
    const { container } = render(
      <ClinicBrandingProvider brand={defaultBrand}>
        <div />
      </ClinicBrandingProvider>,
    )
    const wrapper = container.firstChild as HTMLElement
    expect(wrapper.style.getPropertyValue('--brand-primary')).toBe('#2563eb')
  })

  it('injects white text colour for dark primary', () => {
    const { container } = render(
      <ClinicBrandingProvider brand={defaultBrand}>
        <div />
      </ClinicBrandingProvider>,
    )
    const wrapper = container.firstChild as HTMLElement
    expect(wrapper.style.getPropertyValue('--brand-primary-text')).toBe('#ffffff')
  })

  it('injects dark text colour for too-light primary', () => {
    const lightBrand = { ...defaultBrand, primaryColor: '#93c5fd' }
    const { container } = render(
      <ClinicBrandingProvider brand={lightBrand}>
        <div />
      </ClinicBrandingProvider>,
    )
    const wrapper = container.firstChild as HTMLElement
    expect(wrapper.style.getPropertyValue('--brand-primary-text')).toBe('#0f2a55')
  })
})

describe('useClinicBranding', () => {
  it('returns defaultBrand when no provider is present', () => {
    render(<BrandDisplay />)
    expect(screen.getByTestId('brand-name')).toHaveTextContent('Script Direct')
  })
})

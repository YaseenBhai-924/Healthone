import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ClinicLogo } from './clinic-logo'
import { ClinicBrandingProvider } from './clinic-branding'
import { defaultBrand } from '@/lib/branding'

describe('ClinicLogo', () => {
  it('renders the brand name as a wordmark when no logoUrl', () => {
    render(
      <ClinicBrandingProvider brand={defaultBrand}>
        <ClinicLogo />
      </ClinicBrandingProvider>,
    )
    expect(screen.getByRole('img', { name: 'Script Direct' })).toBeInTheDocument()
  })

  it('renders an img when logoUrl is provided', () => {
    const brand = { ...defaultBrand, name: 'River Clinic', logoUrl: '/logo.svg' }
    render(
      <ClinicBrandingProvider brand={brand}>
        <ClinicLogo />
      </ClinicBrandingProvider>,
    )
    expect(screen.getByAltText('River Clinic logo')).toBeInTheDocument()
  })

  it('renders the correct clinic name without provider (fallback)', () => {
    render(<ClinicLogo />)
    expect(screen.getByRole('img', { name: 'Script Direct' })).toBeInTheDocument()
  })
})

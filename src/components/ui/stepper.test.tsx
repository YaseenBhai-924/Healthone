import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Stepper } from './stepper'

const steps = [
  { label: 'Details' },
  { label: 'Review' },
  { label: 'Payment' },
  { label: 'Confirm' },
]

describe('Stepper', () => {
  it('renders all step labels', () => {
    render(<Stepper steps={steps} currentStep={0} />)
    // Labels appear both in desktop and mobile views – check at least one
    expect(screen.getAllByText('Details').length).toBeGreaterThan(0)
  })

  it('marks the current step with aria-current="step"', () => {
    render(<Stepper steps={steps} currentStep={1} />)
    const currentEl = screen.getByText('Review', { selector: '[aria-current="step"]' })
    expect(currentEl).toBeInTheDocument()
  })

  it('shows progress as a nav landmark', () => {
    render(<Stepper steps={steps} currentStep={2} />)
    expect(screen.getByRole('navigation', { name: 'Progress' })).toBeInTheDocument()
  })

  it('renders a progressbar for mobile', () => {
    render(<Stepper steps={steps} currentStep={2} />)
    const bar = screen.getByRole('progressbar')
    expect(bar).toHaveAttribute('aria-valuenow', '3')
    expect(bar).toHaveAttribute('aria-valuemax', '4')
  })

  it('shows step n of m text', () => {
    render(<Stepper steps={steps} currentStep={1} />)
    expect(screen.getByText(/Step 2 of 4/)).toBeInTheDocument()
  })
})

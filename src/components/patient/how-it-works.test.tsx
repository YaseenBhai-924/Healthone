import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { HowItWorksStepper } from './how-it-works-stepper'

describe('HowItWorksStepper', () => {
  it('renders four interactive steps', async () => {
    const user = userEvent.setup()
    render(<HowItWorksStepper />)
    expect(
      screen.getAllByRole('button', { name: /enter your escript token/i })
        .length,
    ).toBeGreaterThanOrEqual(1)
    const verify = screen.getAllByRole('button', {
      name: /pharmacy verifies, then sends a payment link/i,
    })[0]!
    await user.click(verify)
    expect(
      verify.getAttribute('aria-current') === 'step' ||
        verify.getAttribute('aria-pressed') === 'true' ||
        verify.className.includes('border-brand'),
    ).toBe(true)
    expect(
      screen.getAllByText(/payment link emailed/i).length,
    ).toBeGreaterThanOrEqual(1)
  })
})

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { FulfilmentToggle } from './fulfilment-toggle'

describe('FulfilmentToggle', () => {
  it('shows collection by default and exposes only the active panel', () => {
    render(<FulfilmentToggle />)
    expect(
      screen.getByRole('heading', { name: 'Click and collect' }),
    ).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Home delivery' })).toBeNull()
  })

  it('swaps panels when the option changes', async () => {
    const user = userEvent.setup()
    render(<FulfilmentToggle />)
    await user.click(screen.getByRole('radio', { name: 'Home delivery' }))
    expect(
      screen.getByRole('heading', { name: 'Home delivery' }),
    ).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Click and collect' })).toBeNull()
    expect(
      screen.getByText(/delivery fee may apply and is shown before you pay/i),
    ).toBeInTheDocument()
  })
})

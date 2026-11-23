import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderToString } from 'react-dom/server'
import { axe } from 'vitest-axe'
import { describe, expect, it } from 'vitest'
import { OrderJourneyPreview } from './order-journey-preview'

describe('OrderJourneyPreview', () => {
  it('exposes the five stages as tabs with full accessible names', () => {
    render(<OrderJourneyPreview />)
    const tabs = screen.getAllByRole('tab')
    expect(tabs).toHaveLength(5)
    expect(screen.getByRole('tab', { name: 'Order submitted' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    expect(
      screen.getByRole('tab', { name: 'Ready for collection' }),
    ).toBeInTheDocument()
  })

  it('selects a stage on click and shows its screen content', async () => {
    const user = userEvent.setup()
    render(<OrderJourneyPreview />)
    const tab = screen.getByRole('tab', { name: 'Payment link sent' })
    await user.click(tab)
    expect(tab).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByText('Pay securely with Stripe')).toBeInTheDocument()
  })

  it('supports arrow-key navigation between tabs', async () => {
    const user = userEvent.setup()
    render(<OrderJourneyPreview />)
    const first = screen.getByRole('tab', { name: 'Order submitted' })
    first.focus()
    await user.keyboard('{ArrowRight}')
    expect(screen.getByRole('tab', { name: 'Pharmacy verifying' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
  })

  it('server-renders no inline style attributes (nonce CSP blocks them)', () => {
    expect(renderToString(<OrderJourneyPreview />)).not.toMatch(/\sstyle="/)
  })

  it('has no axe violations', async () => {
    const { container } = render(<OrderJourneyPreview />)
    expect(await axe(container)).toHaveNoViolations()
  })
})

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'vitest-axe'
import { describe, expect, it, vi } from 'vitest'

vi.mock('next/navigation', () => ({ usePathname: () => '/' }))

import { SiteHeader } from './site-header'

describe('SiteHeader', () => {
  it('renders primary navigation and the order CTA', () => {
    render(<SiteHeader />)
    expect(screen.getByRole('link', { name: /start order/i })).toHaveAttribute(
      'href',
      '/order',
    )
    expect(screen.getAllByRole('link', { name: /track order/i }).length).toBeGreaterThan(0)
  })

  it('opens the mobile sheet, traps focus on Close and closes on Escape', async () => {
    const user = userEvent.setup()
    render(<SiteHeader />)
    const open = screen.getByRole('button', { name: 'Open menu' })
    await user.click(open)
    const dialog = screen.getByRole('dialog', { name: 'Mobile navigation' })
    expect(dialog).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Close menu' })).toHaveFocus()

    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog', { name: 'Mobile navigation' })).toBeNull()
    expect(open).toHaveFocus()
  })

  it('has no axe violations', async () => {
    const { container } = render(<SiteHeader />)
    expect(await axe(container)).toHaveNoViolations()
  })
})

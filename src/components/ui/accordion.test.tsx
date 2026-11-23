import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'vitest-axe'
import { describe, expect, it } from 'vitest'
import { Accordion } from './accordion'

const items = [
  { id: 'a', title: 'First question', content: <p>First answer</p> },
  { id: 'b', title: 'Second question', content: <p>Second answer</p> },
]

describe('Accordion', () => {
  it('opens only the default item and links buttons to regions', () => {
    render(<Accordion items={items} defaultOpenId="a" />)
    const first = screen.getByRole('button', { name: 'First question' })
    const second = screen.getByRole('button', { name: 'Second question' })
    expect(first).toHaveAttribute('aria-expanded', 'true')
    expect(second).toHaveAttribute('aria-expanded', 'false')
    expect(first.getAttribute('aria-controls')).toBeTruthy()
    expect(screen.getByRole('region', { name: 'First question' })).toBeVisible()
  })

  it('is single-open and can be collapsed again', async () => {
    const user = userEvent.setup()
    render(<Accordion items={items} defaultOpenId="a" />)
    const first = screen.getByRole('button', { name: 'First question' })
    const second = screen.getByRole('button', { name: 'Second question' })

    await user.click(second)
    expect(second).toHaveAttribute('aria-expanded', 'true')
    expect(first).toHaveAttribute('aria-expanded', 'false')

    await user.click(second)
    expect(second).toHaveAttribute('aria-expanded', 'false')
  })

  it('hides closed panels from assistive tech', () => {
    render(<Accordion items={items} />)
    expect(screen.queryByRole('region', { name: 'First question' })).toBeNull()
  })

  it('has no axe violations', async () => {
    const { container } = render(<Accordion items={items} defaultOpenId="a" />)
    expect(await axe(container)).toHaveNoViolations()
  })
})

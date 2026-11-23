import { render, screen } from '@testing-library/react'
import { renderToString } from 'react-dom/server'
import { axe } from 'vitest-axe'
import { describe, expect, it } from 'vitest'
import { CtaBand } from './cta-band'
import { FaqSection } from './faq-section'
import { TrustBento } from './trust-bento'
import { trustCards } from '@/lib/patient/copy'

describe('home page sections', () => {
  it('TrustBento renders every trust card as a heading', () => {
    render(<TrustBento />)
    for (const card of trustCards) {
      expect(
        screen.getByRole('heading', { name: card.title }),
      ).toBeInTheDocument()
    }
  })

  it('FaqSection opens the first question and links to contact', () => {
    render(<FaqSection />)
    const buttons = screen.getAllByRole('button')
    expect(buttons[0]).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('link', { name: /contact/i })).toHaveAttribute(
      'href',
      '/contact',
    )
  })

  it('CtaBand points to the order wizard and the lost-link flow', () => {
    render(<CtaBand />)
    expect(
      screen.getByRole('link', { name: /start your request/i }),
    ).toHaveAttribute('href', '/order')
    expect(
      screen.getByRole('link', { name: /track my order/i }),
    ).toHaveAttribute('href', '/status/lost-link')
  })

  it('server-renders no inline style attributes (nonce CSP blocks them)', () => {
    const html = renderToString(
      <main>
        <TrustBento />
        <FaqSection />
        <CtaBand />
      </main>,
    )
    expect(html).not.toMatch(/\sstyle="/)
  })

  it('has no axe violations', async () => {
    const { container } = render(
      <main>
        <TrustBento />
        <FaqSection />
        <CtaBand />
      </main>,
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})

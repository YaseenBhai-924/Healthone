import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'vitest-axe'
import { Alert } from './alert'

describe('Alert', () => {
  it('renders children', () => {
    render(<Alert>Something went wrong</Alert>)
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
  })

  it('maps roles: status for info/success, alert for warning/danger', () => {
    const { rerender } = render(<Alert variant="info">Info</Alert>)
    expect(screen.getByRole('status')).toBeInTheDocument()
    rerender(<Alert variant="success">Ok</Alert>)
    expect(screen.getByRole('status')).toBeInTheDocument()
    rerender(<Alert variant="warning">Warn</Alert>)
    expect(screen.getByRole('alert')).toBeInTheDocument()
    rerender(<Alert variant="danger">Bad</Alert>)
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it('renders all variants without axe violations', async () => {
    for (const variant of ['info', 'success', 'warning', 'danger'] as const) {
      const { container, unmount } = render(
        <Alert variant={variant} title={variant}>
          Body
        </Alert>,
      )
      expect(await axe(container)).toHaveNoViolations()
      unmount()
    }
  })

  it('calls onDismiss when dismiss is clicked', async () => {
    const onDismiss = vi.fn()
    render(
      <Alert onDismiss={onDismiss} title="Note">
        Dismiss me
      </Alert>,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Dismiss' }))
    expect(onDismiss).toHaveBeenCalledOnce()
  })
})

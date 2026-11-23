import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ConfirmDialog } from './confirm-dialog'

describe('ConfirmDialog', () => {
  function setup(overrides = {}) {
    const defaults = {
      open: true,
      onClose: vi.fn(),
      onConfirm: vi.fn(),
      title: 'Reject and refund?',
      description: 'This cannot be undone. The patient will be refunded.',
    }
    return {
      ...defaults,
      ...overrides,
      component: render(<ConfirmDialog {...{ ...defaults, ...overrides }} />),
    }
  }

  it('renders the title', () => {
    setup()
    expect(screen.getByRole('heading', { name: 'Reject and refund?' })).toBeInTheDocument()
  })

  it('renders description', () => {
    setup()
    expect(screen.getByText(/This cannot be undone/)).toBeInTheDocument()
  })

  it('calls onConfirm when confirm button clicked', async () => {
    const { onConfirm } = setup()
    await userEvent.click(screen.getByRole('button', { name: 'Confirm' }))
    expect(onConfirm).toHaveBeenCalledOnce()
  })

  it('calls onClose when cancel button clicked', async () => {
    const { onClose } = setup()
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('renders custom confirm and cancel labels', () => {
    setup({ confirmLabel: 'Reject', cancelLabel: 'Go back' })
    expect(screen.getByRole('button', { name: 'Reject' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Go back' })).toBeInTheDocument()
  })

  it('renders danger variant for confirm button', () => {
    setup({ confirmLabel: 'Delete', confirmVariant: 'danger' })
    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument()
  })

  it('shows loading state when confirmLoading', () => {
    setup({ confirmLoading: true })
    const confirmBtn = screen.getByRole('button', { name: 'Loading…' })
    expect(confirmBtn).toBeDisabled()
  })
})

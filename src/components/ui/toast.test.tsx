import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ToastProvider, useToast } from './toast'

function ToastTrigger({
  label = 'Show toast',
  variant = 'success',
  message = 'Action completed',
}: {
  label?: string
  variant?: 'info' | 'success' | 'warning' | 'danger'
  message?: string
}) {
  const { addToast } = useToast()
  return (
    <button type="button" onClick={() => addToast({ message, variant })}>
      {label}
    </button>
  )
}

function setup(ui: React.ReactNode) {
  return render(<ToastProvider>{ui}</ToastProvider>)
}

describe('useToast', () => {
  it('throws when used outside ToastProvider', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => render(<ToastTrigger />)).toThrow(/ToastProvider/)
    spy.mockRestore()
  })
})

describe('ToastProvider', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('shows a toast in the live region', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    setup(<ToastTrigger />)
    expect(screen.getByRole('list', { name: 'Notifications' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Show toast' }))
    expect(screen.getByText('Action completed')).toBeInTheDocument()
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('auto-dismisses non-danger toasts after 5 seconds', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    setup(<ToastTrigger />)
    await user.click(screen.getByRole('button', { name: 'Show toast' }))
    expect(screen.getByText('Action completed')).toBeInTheDocument()
    act(() => {
      vi.advanceTimersByTime(5000)
    })
    expect(screen.queryByText('Action completed')).toBeNull()
  })

  it('does not auto-dismiss danger toasts', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    setup(<ToastTrigger variant="danger" message="Critical" />)
    await user.click(screen.getByRole('button', { name: 'Show toast' }))
    expect(screen.getByRole('alert')).toHaveTextContent('Critical')
    act(() => {
      vi.advanceTimersByTime(10_000)
    })
    expect(screen.getByText('Critical')).toBeInTheDocument()
  })

  it('pauses auto-dismiss while hovered', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    setup(<ToastTrigger />)
    await user.click(screen.getByRole('button', { name: 'Show toast' }))
    const item = screen.getByRole('status')
    await user.hover(item)
    act(() => {
      vi.advanceTimersByTime(5000)
    })
    expect(screen.getByText('Action completed')).toBeInTheDocument()
    await user.unhover(item)
    act(() => {
      vi.advanceTimersByTime(5000)
    })
    expect(screen.queryByText('Action completed')).toBeNull()
  })

  it('dismisses via the dismiss button', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    setup(<ToastTrigger />)
    await user.click(screen.getByRole('button', { name: 'Show toast' }))
    await user.click(screen.getByRole('button', { name: 'Dismiss notification' }))
    expect(screen.queryByText('Action completed')).toBeNull()
  })
})

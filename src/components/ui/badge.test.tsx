import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import {
  Badge,
  RequestStatusBadge,
  PaymentStatusBadge,
  type RequestStatus,
  type PaymentStatus,
} from './badge'

describe('Badge', () => {
  it('renders children', () => {
    render(<Badge>Active</Badge>)
    expect(screen.getByText('Active')).toBeInTheDocument()
  })

  it('renders all variants without crashing', () => {
    const variants = ['info', 'success', 'warning', 'danger', 'neutral'] as const
    for (const variant of variants) {
      const { unmount } = render(<Badge variant={variant}>{variant}</Badge>)
      expect(screen.getByText(variant)).toBeInTheDocument()
      unmount()
    }
  })
})

describe('RequestStatusBadge', () => {
  const statuses: RequestStatus[] = [
    'Draft',
    'PaymentPending',
    'Submitted',
    'InProgress',
    'ReadyOrDispatched',
    'Completed',
    'Rejected',
  ]

  it.each(statuses)('renders "%s" with a plain label', (status) => {
    render(<RequestStatusBadge status={status} />)
    // Should render some text (the label) in the DOM
    const badge = document.querySelector('span')
    expect(badge).toBeInTheDocument()
    expect(badge?.textContent).toBeTruthy()
  })

  it('shows "Submitted" label for Submitted status', () => {
    render(<RequestStatusBadge status="Submitted" />)
    expect(screen.getByText('Submitted')).toBeInTheDocument()
  })

  it('shows "Rejected" label for Rejected status', () => {
    render(<RequestStatusBadge status="Rejected" />)
    expect(screen.getByText('Rejected')).toBeInTheDocument()
  })
})

describe('PaymentStatusBadge', () => {
  const statuses: PaymentStatus[] = [
    'None',
    'Pending',
    'Paid',
    'Failed',
    'RefundPending',
    'Refunded',
    'RefundFailed',
  ]

  it.each(statuses)('renders "%s" with a plain label', (status) => {
    render(<PaymentStatusBadge status={status} />)
    const badge = document.querySelector('span')
    expect(badge?.textContent).toBeTruthy()
  })

  it('shows "Paid" label for Paid status', () => {
    render(<PaymentStatusBadge status="Paid" />)
    expect(screen.getByText('Paid')).toBeInTheDocument()
  })

  it('shows "Refund failed" label for RefundFailed status', () => {
    render(<PaymentStatusBadge status="RefundFailed" />)
    expect(screen.getByText('Refund failed')).toBeInTheDocument()
  })
})

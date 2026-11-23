import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Checkbox } from './checkbox'

describe('Checkbox', () => {
  it('renders a checkbox', () => {
    render(<Checkbox id="terms" label="I accept the terms" />)
    expect(screen.getByRole('checkbox')).toBeInTheDocument()
  })

  it('renders a label', () => {
    render(<Checkbox id="terms" label="I accept the terms" />)
    expect(screen.getByLabelText('I accept the terms')).toBeInTheDocument()
  })

  it('is unchecked by default', () => {
    render(<Checkbox id="terms" label="Terms" />)
    expect(screen.getByRole('checkbox')).not.toBeChecked()
  })

  it('can be checked by clicking the label', async () => {
    render(<Checkbox id="terms" label="Terms" />)
    await userEvent.click(screen.getByText('Terms'))
    expect(screen.getByRole('checkbox')).toBeChecked()
  })

  it('calls onChange', async () => {
    const onChange = vi.fn()
    render(<Checkbox id="terms" label="Terms" onChange={onChange} />)
    await userEvent.click(screen.getByRole('checkbox'))
    expect(onChange).toHaveBeenCalled()
  })

  it('is disabled when disabled', () => {
    render(<Checkbox id="terms" label="Terms" disabled />)
    expect(screen.getByRole('checkbox')).toBeDisabled()
  })

  it('sets aria-invalid when hasError', () => {
    render(<Checkbox id="terms" label="Terms" hasError />)
    expect(screen.getByRole('checkbox')).toHaveAttribute('aria-invalid', 'true')
  })
})

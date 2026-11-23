import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Input } from './input'

describe('Input', () => {
  it('renders an input element', () => {
    render(<Input aria-label="Name" />)
    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })

  it('accepts user input', async () => {
    render(<Input aria-label="Name" />)
    const input = screen.getByRole('textbox')
    await userEvent.type(input, 'Jane Smith')
    expect(input).toHaveValue('Jane Smith')
  })

  it('shows placeholder', () => {
    render(<Input aria-label="Email" placeholder="jane@example.com" />)
    expect(screen.getByPlaceholderText('jane@example.com')).toBeInTheDocument()
  })

  it('sets aria-invalid when hasError is true', () => {
    render(<Input aria-label="Mobile" hasError />)
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true')
  })

  it('is disabled when disabled prop is set', () => {
    render(<Input aria-label="Disabled" disabled />)
    expect(screen.getByRole('textbox')).toBeDisabled()
  })

  it('calls onChange', async () => {
    const onChange = vi.fn()
    render(<Input aria-label="Name" onChange={onChange} />)
    await userEvent.type(screen.getByRole('textbox'), 'a')
    expect(onChange).toHaveBeenCalled()
  })

  it('accepts a ref', () => {
    let el: HTMLInputElement | null = null
    render(<Input aria-label="Ref" ref={(r) => { el = r }} />)
    expect(el).toBeInstanceOf(HTMLInputElement)
  })
})

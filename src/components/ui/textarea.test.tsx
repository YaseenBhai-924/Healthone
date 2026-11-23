import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Textarea } from './textarea'

describe('Textarea', () => {
  it('renders a textarea', () => {
    render(<Textarea aria-label="Note" />)
    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })

  it('accepts user input', async () => {
    render(<Textarea aria-label="Note" />)
    await userEvent.type(screen.getByRole('textbox'), 'Hello')
    expect(screen.getByRole('textbox')).toHaveValue('Hello')
  })

  it('sets aria-invalid when hasError', () => {
    render(<Textarea aria-label="Note" hasError />)
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true')
  })

  it('is disabled when disabled', () => {
    render(<Textarea aria-label="Note" disabled />)
    expect(screen.getByRole('textbox')).toBeDisabled()
  })
})

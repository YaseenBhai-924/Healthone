import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Select } from './select'

describe('Select', () => {
  it('renders a select with options', () => {
    render(
      <Select aria-label="Fulfilment">
        <option value="delivery">Delivery</option>
        <option value="collection">Collection</option>
      </Select>,
    )
    expect(screen.getByRole('combobox')).toBeInTheDocument()
  })

  it('changes selection', async () => {
    render(
      <Select aria-label="Fulfilment">
        <option value="delivery">Delivery</option>
        <option value="collection">Collection</option>
      </Select>,
    )
    await userEvent.selectOptions(screen.getByRole('combobox'), 'Collection')
    expect(screen.getByRole('combobox')).toHaveValue('collection')
  })

  it('sets aria-invalid when hasError', () => {
    render(
      <Select aria-label="Type" hasError>
        <option>Option</option>
      </Select>,
    )
    expect(screen.getByRole('combobox')).toHaveAttribute('aria-invalid', 'true')
  })

  it('is disabled when disabled', () => {
    render(
      <Select aria-label="Type" disabled>
        <option>Option</option>
      </Select>,
    )
    expect(screen.getByRole('combobox')).toBeDisabled()
  })
})

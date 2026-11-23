import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RadioGroup, RadioItem } from './radio-group'

describe('RadioGroup + RadioItem', () => {
  function setup() {
    return render(
      <RadioGroup legend="Fulfilment type">
        <RadioItem id="delivery" name="fulfilment" value="delivery" label="Delivery" description="+$8.00" />
        <RadioItem id="collection" name="fulfilment" value="collection" label="Collection" />
      </RadioGroup>,
    )
  }

  it('renders all radio options', () => {
    setup()
    const radios = screen.getAllByRole('radio')
    expect(radios).toHaveLength(2)
  })

  it('associates labels with inputs', () => {
    setup()
    expect(screen.getByLabelText('Delivery')).toBeInTheDocument()
    expect(screen.getByLabelText('Collection')).toBeInTheDocument()
  })

  it('renders description text', () => {
    setup()
    expect(screen.getByText('+$8.00')).toBeInTheDocument()
  })

  it('allows selecting an option', async () => {
    setup()
    await userEvent.click(screen.getByLabelText('Delivery'))
    expect(screen.getByLabelText('Delivery')).toBeChecked()
  })

  it('only one radio checked at a time', async () => {
    setup()
    await userEvent.click(screen.getByLabelText('Delivery'))
    await userEvent.click(screen.getByLabelText('Collection'))
    expect(screen.getByLabelText('Delivery')).not.toBeChecked()
    expect(screen.getByLabelText('Collection')).toBeChecked()
  })

  it('calls onChange on selection', async () => {
    const onChange = vi.fn()
    render(
      <RadioGroup legend="Type">
        <RadioItem id="opt1" name="type" value="a" label="A" onChange={onChange} />
      </RadioGroup>,
    )
    await userEvent.click(screen.getByLabelText('A'))
    expect(onChange).toHaveBeenCalled()
  })
})

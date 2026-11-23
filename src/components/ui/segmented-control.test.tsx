import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'vitest-axe'
import { describe, expect, it, vi } from 'vitest'
import { SegmentedControl } from './segmented-control'

const options = [
  { value: 'a', label: 'Alpha' },
  { value: 'b', label: 'Beta' },
] as const

describe('SegmentedControl', () => {
  it('renders a labelled radiogroup with the active option checked', () => {
    render(
      <SegmentedControl label="Choice" options={options} value="b" onChange={() => {}} />,
    )
    expect(screen.getByRole('radiogroup', { name: 'Choice' })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: 'Beta' })).toBeChecked()
    expect(screen.getByRole('radio', { name: 'Alpha' })).not.toBeChecked()
  })

  it('calls onChange with the selected value', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(
      <SegmentedControl label="Choice" options={options} value="a" onChange={onChange} />,
    )
    await user.click(screen.getByText('Beta'))
    expect(onChange).toHaveBeenCalledWith('b')
  })

  it('positions the thumb with classes, never inline styles (CSP)', () => {
    const { container } = render(
      <SegmentedControl label="Choice" options={options} value="b" onChange={() => {}} />,
    )
    const thumb = container.querySelector('[aria-hidden]')!
    expect(thumb.className).toContain('translate-x-[100%]')
    expect(container.querySelector('[style]')).toBeNull()
  })

  it('has no axe violations', async () => {
    const { container } = render(
      <SegmentedControl label="Choice" options={options} value="a" onChange={() => {}} />,
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})

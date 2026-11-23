import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Field, Label, HintText, ErrorText } from './field'

describe('Label', () => {
  it('renders children', () => {
    render(<Label>Full name</Label>)
    expect(screen.getByText('Full name')).toBeInTheDocument()
  })

  it('shows a required marker when required prop is set', () => {
    render(<Label required>Email</Label>)
    // The * is aria-hidden but still in the DOM
    expect(screen.getByText('Email')).toBeInTheDocument()
    expect(screen.getByText('*', { selector: 'span' })).toHaveAttribute(
      'aria-hidden',
      'true',
    )
  })

  it('associates with a control via htmlFor', () => {
    render(
      <>
        <Label htmlFor="name-input">Name</Label>
        <input id="name-input" />
      </>,
    )
    expect(screen.getByLabelText('Name')).toBeInTheDocument()
  })
})

describe('HintText', () => {
  it('renders children', () => {
    render(<HintText id="hint">Australian mobile, e.g. 0412 345 678</HintText>)
    expect(screen.getByText(/Australian mobile/)).toBeInTheDocument()
  })
})

describe('ErrorText', () => {
  it('renders children', () => {
    render(<ErrorText>This field is required</ErrorText>)
    expect(screen.getByText('This field is required')).toBeInTheDocument()
  })

  it('has role="alert"', () => {
    render(<ErrorText>Error!</ErrorText>)
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })
})

describe('Field', () => {
  it('renders a wrapper div', () => {
    const { container } = render(
      <Field data-testid="field">
        <Label htmlFor="x">Label</Label>
        <input id="x" />
      </Field>,
    )
    expect(container.querySelector('[data-testid="field"]')).toBeInTheDocument()
  })
})

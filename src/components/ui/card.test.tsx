import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Card, CardHeader, CardTitle, CardBody, CardFooter } from './card'

describe('Card', () => {
  it('renders children', () => {
    render(<Card>Card content</Card>)
    expect(screen.getByText('Card content')).toBeInTheDocument()
  })

  it('merges custom className', () => {
    const { container } = render(<Card className="my-class">Content</Card>)
    expect(container.firstChild).toHaveClass('my-class')
  })
})

describe('CardTitle', () => {
  it('renders as h3 by default', () => {
    render(<CardTitle>Patient Details</CardTitle>)
    expect(screen.getByRole('heading', { level: 3 })).toBeInTheDocument()
  })

  it('renders as a custom heading level', () => {
    render(<CardTitle as="h2">Patient Details</CardTitle>)
    expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument()
  })
})

describe('Composed Card', () => {
  it('renders a full card composition', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>eScript token</CardTitle>
        </CardHeader>
        <CardBody>Token details here</CardBody>
        <CardFooter>
          <button>Reveal</button>
        </CardFooter>
      </Card>,
    )
    expect(screen.getByRole('heading', { name: 'eScript token' })).toBeInTheDocument()
    expect(screen.getByText('Token details here')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Reveal' })).toBeInTheDocument()
  })
})

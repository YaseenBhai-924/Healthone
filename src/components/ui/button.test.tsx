import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from './button'

describe('Button', () => {
  it('renders children', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument()
  })

  it('calls onClick', async () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Click</Button>)
    await userEvent.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('is disabled when disabled prop is set', () => {
    render(<Button disabled>Disabled</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('is disabled and aria-busy when loading', () => {
    render(<Button loading>Save</Button>)
    const btn = screen.getByRole('button')
    expect(btn).toBeDisabled()
    expect(btn).toHaveAttribute('aria-busy', 'true')
  })

  it('does not call onClick when disabled', async () => {
    const onClick = vi.fn()
    render(<Button disabled onClick={onClick}>No click</Button>)
    await userEvent.click(screen.getByRole('button'))
    expect(onClick).not.toHaveBeenCalled()
  })

  it('renders all variants without crashing', () => {
    const variants = ['primary', 'secondary', 'ghost', 'danger', 'link'] as const
    for (const variant of variants) {
      const { unmount } = render(<Button variant={variant}>{variant}</Button>)
      expect(screen.getByRole('button', { name: variant })).toBeInTheDocument()
      unmount()
    }
  })

  it('renders all sizes without crashing', () => {
    const sizes = ['sm', 'md', 'lg'] as const
    for (const size of sizes) {
      const { unmount } = render(<Button size={size}>{size}</Button>)
      expect(screen.getByRole('button', { name: size })).toBeInTheDocument()
      unmount()
    }
  })

  it('accepts a ref', () => {
    let el: HTMLButtonElement | null = null
    render(<Button ref={(r) => { el = r }}>Ref test</Button>)
    expect(el).toBeInstanceOf(HTMLButtonElement)
  })

  it('merges custom className', () => {
    render(<Button className="my-custom-class">Styled</Button>)
    expect(screen.getByRole('button')).toHaveClass('my-custom-class')
  })
})

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Dialog, DialogBody, DialogFooter } from './dialog'
import { Button } from './button'

function TestDialog({ open = true, onClose = vi.fn() }) {
  return (
    <Dialog open={open} onClose={onClose} title="Confirm action">
      <DialogBody>Are you sure you want to proceed?</DialogBody>
      <DialogFooter>
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button>Confirm</Button>
      </DialogFooter>
    </Dialog>
  )
}

describe('Dialog', () => {
  it('renders the title', () => {
    render(<TestDialog />)
    expect(screen.getByRole('heading', { name: 'Confirm action' })).toBeInTheDocument()
  })

  it('renders body content', () => {
    render(<TestDialog />)
    expect(screen.getByText('Are you sure you want to proceed?')).toBeInTheDocument()
  })

  it('renders a close button', () => {
    render(<TestDialog />)
    expect(screen.getByRole('button', { name: 'Close dialog' })).toBeInTheDocument()
  })

  it('calls onClose when close button clicked', async () => {
    const onClose = vi.fn()
    render(<TestDialog onClose={onClose} />)
    await userEvent.click(screen.getByRole('button', { name: 'Close dialog' }))
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('calls showModal when open becomes true', () => {
    render(<TestDialog open={true} />)
    expect(HTMLDialogElement.prototype.showModal).toHaveBeenCalled()
  })

  it('has aria-labelledby pointing to the title', () => {
    render(<TestDialog />)
    const dialog = document.querySelector('dialog')
    expect(dialog).toHaveAttribute('aria-labelledby', 'dialog-title')
    expect(document.getElementById('dialog-title')).toBeInTheDocument()
  })

  it('has aria-modal="true"', () => {
    render(<TestDialog />)
    expect(document.querySelector('dialog')).toHaveAttribute('aria-modal', 'true')
  })

  it('centers in the viewport', () => {
    render(<TestDialog />)
    const dialog = document.querySelector('dialog')
    expect(dialog?.className).toMatch(/left-1\/2/)
    expect(dialog?.className).toMatch(/top-1\/2/)
    expect(dialog?.className).toMatch(/-translate-x-1\/2/)
    expect(dialog?.className).toMatch(/-translate-y-1\/2/)
  })

  it('can be closed by pressing Escape (via native close event)', () => {
    const onClose = vi.fn()
    render(<TestDialog onClose={onClose} />)
    const dialog = document.querySelector('dialog') as HTMLDialogElement
    // Simulate native close event (Escape key fires close event)
    dialog.dispatchEvent(new Event('close'))
    expect(onClose).toHaveBeenCalled()
  })
})

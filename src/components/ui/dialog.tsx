'use client'

import {
  useEffect,
  useRef,
  useCallback,
  type DialogHTMLAttributes,
  type HTMLAttributes,
} from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/cn'

/* ── Dialog ─────────────────────────────────────────────── */

export interface DialogProps extends DialogHTMLAttributes<HTMLDialogElement> {
  ref?: React.Ref<HTMLDialogElement>
  /** Controlled open state */
  open: boolean
  /** Called when the dialog should close (Escape, backdrop click, close button) */
  onClose: () => void
  /** Dialog title — required for accessibility */
  title: string
  /** Whether clicking the backdrop closes the dialog (default: true) */
  closeOnBackdrop?: boolean
}

export function Dialog({
  className,
  open,
  onClose,
  title,
  closeOnBackdrop = true,
  children,
  ref: externalRef,
  ...props
}: DialogProps) {
  const internalRef = useRef<HTMLDialogElement>(null)
  const dialogRef = (externalRef as React.RefObject<HTMLDialogElement>) ?? internalRef

  // Open/close the native dialog element
  useEffect(() => {
    const el = dialogRef.current
    if (!el) return

    if (open && !el.open) {
      el.showModal()
    } else if (!open && el.open) {
      el.close()
    }
  }, [open, dialogRef])

  // Sync native close event (Escape key) back to React state
  useEffect(() => {
    const el = dialogRef.current
    if (!el) return

    const handleClose = () => onClose()
    el.addEventListener('close', handleClose)
    return () => el.removeEventListener('close', handleClose)
  }, [onClose, dialogRef])

  // Close on backdrop click
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent<HTMLDialogElement>) => {
      if (!closeOnBackdrop) return
      const rect = (e.target as HTMLDialogElement).getBoundingClientRect()
      const clickedBackdrop =
        e.clientX < rect.left ||
        e.clientX > rect.right ||
        e.clientY < rect.top ||
        e.clientY > rect.bottom
      if (clickedBackdrop) onClose()
    },
    [closeOnBackdrop, onClose],
  )

  return (
    <dialog
      ref={dialogRef}
      className={cn(
        // Center in the viewport (Tailwind preflight zeros dialog margin)
        'fixed left-1/2 top-1/2 z-50 m-0 max-h-[min(90dvh,40rem)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto',
        // Reset browser dialog styles
        'w-[calc(100%-2rem)] max-w-md border-0 rounded-card bg-surface p-0',
        // Shadow
        'shadow-[var(--shadow-card)] shadow-xl',
        // Backdrop
        'backdrop:bg-fg/40',
        // Animation
        'open:animate-none',
        className,
      )}
      aria-labelledby="dialog-title"
      aria-modal="true"
      onClick={handleBackdropClick}
      {...props}
    >
      {/* Prevent clicks inside the dialog from reaching the backdrop handler */}
      <div
        className="p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2
            id="dialog-title"
            className="text-lg font-bold text-heading"
          >
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-control p-1.5 text-fg-muted hover:bg-surface-muted focus-ring transition-colors"
            aria-label="Close dialog"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {/* Content */}
        {children}
      </div>
    </dialog>
  )
}

/* ── DialogBody ─────────────────────────────────────────── */

export function DialogBody({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('text-sm text-fg space-y-3', className)} {...props} />
  )
}

/* ── DialogFooter ───────────────────────────────────────── */

export function DialogFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('mt-6 flex items-center justify-end gap-3', className)}
      {...props}
    />
  )
}

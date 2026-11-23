'use client'

import { Dialog, DialogBody, DialogFooter } from './dialog'
import { Button } from './button'

export interface ConfirmDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description?: React.ReactNode
  /** Label for the confirm button (default: "Confirm") */
  confirmLabel?: string
  /** Variant for the confirm button (default: "primary") */
  confirmVariant?: 'primary' | 'danger'
  /** Label for the cancel button (default: "Cancel") */
  cancelLabel?: string
  /** Disable the confirm button (e.g. while loading) */
  confirmLoading?: boolean
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm',
  confirmVariant = 'primary',
  cancelLabel = 'Cancel',
  confirmLoading = false,
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} title={title}>
      {description && (
        <DialogBody>{description}</DialogBody>
      )}
      <DialogFooter>
        <Button variant="secondary" onClick={onClose} disabled={confirmLoading}>
          {cancelLabel}
        </Button>
        <Button
          variant={confirmVariant}
          onClick={onConfirm}
          loading={confirmLoading}
        >
          {confirmLabel}
        </Button>
      </DialogFooter>
    </Dialog>
  )
}

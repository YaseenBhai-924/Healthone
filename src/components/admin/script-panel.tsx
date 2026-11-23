'use client'

import { useState, useTransition } from 'react'
import { Download, FileImage } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/toast'
import { downloadScriptAction } from '@/app/(pharmacy)/admin/requests/actions'

export function ScriptPanel({
  requestId,
  scriptAvailable,
  fileName,
  contentType,
  sizeBytes,
}: {
  requestId: string
  scriptAvailable: boolean
  fileName?: string | null
  contentType?: string | null
  sizeBytes?: number | null
}) {
  const { addToast } = useToast()
  const [pending, startTransition] = useTransition()
  const [busy, setBusy] = useState(false)

  function onDownload() {
    startTransition(async () => {
      setBusy(true)
      try {
        const result = await downloadScriptAction(requestId)
        if (!result.ok) {
          addToast({ variant: 'danger', message: result.message })
          return
        }

        const binary = atob(result.contentBase64)
        const bytes = new Uint8Array(binary.length)
        for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i)
        const blob = new Blob([bytes], {
          type: result.contentType || 'application/octet-stream',
        })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = result.fileName || 'script'
        a.click()
        URL.revokeObjectURL(url)
        addToast({
          variant: 'success',
          message: 'Script downloaded. Written to the audit log.',
        })
      } finally {
        setBusy(false)
      }
    })
  }

  if (!scriptAvailable) {
    return (
      <p className="text-sm text-fg-muted">
        An uploaded script is not available for this order.
      </p>
    )
  }

  const sizeLabel =
    typeof sizeBytes === 'number'
      ? sizeBytes >= 1024 * 1024
        ? `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`
        : `${Math.max(1, Math.round(sizeBytes / 1024))} KB`
      : null

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-control bg-brand-50 text-brand-700">
          <FileImage className="h-4 w-4" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-heading">
            {fileName || 'Uploaded script'}
          </p>
          <p className="text-xs text-fg-muted">
            {[contentType, sizeLabel].filter(Boolean).join(' · ')}
          </p>
        </div>
      </div>
      <Button
        type="button"
        variant="secondary"
        size="sm"
        onClick={onDownload}
        loading={pending || busy}
        className="w-fit"
      >
        <Download className="h-4 w-4" aria-hidden />
        Download script
      </Button>
      <p className="text-xs text-fg-muted">
        Downloads are written to the audit log.
      </p>
    </div>
  )
}

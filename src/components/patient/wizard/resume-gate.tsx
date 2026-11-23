'use client'

import { Button } from '@/components/ui'
import type { WizardStep } from '@/lib/patient/wizard-state'
import { resumeCopy } from '@/lib/patient/wizard-state'

export function ResumeGate({
  step,
  onContinue,
  onStartNew,
}: {
  step: WizardStep
  onContinue: () => void
  onStartNew: () => void
}) {
  const copy = resumeCopy(step)

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand-700">
          Saved draft
        </p>
        <h2 className="font-display mt-1 !text-xl font-bold text-heading sm:!text-2xl">
          {copy.title}
        </h2>
        <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">{copy.body}</p>
      </div>

      <div className="flex flex-col gap-3">
        <Button type="button" className="rounded-badge" onClick={onContinue}>
          {copy.continueLabel}
        </Button>
        <Button
          type="button"
          variant="secondary"
          className="rounded-badge"
          onClick={onStartNew}
        >
          Start a new request
        </Button>
      </div>
    </div>
  )
}

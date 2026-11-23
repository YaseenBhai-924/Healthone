import type { DetailsFormValues } from './schema'

const prefix = 'sd-wizard:'

/** In-progress steps only. Confirmation (2) is never persisted. */
export type WizardStep = 0 | 1

export interface WizardPersisted {
  details: DetailsFormValues
  requestId?: string
  statusToken?: string
  step: WizardStep
  updatedAt: number
}

export function loadWizard(clinicSlug: string): WizardPersisted | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = sessionStorage.getItem(prefix + clinicSlug)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<WizardPersisted> & {
      step?: number
    }
    if (!parsed.details || typeof parsed.step !== 'number') return null
    // Legacy pay-step (2) or confirmation snapshots are not resumable.
    if (parsed.step < 0 || parsed.step > 1) {
      clearWizard(clinicSlug)
      return null
    }
    return {
      details: parsed.details,
      requestId: parsed.requestId,
      statusToken: parsed.statusToken,
      step: parsed.step as WizardStep,
      updatedAt:
        typeof parsed.updatedAt === 'number' ? parsed.updatedAt : Date.now(),
    }
  } catch {
    return null
  }
}

export function saveWizard(
  clinicSlug: string,
  data: Omit<WizardPersisted, 'updatedAt'> & { updatedAt?: number },
): void {
  if (typeof window === 'undefined') return
  if (data.step < 0 || data.step > 1) return
  const payload: WizardPersisted = {
    details: data.details,
    requestId: data.requestId,
    statusToken: data.statusToken,
    step: data.step,
    updatedAt: data.updatedAt ?? Date.now(),
  }
  sessionStorage.setItem(prefix + clinicSlug, JSON.stringify(payload))
}

export function clearWizard(clinicSlug: string): void {
  if (typeof window === 'undefined') return
  sessionStorage.removeItem(prefix + clinicSlug)
}

export function hasResumableWizard(saved: WizardPersisted | null): boolean {
  return Boolean(saved?.details)
}

/** Prefill contact / fulfilment for a follow-up order; clear script fields. */
export function prefillForAnotherOrder(
  previous: DetailsFormValues,
): DetailsFormValues {
  return {
    ...previous,
    prescriptionMethod: 'escript',
    escriptToken: '',
    scriptFileName: '',
    notesToPharmacy: '',
  }
}

export function resumeCopy(step: WizardStep): {
  title: string
  body: string
  continueLabel: string
} {
  if (step === 1) {
    return {
      title: 'Continue your request?',
      body: 'You still have details ready to review. Continue, or start a new request.',
      continueLabel: 'Continue to review',
    }
  }
  return {
    title: 'Continue your request?',
    body: 'You have an unfinished request. Continue with your saved details, or start a new one.',
    continueLabel: 'Continue',
  }
}

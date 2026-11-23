'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ClinicBrandingProvider } from '@/components/branding/clinic-branding'
import { ClinicLogo } from '@/components/branding/clinic-logo'
import { Alert, Card, CardBody, Stepper } from '@/components/ui'
import type { ClinicDto } from '@/lib/api/public-types'
import type { ClinicBrand } from '@/lib/branding'
import { wizardSteps } from '@/lib/patient/copy'
import { formatMoney } from '@/lib/format/money'
import type { DetailsFormValues } from '@/lib/patient/schema'
import {
  clearWizard,
  hasResumableWizard,
  loadWizard,
  prefillForAnotherOrder,
  saveWizard,
  type WizardStep,
} from '@/lib/patient/wizard-state'
import { storeStatusToken } from '@/lib/patient/status-token'
import { ConfirmationStep } from './confirmation-step'
import { DetailsStep } from './details-step'
import { PaymentStep } from './payment-step'
import { ResumeGate } from './resume-gate'
import { ReviewStep } from './review-step'

function toBrand(clinic: ClinicDto): ClinicBrand {
  return {
    name: clinic.name,
    pharmacyName: '',
    primaryColor: clinic.brandColour || '#2563eb',
    logoUrl: clinic.logoUrl ?? undefined,
    slug: clinic.slug,
  }
}

function demoReference() {
  const part = Math.random().toString(36).slice(2, 6).toUpperCase()
  return `SD-UPF1-${part}`
}

/** 0–1 in progress (persisted); 2 = pay; 3 = confirmation (memory only). */
type UiStep = WizardStep | 2 | 3

export function RequestWizard({ clinic }: { clinic: ClinicDto }) {
  const router = useRouter()
  const [step, setStep] = useState<UiStep>(0)
  const [details, setDetails] = useState<DetailsFormValues | null>(null)
  const [statusToken, setStatusToken] = useState<string | null>(null)
  const [reference, setReference] = useState<string | null>(null)
  const [consent, setConsent] = useState<{
    privacyPolicyAccepted: boolean
    termsAccepted: boolean
  } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [hydrated, setHydrated] = useState(false)
  const [needsResumeChoice, setNeedsResumeChoice] = useState(false)
  const [persistEnabled, setPersistEnabled] = useState(true)
  const [scriptFile, setScriptFile] = useState<File | null>(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const forceNew = params.get('new') === '1'

    const saved = loadWizard(clinic.slug)

    if (forceNew) {
      clearWizard(clinic.slug)
      const url = new URL(window.location.href)
      url.searchParams.delete('new')
      window.history.replaceState(null, '', url.pathname + url.search)
      setPersistEnabled(true)
      setStep(0)
      setHydrated(true)
      return
    }

    if (hasResumableWizard(saved) && saved) {
      setDetails(saved.details)
      if (saved.statusToken) {
        setStatusToken(saved.statusToken)
        storeStatusToken(saved.statusToken)
      }
      setStep(saved.step)
      setNeedsResumeChoice(true)
      setPersistEnabled(true)
      setHydrated(true)
      return
    }

    setPersistEnabled(true)
    setStep(0)
    setHydrated(true)
  }, [clinic.slug])

  useEffect(() => {
    if (!hydrated || !persistEnabled || !details) return
    if (step > 1) return
    saveWizard(clinic.slug, {
      details,
      statusToken: statusToken ?? undefined,
      step: step as WizardStep,
    })
  }, [clinic.slug, details, statusToken, step, hydrated, persistEnabled])

  function startFresh(options?: { keepContact?: DetailsFormValues | null }) {
    clearWizard(clinic.slug)
    setStatusToken(null)
    setReference(null)
    setConsent(null)
    setScriptFile(null)
    setError(null)
    setPersistEnabled(true)
    setNeedsResumeChoice(false)
    if (options?.keepContact) {
      setDetails(prefillForAnotherOrder(options.keepContact))
    } else {
      setDetails(null)
    }
    setStep(0)
  }

  function handleContinueToPayment(nextConsent: {
    privacyPolicyAccepted: boolean
    termsAccepted: boolean
  }) {
    if (!details) return
    if (details.prescriptionMethod === 'upload' && !scriptFile) {
      setError('Choose a photo or PDF of your script, then continue again.')
      setStep(0)
      return
    }
    setError(null)
    setConsent(nextConsent)
    setStep(2)
  }

  function handlePaid() {
    const token = `proto_${crypto.randomUUID().replace(/-/g, '')}`
    const ref = demoReference()
    setStatusToken(token)
    setReference(ref)
    storeStatusToken(token)
    clearWizard(clinic.slug)
    setPersistEnabled(false)
    setStep(3)
  }

  function handleOrderAnother() {
    startFresh({ keepContact: details })
  }

  if (!hydrated) {
    return (
      <main className="relative overflow-hidden px-4 py-10 sm:py-14">
        <div className="sd-blob sd-blob-a left-1/2 top-0 -translate-x-1/2 opacity-50" aria-hidden />
        <p className="relative text-center text-sm font-medium text-ink-muted">
          Loading…
        </p>
      </main>
    )
  }

  if (!clinic.orderingEnabled) {
    return (
      <main className="relative overflow-hidden px-4 py-10 sm:py-14">
        <div className="sd-blob sd-blob-a left-1/2 top-0 -translate-x-1/2 opacity-50" aria-hidden />
        <div className="relative mx-auto w-full max-w-xl sm:max-w-2xl">
          <Alert variant="warning" title="Ordering paused">
            This clinic is not accepting new requests right now.
          </Alert>
        </div>
      </main>
    )
  }

  const showStepper = step < 3 && !needsResumeChoice

  return (
    <ClinicBrandingProvider brand={toBrand(clinic)}>
      <main className="relative overflow-hidden px-4 py-8 sm:py-12">
        <div className="sd-blob sd-blob-a -left-16 top-0 opacity-55" aria-hidden />
        <div className="sd-blob sd-blob-b right-0 top-40 opacity-45" aria-hidden />

        <div className="relative mx-auto w-full max-w-xl sm:max-w-2xl">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <ClinicLogo height={32} width={108} />
              <span className="truncate rounded-badge border border-brand-200/80 bg-white/90 px-3 py-1 text-xs font-semibold text-brand-700 shadow-sm">
                {clinic.name}
              </span>
            </div>
            {showStepper ? (
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-brand-600">
                Request
              </p>
            ) : null}
          </div>

          {showStepper ? (
            <div className="mb-5 rounded-card border border-line/80 bg-white/70 px-4 py-3 shadow-sm backdrop-blur-sm">
              <Stepper steps={[...wizardSteps]} currentStep={step} />
            </div>
          ) : null}

          <Card className="reveal-up sd-glass border-white/70 shadow-lg">
            <CardBody className="p-5 sm:p-7">
              {needsResumeChoice && step <= 1 ? (
                <ResumeGate
                  step={step as WizardStep}
                  onContinue={() => setNeedsResumeChoice(false)}
                  onStartNew={() => startFresh()}
                />
              ) : null}

              {!needsResumeChoice && step === 0 && (
                <DetailsStep
                  defaultValues={details ?? undefined}
                  onBack={() => router.push(`/c/${clinic.slug}`)}
                  onContinue={(values, file) => {
                    setDetails(values)
                    setScriptFile(file)
                    setError(null)
                    setPersistEnabled(true)
                    setStep(1)
                  }}
                />
              )}
              {!needsResumeChoice && step === 1 && details && (
                <ReviewStep
                  clinic={clinic}
                  details={details}
                  onBack={() => setStep(0)}
                  onEdit={() => setStep(0)}
                  onSubmit={handleContinueToPayment}
                  submitting={false}
                  error={error}
                />
              )}
              {!needsResumeChoice && step === 2 && details && consent && (
                <PaymentStep
                  clinic={clinic}
                  details={details}
                  onBack={() => setStep(1)}
                  onPaid={handlePaid}
                />
              )}
              {!needsResumeChoice &&
                step === 3 &&
                statusToken &&
                reference &&
                details && (
                  <ConfirmationStep
                    statusToken={statusToken}
                    email={details.email}
                    clinicSlug={clinic.slug}
                    onOrderAnother={handleOrderAnother}
                    upfrontPaid={{
                      reference,
                      amountLabel: formatMoney(
                        clinic.priceCents +
                          (details.fulfilmentType === 'Delivery'
                            ? clinic.deliveryFeeCents
                            : 0),
                        clinic.currency,
                      ),
                    }}
                  />
                )}
            </CardBody>
          </Card>
        </div>
      </main>
    </ClinicBrandingProvider>
  )
}

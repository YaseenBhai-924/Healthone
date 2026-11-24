'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Alert, Button, Checkbox } from '@/components/ui'
import { CollectionPharmacyAddress } from '@/components/patient/collection-pharmacy-address'
import type { ClinicDto } from '@/lib/api/public-types'
import { formatMoney } from '@/lib/format/money'
import { PRIVACY_VERSION, TERMS_VERSION } from '@/lib/patient/policies'
import type { DetailsFormValues } from '@/lib/patient/schema'

/**
 * Matches HTML "Review and pay" step: details summary → total due now →
 * consent → Continue to payment (pay before pharmacy review).
 */
export function ReviewStep({
  clinic,
  details,
  onBack,
  onEdit,
  onSubmit,
  submitting,
  error,
}: {
  clinic: ClinicDto
  details: DetailsFormValues
  onBack: () => void
  onEdit: () => void
  onSubmit: (consent: {
    privacyPolicyAccepted: boolean
    termsAccepted: boolean
  }) => void
  submitting: boolean
  error?: string | null
}) {
  const [privacy, setPrivacy] = useState(false)
  const [terms, setTerms] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)

  const deliveryFee =
    details.fulfilmentType === 'Delivery' ? clinic.deliveryFeeCents : 0
  const total = clinic.priceCents + deliveryFee
  const amount = formatMoney(total, clinic.currency)

  function handleContinue() {
    if (!privacy || !terms) {
      setLocalError('Please accept the privacy policy and terms to continue.')
      return
    }
    setLocalError(null)
    onSubmit({ privacyPolicyAccepted: true, termsAccepted: true })
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-display !text-xl font-bold text-heading sm:!text-2xl">
          Review and pay
        </h2>
        <p className="mt-1 text-sm text-fg-muted">
          Payment is collected now — before pharmacy review.
        </p>
      </div>

      <div className="space-y-2 rounded-card border border-line bg-canvas/70 p-4 text-sm">
        <Row
          label="eScript"
          value={
            details.prescriptionMethod === 'escript'
              ? details.escriptToken || 'eScript'
              : `Uploaded script (${details.scriptFileName || 'file'})`
          }
        />
        <Row label="Name" value={details.patientName} />
        <Row label="Fulfilment" value={details.fulfilmentType} />
        {details.fulfilmentType === 'Delivery' && details.address && (
          <Row
            label="Address"
            value={`${details.address.line1}, ${details.address.suburb} ${details.address.state} ${details.address.postcode}`}
          />
        )}
        {details.fulfilmentType === 'Collection' ? (
          <CollectionPharmacyAddress
            className="mt-1"
            pharmacyName={clinic.pharmacyName || clinic.name}
            pharmacyAddress={clinic.pharmacyAddress}
          />
        ) : null}
        <button
          type="button"
          className="rounded-sm text-sm font-semibold text-brand-700 hover:underline focus-ring"
          onClick={onEdit}
        >
          Edit details
        </button>

        <hr className="border-subtle" />

        <div className="rounded-card border border-brand-100 bg-gradient-to-br from-brand-50/80 to-sky-50/60 p-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-semibold text-heading">Service fee</p>
              <p className="mt-0.5 text-xs text-fg-muted">
                Partner pharmacy fulfilment · {clinic.currency}
              </p>
            </div>
            <p className="text-lg font-bold text-brand-700">
              {formatMoney(clinic.priceCents, clinic.currency)}
            </p>
          </div>
          {deliveryFee > 0 ? (
            <div className="mt-2 flex justify-between text-sm">
              <span className="text-fg-muted">Delivery</span>
              <span className="font-semibold text-fg">
                {formatMoney(deliveryFee, clinic.currency)}
              </span>
            </div>
          ) : null}
        </div>

        <div className="flex items-center justify-between gap-4 pt-1">
          <b className="text-fg">Total due now</b>
          <b className="font-display text-2xl text-brand-700">{amount}</b>
        </div>
      </div>

      <div className="space-y-3 rounded-card border border-subtle bg-surface p-4">
        <Checkbox
          id="privacy"
          checked={privacy}
          onChange={(e) => setPrivacy(e.target.checked)}
          label={
            <>
              I have read and accept the{' '}
              <Link
                href="/privacy"
                target="_blank"
                className="font-semibold text-brand-700 underline"
              >
                privacy notice
              </Link>{' '}
              (v{PRIVACY_VERSION}).
            </>
          }
        />
        <Checkbox
          id="terms"
          checked={terms}
          onChange={(e) => setTerms(e.target.checked)}
          label={
            <>
              I accept the{' '}
              <Link
                href="/terms"
                target="_blank"
                className="font-semibold text-brand-700 underline"
              >
                terms of use
              </Link>{' '}
              (v{TERMS_VERSION}) and consent to my details being shared with the
              pharmacy to fulfil this request.
            </>
          }
        />
      </div>

      {(localError || error) && (
        <Alert variant="danger" title="Cannot continue">
          {localError ?? error}
        </Alert>
      )}

      <div className="flex justify-between gap-3 pt-2">
        <Button
          type="button"
          variant="secondary"
          onClick={onBack}
          disabled={submitting}
        >
          Back
        </Button>
        <Button
          type="button"
          onClick={handleContinue}
          loading={submitting}
          loadingLabel="Continuing…"
        >
          Continue to payment
        </Button>
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-fg-muted">{label}</span>
      <span className="text-right font-semibold text-fg">{value}</span>
    </div>
  )
}

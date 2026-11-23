'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Field, Label, HintText, ErrorText } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioItem } from '@/components/ui/radio-group'
import { Stepper } from '@/components/ui/stepper'
import { Alert } from '@/components/ui/alert'
import {
  Badge,
  RequestStatusBadge,
  PaymentStatusBadge,
  type RequestStatus,
  type PaymentStatus,
} from '@/components/ui/badge'
import { Dialog, DialogBody, DialogFooter } from '@/components/ui/dialog'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { useToast } from '@/components/ui/toast'
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/card'
import {
  ClinicBrandingProvider,
} from '@/components/branding/clinic-branding'
import { ClinicLogo } from '@/components/branding/clinic-logo'
import { contrastRatio } from '@/lib/contrast'
import { sampleBrands, defaultBrand, tooLightBrand, type ClinicBrand } from '@/lib/branding'

/* ── Helpers ─────────────────────────────────────────────── */

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="mb-10">
      <h2 className="text-lg font-bold text-heading mb-4 border-b border-subtle pb-2">
        {title}
      </h2>
      {children}
    </section>
  )
}

function Row({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap gap-3 items-center mb-3">{children}</div>
  )
}

function TokenRow({
  name,
  value,
  against = '#ffffff',
}: {
  name: string
  value: string
  against?: string
}) {
  const ratio = contrastRatio(value, against)
  const isBorder = name.startsWith('border-')
  const threshold = isBorder ? 3 : 4.5
  const passes = ratio >= threshold

  return (
    <tr className="border-b border-subtle">
      <td className="py-2 pr-4 font-mono text-xs text-fg-muted">{name}</td>
      <td className="py-2 pr-4">
        <span
          className="inline-block w-6 h-6 rounded border border-subtle"
          style={{ background: value }}
          aria-hidden="true"
        />
      </td>
      <td className="py-2 pr-4 font-mono text-xs">{value}</td>
      <td className="py-2 text-xs">
        <span
          className={passes ? 'text-success-fg font-semibold' : 'text-danger-fg font-semibold'}
        >
          {ratio.toFixed(2)}:1 {passes ? `✓ ≥${threshold}` : `✗ <${threshold}`}
        </span>
      </td>
    </tr>
  )
}

/* ── Main Gallery ───────────────────────────────────────── */

export function GalleryContent() {
  const { addToast } = useToast()
  const [density, setDensity] = useState<'comfortable' | 'compact'>('comfortable')
  const [selectedBrand, setSelectedBrand] = useState<ClinicBrand>(defaultBrand)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [stepperStep, setStepperStep] = useState(1)

  const stepperSteps = [
    { label: 'Details' },
    { label: 'Review' },
    { label: 'Payment' },
    { label: 'Confirmation' },
  ]

  const requestStatuses: RequestStatus[] = [
    'Draft',
    'PaymentPending',
    'Submitted',
    'InProgress',
    'ReadyOrDispatched',
    'Completed',
    'Rejected',
  ]

  const paymentStatuses: PaymentStatus[] = [
    'None',
    'Pending',
    'Paid',
    'Failed',
    'RefundPending',
    'Refunded',
    'RefundFailed',
  ]

  // Design tokens for contrast audit (paired backgrounds from the token spec)
  const colorTokens = [
    { name: 'fg on surface', value: '#0f172a', against: '#ffffff' },
    { name: 'fg-muted on page', value: '#475569', against: '#f8fafc' },
    { name: 'fg-muted on surface', value: '#475569', against: '#ffffff' },
    { name: 'white on brand-600', value: '#ffffff', against: '#2563eb' },
    { name: 'white on brand-700', value: '#ffffff', against: '#1d4ed8' },
    { name: 'white on brand-800', value: '#ffffff', against: '#1e40af' },
    { name: 'success-fg on success-bg', value: '#15803d', against: '#f0fdf4' },
    { name: 'warning-fg on warning-bg', value: '#92400e', against: '#fffbeb' },
    { name: 'danger-fg on danger-bg', value: '#b91c1c', against: '#fef2f2' },
    { name: 'info-fg on brand-50', value: '#2563eb', against: '#eff6ff' },
    { name: 'border-control on surface', value: '#64748b', against: '#ffffff' },
    { name: 'border-control on page', value: '#64748b', against: '#f8fafc' },
  ]

  return (
    <div data-density={density}>
      <header className="sticky top-0 z-10 bg-surface border-b border-subtle px-4 py-3 flex flex-wrap gap-3 items-center justify-between">
        <h1 className="text-base font-bold text-heading">Component Gallery</h1>

        <div className="flex flex-wrap gap-3 items-center">
          {/* Density switcher */}
          <fieldset className="flex gap-2">
            <legend className="sr-only">Density</legend>
            {(['comfortable', 'compact'] as const).map((d) => (
              <label key={d} className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="density"
                  value={d}
                  checked={density === d}
                  onChange={() => setDensity(d)}
                  className="accent-brand-600"
                />
                <span className="text-sm capitalize">{d}</span>
              </label>
            ))}
          </fieldset>

          {/* Brand switcher */}
          <select
            aria-label="Clinic brand"
            className="text-sm border border-control rounded-control px-2 h-8 bg-surface text-fg"
            value={selectedBrand.slug}
            onChange={(e) =>
              setSelectedBrand(
                sampleBrands.find((b) => b.slug === e.target.value) ?? defaultBrand,
              )
            }
          >
            {sampleBrands.map((b) => (
              <option key={b.slug} value={b.slug}>
                {b.name}
              </option>
            ))}
          </select>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 min-w-0">
        {/* ── Branding ── */}
        <Section title="Clinic Branding">
          <ClinicBrandingProvider brand={selectedBrand}>
            <Card className="mb-4">
              <CardHeader>
                <CardTitle>Logo and brand</CardTitle>
              </CardHeader>
              <CardBody>
                <ClinicLogo />
                <p className="mt-2 text-xs text-fg-muted">
                  Primary: <code>{selectedBrand.primaryColor}</code>
                  {' · '}
                  White contrast: {contrastRatio('#ffffff', selectedBrand.primaryColor).toFixed(2)}:1
                  {contrastRatio('#ffffff', selectedBrand.primaryColor) < 4.5 && (
                    <span className="ml-1 text-danger-fg font-semibold">
                      ⚠ Too light — using dark text
                    </span>
                  )}
                </p>
              </CardBody>
            </Card>
          </ClinicBrandingProvider>

          {/* Too-light brand warning demo */}
          {selectedBrand === tooLightBrand && (
            <Alert variant="warning" title="Accessibility note">
              This brand colour ({tooLightBrand.primaryColor}) has insufficient
              contrast for white text. The design system automatically switches
              to dark text ({contrastRatio('#ffffff', tooLightBrand.primaryColor).toFixed(2)}:1 — below 4.5:1 threshold).
            </Alert>
          )}
        </Section>

        {/* ── Buttons ── */}
        <Section title="Button">
          <h3 className="text-sm font-semibold text-fg-secondary mb-2">Variants</h3>
          <Row>
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="danger">Danger</Button>
            <Button variant="link">Link</Button>
          </Row>
          <h3 className="text-sm font-semibold text-fg-secondary mb-2">Sizes</h3>
          <Row>
            <Button size="sm">Small</Button>
            <Button size="md">Medium</Button>
            <Button size="lg">Large</Button>
          </Row>
          <h3 className="text-sm font-semibold text-fg-secondary mb-2">States</h3>
          <Row>
            <Button disabled>Disabled</Button>
            <Button loading>Loading</Button>
          </Row>
        </Section>

        {/* ── Form controls ── */}
        <Section title="Form Controls">
          <div className="space-y-4 max-w-sm">
            <Field>
              <Label htmlFor="g-name" required>Full name</Label>
              <HintText>As it appears on your Medicare card</HintText>
              <Input id="g-name" placeholder="Jane Smith" />
            </Field>

            <Field>
              <Label htmlFor="g-name-err">Name (error state)</Label>
              <Input id="g-name-err" hasError aria-describedby="g-name-err-msg" />
              <ErrorText id="g-name-err-msg">Please enter your full name</ErrorText>
            </Field>

            <Field>
              <Label htmlFor="g-mobile">Mobile</Label>
              <Input id="g-mobile" type="tel" placeholder="0412 345 678" />
            </Field>

            <Field>
              <Label htmlFor="g-disabled">Disabled input</Label>
              <Input id="g-disabled" value="Cannot edit" disabled readOnly />
            </Field>

            <Field>
              <Label htmlFor="g-textarea">Rejection note</Label>
              <HintText>200 characters max. Do not include medication details.</HintText>
              <Textarea id="g-textarea" placeholder="Optional note shown to the patient" />
            </Field>

            <Field>
              <Label htmlFor="g-select">Reason</Label>
              <Select id="g-select">
                <option value="">Select a reason…</option>
                <option value="invalid">Invalid or expired script</option>
                <option value="supply">Unable to supply</option>
                <option value="contact">Cannot contact patient</option>
                <option value="duplicate">Duplicate request</option>
                <option value="other">Other</option>
              </Select>
            </Field>

            <Checkbox id="g-terms" label="I accept the terms and privacy notice" />
            <Checkbox
              id="g-consent"
              label="I consent to my details being shared with the pharmacy"
              hasError
            />

            <RadioGroup legend="Fulfilment type">
              <RadioItem
                id="g-delivery"
                name="g-fulfilment"
                value="delivery"
                label="Delivery"
                description="+$8.00"
              />
              <RadioItem
                id="g-collection"
                name="g-fulfilment"
                value="collection"
                label="Collection"
                description="Pick up from the pharmacy"
              />
            </RadioGroup>
          </div>
        </Section>

        {/* ── Stepper ── */}
        <Section title="Stepper">
          <Stepper steps={stepperSteps} currentStep={stepperStep} className="mb-4" />
          <Row>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setStepperStep((s) => Math.max(0, s - 1))}
              disabled={stepperStep === 0}
            >
              Back
            </Button>
            <Button
              size="sm"
              onClick={() => setStepperStep((s) => Math.min(stepperSteps.length - 1, s + 1))}
              disabled={stepperStep === stepperSteps.length - 1}
            >
              Next
            </Button>
          </Row>
        </Section>

        {/* ── Alert ── */}
        <Section title="Alert">
          <div className="space-y-3">
            <Alert variant="info" title="Your request is being processed">
              You&apos;ll receive an email once the pharmacy has reviewed it.
            </Alert>
            <Alert variant="success" title="Payment confirmed">
              Your request was submitted. Reference: SD-7K4M-2QXP.
            </Alert>
            <Alert variant="warning" title="Payment pending">
              Awaiting payment confirmation from Stripe.
            </Alert>
            <Alert variant="danger" title="Payment failed">
              Your card was declined. Please try again or use a different card.
            </Alert>
            <Alert
              variant="warning"
              title="Dismissible alert"
              onDismiss={() => addToast({ message: 'Alert dismissed', variant: 'info' })}
            >
              Click the × to dismiss this alert.
            </Alert>
          </div>
        </Section>

        {/* ── Badge ── */}
        <Section title="Badge">
          <h3 className="text-sm font-semibold text-fg-secondary mb-2">Base variants</h3>
          <Row>
            <Badge variant="info">Info</Badge>
            <Badge variant="success">Success</Badge>
            <Badge variant="warning">Warning</Badge>
            <Badge variant="danger">Danger</Badge>
            <Badge variant="neutral">Neutral</Badge>
          </Row>

          <h3 className="text-sm font-semibold text-fg-secondary mb-2 mt-4">
            Request status badges
          </h3>
          <Row>
            {requestStatuses.map((s) => (
              <RequestStatusBadge key={s} status={s} />
            ))}
          </Row>

          <h3 className="text-sm font-semibold text-fg-secondary mb-2 mt-4">
            Payment status badges
          </h3>
          <Row>
            {paymentStatuses.map((s) => (
              <PaymentStatusBadge key={s} status={s} />
            ))}
          </Row>
        </Section>

        {/* ── Card ── */}
        <Section title="Card">
          <Card className="max-w-sm">
            <CardHeader>
              <CardTitle>eScript token</CardTitle>
            </CardHeader>
            <CardBody>
              <p className="font-mono text-xl tracking-widest text-fg">XXXXXXXXXXXX</p>
              <p className="mt-2 text-xs text-fg-muted">
                Reveal and copy are written to the audit log. Auto-hides after 60&nbsp;seconds.
              </p>
            </CardBody>
          </Card>
        </Section>

        {/* ── Dialog ── */}
        <Section title="Dialog">
          <Row>
            <Button onClick={() => setDialogOpen(true)}>Open Dialog</Button>
            <Button variant="danger" onClick={() => setConfirmOpen(true)}>
              Open Confirm Dialog
            </Button>
          </Row>

          <Dialog
            open={dialogOpen}
            onClose={() => setDialogOpen(false)}
            title="Reject and refund request"
          >
            <DialogBody>
              <p>
                The patient will be refunded <strong>$45.00</strong> to their
                original payment method and notified by email. This cannot be
                undone.
              </p>
              <Field className="mt-4">
                <Label htmlFor="d-reason">Reason</Label>
                <Select id="d-reason">
                  <option>Invalid or expired script</option>
                  <option>Unable to supply</option>
                  <option>Other</option>
                </Select>
              </Field>
              <Field className="mt-3">
                <Label htmlFor="d-note">Note (optional)</Label>
                <Textarea id="d-note" placeholder="Keep it short. Do not include medication details." />
              </Field>
            </DialogBody>
            <DialogFooter>
              <Button variant="secondary" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={() => {
                  setDialogOpen(false)
                  addToast({ message: 'Request rejected. Refund started.', variant: 'success' })
                }}
              >
                Reject and refund
              </Button>
            </DialogFooter>
          </Dialog>

          <ConfirmDialog
            open={confirmOpen}
            onClose={() => setConfirmOpen(false)}
            onConfirm={() => {
              setConfirmOpen(false)
              addToast({ message: 'Confirmed!', variant: 'success' })
            }}
            title="Are you sure?"
            description="This action cannot be undone."
            confirmLabel="Yes, proceed"
            cancelLabel="Go back"
          />
        </Section>

        {/* ── Toast ── */}
        <Section title="Toast">
          <Row>
            {(['info', 'success', 'warning', 'danger'] as const).map((v) => (
              <Button
                key={v}
                variant="secondary"
                size="sm"
                onClick={() =>
                  addToast({
                    message: `${v.charAt(0).toUpperCase() + v.slice(1)} notification`,
                    variant: v,
                  })
                }
              >
                {v}
              </Button>
            ))}
          </Row>
        </Section>

        {/* ── Design Tokens ── */}
        <Section title="Design Tokens — Contrast Audit">
          <p className="text-sm text-fg-muted mb-3">
            Contrast ratios of text colours against their typical background. AA
            requires ≥ 4.5 : 1 for normal text.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-subtle">
                  <th className="text-left py-2 pr-4 text-xs text-fg-muted uppercase">Token</th>
                  <th className="text-left py-2 pr-4 text-xs text-fg-muted uppercase">Swatch</th>
                  <th className="text-left py-2 pr-4 text-xs text-fg-muted uppercase">Value</th>
                  <th className="text-left py-2 text-xs text-fg-muted uppercase">Contrast</th>
                </tr>
              </thead>
              <tbody>
                {colorTokens.map((t) => (
                  <TokenRow
                    key={t.name}
                    name={t.name}
                    value={t.value}
                    against={t.against}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </Section>
      </main>
    </div>
  )
}

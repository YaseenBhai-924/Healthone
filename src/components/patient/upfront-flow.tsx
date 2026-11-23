'use client'

/**
 * Exact flow from upfront-payment-flow.html, styled with Script Direct theme.
 */
import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Building2,
  CheckCircle2,
  CigaretteOff,
  ClipboardList,
  Lock,
  LogOut,
  MapPin,
  ShieldCheck,
} from 'lucide-react'
import { Button, Card, CardBody, Input, Label, Field } from '@/components/ui'
import { BrandMark } from '@/components/site/brand-mark'
import { SiteHeader } from '@/components/site/site-header'
import { UpfrontStripePay } from '@/components/patient/upfront-stripe-pay'
import { cn } from '@/lib/cn'
import { patientFontClass } from '@/lib/patient/fonts'
import {
  parseStripePaymentReturn,
  stripStripeReturnParams,
} from '@/lib/patient/stripe-return'

const PRODUCT = {
  name: 'Smoke Rehabilitation Starter Kit',
  blurb:
    '8-week nicotine replacement starter pack for smoke cessation support (demo product).',
  price: 89,
  sku: 'SRK-DEMO-01',
} as const

const REF = 'SD-SRK1-9Q2M'

type Fulfilment = 'Collection' | 'Delivery'
type PatientStep = 0 | 1 | 2 | 3 | 4 | 5
type Shell = 'patient' | 'login' | 'app'
type RequestStatus = 'New' | 'In progress' | 'Ready' | 'Completed' | 'Rejected'
type PaymentStatus = 'Paid' | 'Refunded' | 'Refund failed' | 'Refund pending'
type Filter =
  | 'All'
  | 'New'
  | 'In progress'
  | 'Ready or dispatched'
  | 'Completed'
  | 'Rejected'

type PharmacyRequest = {
  id: number
  ref: string
  t: string
  n: string
  f: Fulfilment
  p: PaymentStatus
  s: RequestStatus
  amt: number
  log: string[]
  tok: boolean
  product: string
  escript: string
  hideTimer?: ReturnType<typeof setTimeout>
}

type PatientState = {
  ful: Fulfilment
  tk: string
  nm: string
  mb: string
  em: string
  ad: string
}

const FILTERS: Filter[] = [
  'All',
  'New',
  'In progress',
  'Ready or dispatched',
  'Completed',
  'Rejected',
]

function money(n: number) {
  return `$${n.toFixed(2)}`
}

function now() {
  return new Date().toTimeString().slice(0, 5)
}

function statusTone(s: string) {
  if (s === 'New' || s === 'Paid') return 'bg-brand-100 text-brand-700'
  if (s === 'In progress' || s === 'Refund pending')
    return 'bg-warning-bg text-warning'
  if (s === 'Ready' || s === 'Ready for collection' || s === 'Dispatched')
    return 'bg-success-bg text-success'
  if (s === 'Rejected' || s === 'Refund failed') return 'bg-danger-bg text-danger'
  return 'bg-canvas text-ink-muted'
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 py-1 text-sm">
      <span className="text-ink-muted">{label}</span>
      <span className="text-right font-semibold text-ink">{value}</span>
    </div>
  )
}

function ProductCard() {
  return (
    <div className="flex gap-3 rounded-card border border-line bg-brand-50/50 p-3.5">
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-card bg-brand-600 text-white shadow-sm">
        <CigaretteOff className="h-7 w-7" aria-hidden />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <p className="font-semibold text-heading">{PRODUCT.name}</p>
          <p className="shrink-0 font-display text-lg font-bold text-brand-700">
            {money(PRODUCT.price)}
          </p>
        </div>
        <p className="mt-1 text-xs leading-relaxed text-ink-muted">
          {PRODUCT.blurb}
        </p>
        <p className="mt-1.5 text-[11px] font-medium text-ink-muted">
          SKU {PRODUCT.sku} · AUD
        </p>
      </div>
    </div>
  )
}

function NavRow({
  onBack,
  onNext,
  nextLabel,
  nextDisabled,
}: {
  onBack: () => void
  onNext: () => void
  nextLabel: string
  nextDisabled?: boolean
}) {
  return (
    <div className="flex justify-between gap-3 pt-2">
      <Button type="button" variant="secondary" onClick={onBack}>
        Back
      </Button>
      <Button type="button" onClick={onNext} disabled={nextDisabled}>
        {nextLabel}
      </Button>
    </div>
  )
}

export function UpfrontFlow({
  clinicName = 'Riverside Medical Clinic',
}: {
  clinicName?: string
}) {
  const [shell, setShell] = useState<Shell>('patient')
  const [step, setStep] = useState<PatientStep>(0)
  const [S, setS] = useState<PatientState>({
    ful: 'Collection',
    tk: '',
    nm: '',
    mb: '',
    em: '',
    ad: '',
  })
  const [consent, setConsent] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [loginStep, setLoginStep] = useState(0)
  const [requests, setRequests] = useState<PharmacyRequest[]>([])
  const [filter, setFilter] = useState<Filter>('All')
  const [cur, setCur] = useState<number | null>(null)
  const [rejectOpen, setRejectOpen] = useState(false)
  const [rejectId, setRejectId] = useState<number | null>(null)
  const [rejectReason, setRejectReason] = useState('Invalid or expired script')

  const showToast = useCallback((message: string) => setToast(message), [])

  useEffect(() => {
    if (!toast) return
    const t = window.setTimeout(() => setToast(null), 2400)
    return () => window.clearTimeout(t)
  }, [toast])

  const go = useCallback((n: PatientStep) => {
    setShell('patient')
    setStep(n)
    window.scrollTo(0, 0)
  }, [])

  const fillSample = () => {
    setS({
      ful: 'Collection',
      tk: '4K7M9PX2LQ8D',
      nm: 'Jane Smith',
      mb: '0412 345 678',
      em: 'jane@example.com',
      ad: '12 Example St, Sydney NSW',
    })
    go(1)
  }

  const seedPharmacyOrder = useCallback(() => {
    const patientName =
      (S.nm || 'J. Smith')
        .replace(/^(\S)\S*\s+(\S).*$/, '$1. $2')
        .replace(/^(\S+)$/, '$1') || 'J. Smith'

    setRequests([
      {
        id: 0,
        ref: REF,
        t: `Now ${now()}`,
        n: patientName,
        f: S.ful,
        p: 'Paid',
        s: 'New',
        amt: PRODUCT.price,
        log: [
          `Submitted unpaid skipped — paid upfront ${now()}`,
          `Payment confirmed ${now()}`,
        ],
        tok: false,
        product: PRODUCT.name,
        escript: S.tk || '4K7M9PX2LQ8D',
      },
      {
        id: 1,
        ref: 'SD-3FH9-VT8R',
        t: 'Earlier today',
        n: 'A. Lee',
        f: 'Collection',
        p: 'Paid',
        s: 'In progress',
        amt: 37,
        log: ['Submitted earlier'],
        tok: false,
        product: 'Standard repeat',
        escript: 'XXXXXXXXXXXX',
      },
      {
        id: 2,
        ref: 'SD-9WC2-LN5D',
        t: 'Yesterday',
        n: 'M. Khan',
        f: 'Delivery',
        p: 'Paid',
        s: 'Ready',
        amt: 45,
        log: ['Submitted yesterday'],
        tok: false,
        product: 'Standard repeat',
        escript: 'XXXXXXXXXXXX',
      },
    ])
  }, [S.ful, S.nm, S.tk])

  const completePaid = useCallback(() => {
    seedPharmacyOrder()
    go(5)
  }, [go, seedPharmacyOrder])

  // Resume thank-you after Stripe 3DS redirect (test mode).
  useEffect(() => {
    if (typeof window === 'undefined') return
    const result = parseStripePaymentReturn(window.location.search)
    if (!result.isReturn) return
    if (result.isPaid) {
      seedPharmacyOrder()
      setShell('patient')
      setStep(5)
    }
    const cleaned = stripStripeReturnParams(new URL(window.location.href))
    window.history.replaceState({}, '', cleaned)
  }, [seedPharmacyOrder])

  const displayStatus = (r: PharmacyRequest) =>
    r.s === 'Ready'
      ? r.f === 'Delivery'
        ? 'Dispatched'
        : 'Ready for collection'
      : r.s

  const filtered = useMemo(
    () =>
      requests.filter(
        (r) =>
          filter === 'All' ||
          filter === r.s ||
          (filter === 'Ready or dispatched' && r.s === 'Ready'),
      ),
    [filter, requests],
  )

  const updateRequest = (id: number, patch: Partial<PharmacyRequest>) => {
    setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)))
  }

  const setStatus = (id: number, s: RequestStatus, msg: string) => {
    setRequests((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, s, log: [`${msg} ${now()}`, ...r.log] } : r,
      ),
    )
    setCur(id)
  }

  const revealToken = (id: number) => {
    setRequests((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r
        if (r.hideTimer) clearTimeout(r.hideTimer)
        const nextTok = !r.tok
        const hideTimer = nextTok
          ? setTimeout(() => {
              setRequests((inner) =>
                inner.map((x) =>
                  x.id === id ? { ...x, tok: false, hideTimer: undefined } : x,
                ),
              )
            }, 60_000)
          : undefined
        return {
          ...r,
          tok: nextTok,
          hideTimer,
          log: nextTok
            ? [`Token revealed (audited) ${now()}`, ...r.log]
            : r.log,
        }
      }),
    )
  }

  const progress = Math.min(step, 4) / 4
  const current = cur !== null ? requests.find((r) => r.id === cur) : null

  if (shell === 'login') {
    return (
      <div
        className={cn(
          patientFontClass,
          'patient-atmosphere flex min-h-svh items-center justify-center px-4 py-10',
        )}
      >
        <Card className="w-full max-w-md border-line bg-surface shadow-lg">
          <CardBody className="space-y-4 p-6 text-center sm:p-8">
            <div className="flex justify-center">
              <BrandMark className="h-12 w-12" />
            </div>
            <h1 className="font-display text-2xl font-bold text-heading">
              Script Direct
            </h1>
            <p className="text-sm text-ink-muted">
              Pharmacy admin · Sample Pharmacy A
            </p>
            <div className="rounded-card border border-line bg-brand-50/50 px-3 py-3 text-left text-sm text-ink">
              Demo hand-off from the patient thank-you page.
            </div>
            {loginStep === 0 ? (
              <>
                <Button
                  type="button"
                  className="w-full"
                  size="lg"
                  onClick={() => setLoginStep(1)}
                >
                  Sign in with Microsoft Entra ID
                </Button>
                <p className="text-xs text-ink-muted">
                  MFA enforced by Conditional Access
                </p>
              </>
            ) : (
              <>
                <p className="text-sm text-ink">
                  Approve the sign-in on your phone and enter{' '}
                  <span className="text-3xl font-bold text-brand-700">47</span>
                </p>
                <Button
                  type="button"
                  className="w-full"
                  size="lg"
                  onClick={() => {
                    setShell('app')
                    setCur(null)
                    window.scrollTo(0, 0)
                  }}
                >
                  I&apos;ve approved (MFA)
                </Button>
              </>
            )}
          </CardBody>
        </Card>
        <Toast message={toast} />
      </div>
    )
  }

  if (shell === 'app') {
    return (
      <div
        className={cn(
          patientFontClass,
          'min-h-dvh bg-canvas lg:grid lg:grid-cols-[15.5rem_1fr]',
        )}
      >
        <aside className="relative z-[1] flex flex-col border-b border-line bg-surface lg:sticky lg:top-0 lg:h-dvh lg:border-b-0 lg:border-r lg:shadow-[var(--shadow-sm)]">
          <div
            className="pointer-events-none absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-brand-600 via-brand-700 to-brand-800"
            aria-hidden
          />

          <div className="relative overflow-hidden border-b border-line px-4 py-5">
            <div
              className="pointer-events-none absolute inset-0 bg-gradient-to-br from-brand-50 via-white to-surface-muted"
              aria-hidden
            />
            <div className="relative flex items-center gap-3">
              <BrandMark className="h-11 w-11" />
              <div className="min-w-0">
                <p className="font-display truncate text-base font-extrabold tracking-tight text-heading">
                  Script Direct
                </p>
                <p className="mt-0.5 truncate text-xs font-semibold text-brand-700">
                  Pharmacy portal
                </p>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-3 py-5">
            <p className="mb-2 px-2 text-[11px] font-bold uppercase tracking-[0.12em] text-ink-muted">
              Workspace
            </p>
            <Button
              type="button"
              variant={cur === null ? 'secondary' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setCur(null)}
            >
              <ClipboardList className="h-4 w-4" aria-hidden />
              Requests
            </Button>
          </div>

          <div className="space-y-3 border-t border-line bg-canvas/60 p-3">
            <div className="rounded-card border border-line bg-surface p-3 shadow-[var(--shadow-sm)]">
              <div className="flex items-start gap-2.5">
                <span
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-control bg-brand-100 text-brand-800"
                  aria-hidden
                >
                  <Building2 className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-heading">
                    Sample Pharmacy A
                  </p>
                  <p className="mt-1 inline-flex items-center gap-1 rounded-badge bg-success-bg px-2 py-0.5 text-[10px] font-bold text-success">
                    <ShieldCheck className="h-3 w-3" aria-hidden />
                    MFA secured
                  </p>
                </div>
              </div>
              <p className="mt-2.5 flex items-center gap-1 text-[11px] text-ink-muted">
                <Lock className="h-3 w-3 shrink-0" aria-hidden />
                Entra ID · staff user
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="w-full justify-start"
              onClick={() => go(5)}
            >
              Patient demo
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="w-full justify-center"
              onClick={() => window.location.reload()}
            >
              <LogOut className="h-4 w-4" aria-hidden />
              Sign out
            </Button>
          </div>
        </aside>

        <div className="relative flex min-w-0 flex-col">
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-72 sd-mesh opacity-80"
            aria-hidden
          />

          <header className="sticky top-0 z-10 border-b border-line/80 bg-white/80 backdrop-blur-md">
            <div className="relative mx-auto flex w-full max-w-7xl items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
              <div className="min-w-0">
                <p className="font-display truncate text-base font-bold tracking-tight text-heading sm:text-lg">
                  Requests
                </p>
                <p className="truncate text-[11px] font-semibold text-brand-700">
                  Sample Pharmacy A · upfront-paid orders
                </p>
              </div>
              <span className="ml-auto inline-flex items-center gap-1.5 rounded-badge border border-brand-200 bg-brand-50 px-3 py-1.5 text-xs font-bold text-brand-800 shadow-[var(--shadow-sm)]">
                <ClipboardList className="h-3.5 w-3.5" aria-hidden />
                Orders
              </span>
            </div>
          </header>

          <main className="relative mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            {current ? (
              <PharmacyDetail
                r={current}
                email={S.em || 'patient@example.com'}
                address={S.ad || '12 Example St, Sydney NSW'}
                onBack={() => setCur(null)}
                onSetStatus={setStatus}
                onReveal={() => revealToken(current.id)}
                onCopy={() => {
                  updateRequest(current.id, {
                    log: [`Token copied ${now()}`, ...current.log],
                  })
                  showToast('Copied. Written to the audit log')
                }}
                onReject={() => {
                  setRejectId(current.id)
                  setRejectOpen(true)
                }}
                displayStatus={displayStatus(current)}
              />
            ) : (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h1 className="font-display text-2xl font-bold text-heading">
                    Requests
                  </h1>
                  <p className="rounded-badge border border-line bg-brand-50/80 px-3 py-1.5 text-xs font-semibold text-brand-700">
                    Upfront-paid smoke rehab order is at the top
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {FILTERS.map((f) => (
                    <button
                      key={f}
                      type="button"
                      className={cn(
                        'rounded-badge border px-3 py-1.5 text-xs font-semibold transition-colors',
                        filter === f
                          ? 'border-brand-600 bg-brand-600 text-white'
                          : 'border-line bg-surface text-ink-muted hover:bg-brand-50',
                      )}
                      onClick={() => setFilter(f)}
                    >
                      {f}
                    </button>
                  ))}
                </div>
                <Card className="overflow-hidden border-line shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[640px] text-left text-sm">
                      <thead className="bg-canvas/80 text-xs uppercase tracking-wide text-ink-muted">
                        <tr>
                          <th className="px-3 py-2.5">Reference</th>
                          <th className="px-3 py-2.5">Received</th>
                          <th className="px-3 py-2.5">Patient</th>
                          <th className="px-3 py-2.5">Product</th>
                          <th className="px-3 py-2.5">Payment</th>
                          <th className="px-3 py-2.5">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filtered.length ? (
                          filtered.map((r) => (
                            <tr
                              key={r.id}
                              className="cursor-pointer border-t border-line hover:bg-brand-50/50"
                              onClick={() => setCur(r.id)}
                            >
                              <td className="px-3 py-3 font-mono font-semibold text-ink">
                                {r.ref}
                              </td>
                              <td className="px-3 py-3 text-ink-muted">{r.t}</td>
                              <td className="px-3 py-3">{r.n}</td>
                              <td className="px-3 py-3">{r.product}</td>
                              <td className="px-3 py-3">
                                <span
                                  className={cn(
                                    'rounded-badge px-2 py-0.5 text-xs font-bold',
                                    statusTone(r.p),
                                  )}
                                >
                                  {r.p}
                                </span>
                              </td>
                              <td className="px-3 py-3">
                                <span
                                  className={cn(
                                    'rounded-badge px-2 py-0.5 text-xs font-bold',
                                    statusTone(displayStatus(r)),
                                  )}
                                >
                                  {displayStatus(r)}
                                </span>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td
                              colSpan={6}
                              className="px-3 py-6 text-center text-ink-muted"
                            >
                              No requests match.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </Card>
                <p className="text-xs text-ink-muted">
                  Payment already captured on the patient side · Newest first
                </p>
              </div>
            )}
          </main>
        </div>

        {rejectOpen && rejectId !== null ? (
          <div className="fixed inset-0 z-50 grid place-items-center bg-ink/40 p-4 backdrop-blur-sm">
            <Card className="w-full max-w-md shadow-xl">
              <CardBody className="space-y-3 p-5 sm:p-6">
                <h2 className="font-display text-xl font-bold text-heading">
                  Reject and refund request
                </h2>
                <p className="font-mono text-sm text-ink-muted">
                  {requests.find((r) => r.id === rejectId)?.ref}
                </p>
                <p className="text-sm text-ink-muted">
                  The patient is refunded{' '}
                  <b className="text-ink">
                    {money(requests.find((r) => r.id === rejectId)?.amt ?? 0)}
                  </b>{' '}
                  to their original payment method. This can&apos;t be undone.
                </p>
                <Field>
                  <Label htmlFor="rs">Reason</Label>
                  <select
                    id="rs"
                    className="h-11 w-full rounded-control border border-line bg-surface px-3 text-sm text-ink focus-ring"
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                  >
                    <option>Invalid or expired script</option>
                    <option>Unable to supply</option>
                    <option>Cannot contact patient</option>
                    <option>Duplicate request</option>
                    <option>Other</option>
                  </select>
                </Field>
                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setRejectOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    variant="danger"
                    onClick={() => {
                      const id = rejectId
                      setRejectOpen(false)
                      setRequests((prev) =>
                        prev.map((r) =>
                          r.id === id
                            ? {
                                ...r,
                                s: 'Rejected',
                                p: 'Refund pending',
                                log: [
                                  `Rejected: ${rejectReason} ${now()}`,
                                  'Patient emailed, refund started',
                                  ...r.log,
                                ],
                              }
                            : r,
                        ),
                      )
                      setCur(id)
                      showToast('Refund started with Stripe')
                      window.setTimeout(() => {
                        setRequests((prev) =>
                          prev.map((r) =>
                            r.id === id
                              ? {
                                  ...r,
                                  p: 'Refunded',
                                  log: [`Refund confirmed ${now()}`, ...r.log],
                                }
                              : r,
                          ),
                        )
                      }, 2500)
                    }}
                  >
                    Reject and refund
                  </Button>
                </div>
              </CardBody>
            </Card>
          </div>
        ) : null}
        <Toast message={toast} />
      </div>
    )
  }

  return (
    <div
      className={cn(
        patientFontClass,
        'patient-atmosphere relative flex min-h-svh flex-col overflow-x-hidden',
      )}
    >
      <SiteHeader showProgress={false} />

      <div className="relative flex flex-1 flex-col">
        <div
          className="sd-blob sd-blob-a -left-16 top-0 opacity-55"
          aria-hidden
        />
        <div
          className="sd-blob sd-blob-b -right-10 top-40 opacity-45"
          aria-hidden
        />

        <div className="relative mx-auto w-full max-w-xl px-4 py-6 sm:max-w-2xl sm:py-10">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <p className="truncate font-display text-base font-extrabold tracking-tight text-brand-700 sm:text-lg">
                {clinicName}
              </p>
              <span className="inline-flex max-w-[12rem] truncate rounded-badge border border-brand-200/80 bg-white/90 px-3 py-1 text-xs font-semibold text-brand-700 shadow-sm sm:max-w-none">
                {clinicName}
              </span>
            </div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-brand-600">
              {step < 5 ? `Step ${step + 1} of 5` : 'Done'}
            </p>
          </div>

          {step < 5 ? (
            <div className="mb-5 h-2 overflow-hidden rounded-full bg-brand-100">
              <div
                className="h-full rounded-full bg-brand-600 transition-all duration-300"
                style={{ width: `${progress * 100}%` }}
              />
            </div>
          ) : null}

        {step === 0 ? (
          <div className="overflow-hidden rounded-hero border border-line bg-surface shadow-lg">
            <div className="relative overflow-hidden sd-mesh px-5 pb-6 pt-6 sm:px-7">
              <div className="sd-dot-grid absolute inset-0 opacity-40" aria-hidden />
              <div className="relative">
                <span className="inline-flex items-center gap-2 rounded-badge border border-brand-200/80 bg-white/90 px-3 py-1 text-xs font-semibold text-brand-700 shadow-sm">
                  <MapPin className="h-3.5 w-3.5" aria-hidden />
                  <span className="truncate">
                    {clinicName} · QR scan
                  </span>
                </span>
                <h1 className="font-display mt-4 !text-2xl font-extrabold leading-snug tracking-tight text-heading sm:!text-[1.85rem]">
                  Smoke rehabilitation — pay upfront
                </h1>
                <p className="mt-2 max-w-lg text-sm leading-relaxed text-ink-muted sm:text-base">
                  Enter your eScript, pay for the starter kit now, then the
                  pharmacy prepares your order.
                </p>
              </div>
            </div>

            <div className="space-y-5 border-t border-line px-5 py-6 sm:px-7">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand-700">
                  How this demo differs
                </p>
                <ol className="mt-3 grid gap-2 sm:grid-cols-2">
                  {[
                    'Enter eScript token',
                    'See the smoke rehab product & price',
                    'Pay securely upfront',
                    'Pharmacy processes the paid order',
                  ].map((t, i) => (
                    <li
                      key={t}
                      className="flex items-start gap-3 rounded-card border border-line bg-brand-50/50 px-3 py-3 text-sm text-ink"
                    >
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">
                        {i + 1}
                      </span>
                      <span className="pt-0.5 font-medium text-heading">{t}</span>
                    </li>
                  ))}
                </ol>
              </div>
              <ProductCard />
              <Button
                type="button"
                className="w-full rounded-badge"
                size="lg"
                onClick={() => go(1)}
              >
                Start · enter eScript
              </Button>
            </div>
          </div>
        ) : null}

        {step === 1 ? (
          <div className="space-y-4">
            <Card className="border-line bg-surface shadow-lg">
              <CardBody className="space-y-4 p-5 sm:p-7">
                <div>
                  <h2 className="font-display text-xl font-bold text-heading">
                    eScript token
                  </h2>
                  <p className="mt-1 text-sm text-ink-muted">
                    Payment is collected right after we confirm your token —
                    before pharmacy review.
                  </p>
                </div>
                <Field>
                  <Label htmlFor="tk">eScript token</Label>
                  <Input
                    id="tk"
                    placeholder="e.g. 4K7M9PX2LQ8D"
                    value={S.tk}
                    onChange={(e) => setS((p) => ({ ...p, tk: e.target.value }))}
                  />
                </Field>
                <button
                  type="button"
                  className="text-sm font-semibold text-brand-700 underline-offset-2 hover:underline"
                  onClick={fillSample}
                >
                  Fill sample token &amp; details
                </button>
              </CardBody>
            </Card>
            <Card className="border-line bg-surface shadow-md">
              <CardBody className="space-y-3 p-5 sm:p-6">
                <h3 className="font-semibold text-heading">Your product</h3>
                <ProductCard />
              </CardBody>
            </Card>
            <NavRow
              onBack={() => go(0)}
              nextLabel="Continue"
              onNext={() => {
                if (!S.tk || S.tk.trim().length < 6) {
                  showToast('Enter a valid eScript token')
                  return
                }
                go(2)
              }}
            />
          </div>
        ) : null}

        {step === 2 ? (
          <div className="space-y-4">
            <Card className="border-line bg-surface shadow-lg">
              <CardBody className="space-y-1 p-5 sm:p-7">
                <h2 className="font-display text-xl font-bold text-heading">
                  Your details
                </h2>
                <Field>
                  <Label htmlFor="nm">Full name</Label>
                  <Input
                    id="nm"
                    value={S.nm}
                    onChange={(e) => setS((p) => ({ ...p, nm: e.target.value }))}
                  />
                </Field>
                <Field>
                  <Label htmlFor="mb">Mobile</Label>
                  <Input
                    id="mb"
                    value={S.mb}
                    onChange={(e) => setS((p) => ({ ...p, mb: e.target.value }))}
                  />
                </Field>
                <Field>
                  <Label htmlFor="em">Email</Label>
                  <Input
                    id="em"
                    type="email"
                    value={S.em}
                    onChange={(e) => setS((p) => ({ ...p, em: e.target.value }))}
                  />
                </Field>
                <div className="pt-2">
                  <p className="mb-2 text-sm font-semibold text-fg-secondary">
                    Fulfilment
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {(
                      [
                        ['Delivery', 'Delivery'],
                        ['Collection', 'Collection'],
                      ] as const
                    ).map(([value, label]) => (
                      <button
                        key={value}
                        type="button"
                        className={cn(
                          'rounded-badge border px-4 py-2 text-sm font-semibold transition-colors',
                          S.ful === value
                            ? 'border-brand-600 bg-brand-600 text-white shadow-sm'
                            : 'border-line bg-surface text-brand-700 hover:bg-brand-50 hover:border-brand-300',
                        )}
                        onClick={() => setS((p) => ({ ...p, ful: value }))}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
                {S.ful === 'Delivery' ? (
                  <Field>
                    <Label htmlFor="ad">Delivery address</Label>
                    <Input
                      id="ad"
                      value={S.ad}
                      onChange={(e) =>
                        setS((p) => ({ ...p, ad: e.target.value }))
                      }
                    />
                  </Field>
                ) : null}
              </CardBody>
            </Card>
            <Card className="border-line bg-surface shadow-md">
              <CardBody className="space-y-3 p-5 sm:p-6">
                <ProductCard />
                <Row label="Due now" value={money(PRODUCT.price)} />
              </CardBody>
            </Card>
            <NavRow
              onBack={() => go(1)}
              nextLabel="Continue to payment"
              onNext={() => {
                if (!S.nm || !S.mb || !S.em || (S.ful === 'Delivery' && !S.ad)) {
                  showToast('Please complete all fields')
                  return
                }
                go(3)
              }}
            />
          </div>
        ) : null}

        {step === 3 ? (
          <div className="space-y-4">
            <Card className="border-line bg-surface shadow-lg">
              <CardBody className="space-y-3 p-5 sm:p-7">
                <h2 className="font-display text-xl font-bold text-heading">
                  Review and pay
                </h2>
                <Row label="eScript" value={S.tk} />
                <Row label="Name" value={S.nm} />
                <Row label="Fulfilment" value={S.ful} />
                {S.ful === 'Delivery' ? (
                  <Row label="Address" value={S.ad} />
                ) : null}
                <hr className="border-line" />
                <ProductCard />
                <div className="flex items-center justify-between gap-3 pt-1">
                  <b className="text-ink">Total due now</b>
                  <b className="font-display text-2xl text-brand-700">
                    {money(PRODUCT.price)}
                  </b>
                </div>
              </CardBody>
            </Card>
            <Card className="border-line bg-surface shadow-md">
              <CardBody className="p-5 sm:p-6">
                <label className="flex cursor-pointer items-start gap-3 text-sm text-ink">
                  <input
                    type="checkbox"
                    className="mt-1 h-4 w-4 rounded border-line text-brand-600 focus-ring"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                  />
                  <span>
                    I accept the terms (v1) and privacy notice, and consent to my
                    details being shared with the pharmacy.
                  </span>
                </label>
              </CardBody>
            </Card>
            <NavRow
              onBack={() => go(2)}
              nextLabel="Continue to payment"
              onNext={() => {
                if (!consent) {
                  showToast('Please accept the terms to continue')
                  return
                }
                go(4)
              }}
            />
          </div>
        ) : null}

        {step === 4 ? (
          <div className="space-y-4">
            <Card className="border-line bg-surface shadow-lg">
              <CardBody className="space-y-4 p-5 sm:p-7">
                <div>
                  <h2 className="font-display text-xl font-bold text-heading">
                    Pay securely
                  </h2>
                  <p className="mt-1 text-sm text-ink-muted">
                    Card details go straight to Stripe and never touch our
                    servers. Amount charged now:{' '}
                    <span className="font-semibold text-heading">
                      {money(PRODUCT.price)}
                    </span>
                    .
                  </p>
                </div>
                <UpfrontStripePay
                  amountLabel={money(PRODUCT.price)}
                  onBack={() => go(3)}
                  onPaid={completePaid}
                />
              </CardBody>
            </Card>
          </div>
        ) : null}

        {step === 5 ? (
          <div className="space-y-4">
            <Card className="border-line bg-surface shadow-lg">
              <CardBody className="space-y-4 p-5 text-center sm:p-7">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success-bg text-success">
                  <CheckCircle2 className="h-9 w-9" aria-hidden />
                </div>
                <div>
                  <h2 className="font-display text-xl font-bold text-heading sm:text-2xl">
                    Thank you for your payment
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                    Payment of <b className="text-ink">{money(PRODUCT.price)}</b>{' '}
                    for <b className="text-ink">{PRODUCT.name}</b> succeeded.
                    Sample Pharmacy A has been notified and will prepare your
                    order.
                  </p>
                </div>
                <div className="rounded-card border border-line bg-brand-50/50 px-4 py-4">
                  <p className="text-xs font-medium text-ink-muted">
                    Your reference
                  </p>
                  <p className="mt-1 font-mono text-2xl font-bold text-brand-700">
                    {REF}
                  </p>
                </div>
                <p className="text-sm text-ink-muted">
                  We emailed a private status link to{' '}
                  <span className="font-semibold text-ink">
                    {S.em || 'your email'}
                  </span>
                  .
                </p>
              </CardBody>
            </Card>
            <Card className="border-dashed border-brand-200 bg-surface/80 shadow-sm">
              <CardBody className="space-y-3 p-5 text-center sm:p-6">
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-brand-600">
                  Client demo · hand-off to pharmacy
                </p>
                <p className="text-sm text-ink-muted">
                  Open the pharmacy dashboard to continue the staff workflow for
                  this paid order.
                </p>
                <Button
                  type="button"
                  className="w-full"
                  size="lg"
                  onClick={() => {
                    setShell('login')
                    setLoginStep(0)
                    window.scrollTo(0, 0)
                  }}
                >
                  View pharmacy side →
                </Button>
              </CardBody>
            </Card>
          </div>
        ) : null}
        </div>
      </div>
      <Toast message={toast} />
    </div>
  )
}

function Toast({ message }: { message: string | null }) {
  if (!message) return null
  return (
    <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-badge bg-brand-700 px-5 py-3 text-sm font-semibold text-white shadow-lg">
      {message}
    </div>
  )
}

function PharmacyDetail({
  r,
  email,
  address,
  onBack,
  onSetStatus,
  onReveal,
  onCopy,
  onReject,
  displayStatus,
}: {
  r: PharmacyRequest
  email: string
  address: string
  onBack: () => void
  onSetStatus: (id: number, s: RequestStatus, msg: string) => void
  onReveal: () => void
  onCopy: () => void
  onReject: () => void
  displayStatus: string
}) {
  const rej = r.s === 'Rejected'
  const tokenDisplay = r.tok
    ? (r.escript || '4K7M9PX2LQ8D').replace(/(.{4})/g, '$1 ').trim()
    : 'XXXXXXXXXXXX'

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm">
          <button
            type="button"
            className="font-semibold text-brand-700 hover:underline"
            onClick={onBack}
          >
            ‹ Requests
          </button>
          <span className="text-ink-muted"> / </span>
          <span className="font-mono font-bold text-ink">{r.ref}</span>
        </div>
        <span
          className={cn(
            'rounded-badge px-2.5 py-1 text-xs font-bold',
            statusTone(displayStatus),
          )}
        >
          {displayStatus}
        </span>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-4">
          <Card>
            <CardBody className="space-y-1 p-5">
              <h3 className="mb-2 font-display font-bold text-heading">
                Patient and fulfilment
              </h3>
              <Row label="Name" value={r.n} />
              <Row label="Mobile" value="04xx xxx xxx" />
              <Row label="Email" value={email} />
              <Row label="Fulfilment" value={r.f} />
              {r.f === 'Delivery' ? <Row label="Address" value={address} /> : null}
              <Row label="Product" value={r.product || PRODUCT.name} />
            </CardBody>
          </Card>
          <Card>
            <CardBody className="space-y-3 p-5">
              <h3 className="font-display font-bold text-heading">eScript token</h3>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="font-mono text-lg tracking-wider text-ink">
                  {tokenDisplay}
                </span>
                <div className="flex gap-2">
                  <Button type="button" variant="secondary" size="sm" onClick={onReveal}>
                    {r.tok ? 'Hide' : 'Reveal'}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    disabled={!r.tok}
                    onClick={onCopy}
                  >
                    Copy
                  </Button>
                </div>
              </div>
              <p className="text-xs text-ink-muted">
                Reveal and copy are written to the audit log.
              </p>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="space-y-1 p-5">
              <h3 className="mb-2 font-display font-bold text-heading">
                Consent and payment
              </h3>
              <Row label="Consent" value="Accepted, terms v1" />
              <div className="flex justify-between gap-4 py-1 text-sm">
                <span className="text-ink-muted">Payment</span>
                <span
                  className={cn(
                    'rounded-badge px-2 py-0.5 text-xs font-bold',
                    statusTone(r.p),
                  )}
                >
                  {r.p}
                </span>
              </div>
              <Row label="Amount" value={`${money(r.amt)} (paid upfront)`} />
              <Row label="Stripe ref" value="ending 4F2A" />
              {r.id === 0 ? (
                <p className="mt-3 rounded-card border border-line bg-brand-50/50 px-3 py-2 text-sm font-medium text-brand-700">
                  Paid before pharmacy review — no invoice step in this workflow.
                </p>
              ) : null}
            </CardBody>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardBody className="space-y-2 p-5">
              <h3 className="mb-2 font-display font-bold text-heading">
                Update status
              </h3>
              <Button
                type="button"
                variant="secondary"
                className="w-full justify-start"
                disabled={r.s !== 'New'}
                onClick={() => onSetStatus(r.id, 'In progress', 'Marked in progress')}
              >
                Mark in progress
              </Button>
              <Button
                type="button"
                variant="secondary"
                className="w-full justify-start"
                disabled={r.s !== 'In progress'}
                onClick={() => onSetStatus(r.id, 'Ready', 'Patient notified')}
              >
                {r.f === 'Delivery'
                  ? 'Mark dispatched'
                  : 'Mark ready for collection'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                className="w-full justify-start"
                disabled={r.s !== 'Ready'}
                onClick={() => onSetStatus(r.id, 'Completed', 'Completed')}
              >
                Mark completed
              </Button>
              <Button
                type="button"
                variant="danger"
                className="w-full justify-start"
                disabled={rej || r.s === 'Completed'}
                onClick={onReject}
              >
                Reject and refund
              </Button>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="p-5">
              <h3 className="mb-2 font-display font-bold text-heading">Activity</h3>
              <ul className="space-y-2 text-sm text-ink-muted">
                {r.log.map((l) => (
                  <li key={l} className="border-b border-line pb-2">
                    {l}
                  </li>
                ))}
                <li>Opened by staff user {now()}</li>
              </ul>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  )
}

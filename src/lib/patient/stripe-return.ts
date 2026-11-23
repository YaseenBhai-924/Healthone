/**
 * Stripe appends these query params after a redirect-based confirmation
 * (e.g. 3D Secure). Used to resume the wizard on the confirmation step.
 */
export type StripeRedirectStatus =
  | 'succeeded'
  | 'processing'
  | 'requires_payment_method'
  | 'failed'
  | string

export interface StripePaymentReturn {
  paymentIntentId: string | null
  redirectStatus: StripeRedirectStatus | null
  /** True when the URL looks like a return from Stripe confirmPayment. */
  isReturn: boolean
  /** Payment completed or is still processing on Stripe's side. */
  isPaid: boolean
  /** Patient must retry (declined / cancelled / failed auth). */
  isFailed: boolean
}

export function parseStripePaymentReturn(
  search: string | URLSearchParams,
): StripePaymentReturn {
  const params =
    typeof search === 'string' ? new URLSearchParams(search) : search

  const paymentIntentId = params.get('payment_intent')
  const redirectStatus = params.get('redirect_status') as StripeRedirectStatus | null
  const paidFlag = params.get('paid') === '1'
  const hasClientSecret = params.has('payment_intent_client_secret')

  const isReturn =
    paidFlag ||
    Boolean(paymentIntentId) ||
    hasClientSecret ||
    Boolean(redirectStatus)

  const isPaid =
    redirectStatus === 'succeeded' ||
    redirectStatus === 'processing' ||
    (paidFlag && redirectStatus !== 'failed' && redirectStatus !== 'requires_payment_method')

  const isFailed =
    redirectStatus === 'failed' ||
    redirectStatus === 'requires_payment_method'

  return {
    paymentIntentId,
    redirectStatus,
    isReturn,
    isPaid,
    isFailed,
  }
}

/** Drop Stripe return params so refresh does not re-trigger return handling. */
export function stripStripeReturnParams(url: URL): string {
  const next = new URL(url.href)
  next.searchParams.delete('payment_intent')
  next.searchParams.delete('payment_intent_client_secret')
  next.searchParams.delete('redirect_status')
  next.searchParams.delete('paid')
  return next.pathname + next.search + next.hash
}

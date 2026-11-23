/**
 * Browser-callable client for anonymous patient endpoints.
 * Uses relative `/api/public/*` (rewritten to the API in next.config).
 */
import type {
  ClinicDto,
  CreateRequestBody,
  CreateRequestResponse,
  PaymentResponse,
  PublicApiError,
  StatusLookupResponse,
} from './public-types'

export type PublicResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: PublicApiError }

async function parseError(res: Response): Promise<PublicApiError> {
  const fallback: PublicApiError = {
    status: res.status,
    message: 'Something went wrong. Please try again.',
  }
  try {
    const body = (await res.json()) as {
      detail?: string
      title?: string
      code?: string
      errors?: Record<string, string[]>
      extensions?: { code?: string }
    }
    return {
      status: res.status,
      code: body.code ?? body.extensions?.code,
      message: body.detail ?? body.title ?? fallback.message,
      fieldErrors: body.errors,
    }
  } catch {
    return fallback
  }
}

async function publicFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<PublicResult<T>> {
  try {
    const isFormData =
      typeof FormData !== 'undefined' && init?.body instanceof FormData
    const res = await fetch(`/api/public${path}`, {
      ...init,
      cache: 'no-store',
      headers: {
        Accept: 'application/json',
        ...(init?.body && !isFormData
          ? { 'Content-Type': 'application/json' }
          : {}),
        ...init?.headers,
      },
    })
    if (!res.ok) return { ok: false, error: await parseError(res) }
    if (res.status === 202 || res.status === 204) {
      return { ok: true, data: undefined as T }
    }
    const data = (await res.json()) as T
    return { ok: true, data }
  } catch {
    return {
      ok: false,
      error: {
        status: 0,
        message:
          'We could not reach the Script Direct API. Make sure it is running, then try again.',
      },
    }
  }
}

export function getClinic(slug: string): Promise<PublicResult<ClinicDto>> {
  return publicFetch<ClinicDto>(`/clinics/${encodeURIComponent(slug)}`)
}

export function createRequest(
  body: CreateRequestBody,
  scriptFile?: File | null,
): Promise<PublicResult<CreateRequestResponse>> {
  if (body.scriptSource === 'UploadedScript' || scriptFile) {
    const form = new FormData()
    form.set('clinicSlug', body.clinicSlug)
    form.set('scriptSource', 'UploadedScript')
    form.set('patientName', body.patientName)
    form.set('mobile', body.mobile)
    form.set('email', body.email)
    form.set('fulfilmentType', body.fulfilmentType)
    if (body.notesToPharmacy) form.set('notesToPharmacy', body.notesToPharmacy)
    form.set(
      'consent.privacyPolicyAccepted',
      String(body.consent.privacyPolicyAccepted),
    )
    form.set('consent.termsAccepted', String(body.consent.termsAccepted))
    form.set('consent.privacyVersion', body.consent.privacyVersion)
    form.set('consent.termsVersion', body.consent.termsVersion)
    if (body.address) {
      form.set('address.line1', body.address.line1)
      if (body.address.line2) form.set('address.line2', body.address.line2)
      form.set('address.suburb', body.address.suburb)
      form.set('address.state', body.address.state)
      form.set('address.postcode', body.address.postcode)
    }
    if (scriptFile) form.set('scriptFile', scriptFile, scriptFile.name)

    return publicFetch<CreateRequestResponse>('/requests', {
      method: 'POST',
      body: form,
      headers: {
        // Let the browser set multipart boundary; do not force JSON Content-Type.
        Accept: 'application/json',
      },
    })
  }

  return publicFetch<CreateRequestResponse>('/requests', {
    method: 'POST',
    body: JSON.stringify({
      ...body,
      scriptSource: body.scriptSource ?? 'Escript',
    }),
  })
}

export function startPayment(
  requestId: string,
  statusToken: string,
): Promise<PublicResult<PaymentResponse>> {
  return publicFetch<PaymentResponse>(`/requests/${requestId}/payment`, {
    method: 'POST',
    headers: { 'X-Status-Token': statusToken },
  })
}

export function lookupStatus(
  token: string,
): Promise<PublicResult<StatusLookupResponse>> {
  return publicFetch<StatusLookupResponse>('/status/lookup', {
    method: 'POST',
    body: JSON.stringify({ token }),
  })
}

export function resendStatusLink(
  reference: string,
  email: string,
): Promise<PublicResult<void>> {
  return publicFetch<void>('/status/resend', {
    method: 'POST',
    body: JSON.stringify({ reference, email }),
  })
}

import { z } from 'zod'
import { PRIVACY_VERSION, TERMS_VERSION } from './policies'

const AU_STATES = ['NSW', 'VIC', 'QLD', 'WA', 'SA', 'TAS', 'ACT', 'NT'] as const

function normaliseToken(value: string): string {
  return value.trim().toUpperCase()
}

function isValidEscriptToken(value: string): boolean {
  const n = normaliseToken(value)
  if (n.length < 8 || n.length > 40) return false
  return /^[A-Z0-9]+$/.test(n)
}

function isValidAuMobile(value: string): boolean {
  const s = value.replace(/[\s\-().]/g, '')
  let digits = s
  if (digits.startsWith('+61')) digits = `0${digits.slice(3)}`
  else if (digits.startsWith('61') && digits.length === 11)
    digits = `0${digits.slice(2)}`
  return /^04\d{8}$/.test(digits)
}

export const addressSchema = z.object({
  line1: z.string().trim().min(1, 'Enter a street address').max(120),
  line2: z.string().trim().max(120).optional().or(z.literal('')),
  suburb: z.string().trim().min(1, 'Enter a suburb').max(80),
  state: z.enum(AU_STATES, { required_error: 'Choose a state or territory' }),
  postcode: z
    .string()
    .trim()
    .regex(/^\d{4}$/, 'Enter a 4 digit postcode'),
})

/** Loose address shape kept in the form for both fulfilment types. */
const addressDraftSchema = z
  .object({
    line1: z.string().optional(),
    line2: z.string().optional(),
    suburb: z.string().optional(),
    state: z.string().optional(),
    postcode: z.string().optional(),
  })
  .optional()

export const PRESCRIPTION_METHODS = ['escript', 'upload'] as const
export type PrescriptionMethod = (typeof PRESCRIPTION_METHODS)[number]

export const detailsSchema = z
  .object({
    prescriptionMethod: z.enum(PRESCRIPTION_METHODS),
    escriptToken: z.string().optional().or(z.literal('')),
    /** Client-side only: selected file name when uploading a paper script. */
    scriptFileName: z.string().optional().or(z.literal('')),
    notesToPharmacy: z.string().trim().max(500).optional().or(z.literal('')),
    patientName: z.string().trim().min(1, 'Enter your full name').max(120),
    mobile: z.string().refine(isValidAuMobile, {
      message: 'Enter an Australian mobile number, for example 0412 345 678.',
    }),
    email: z.string().trim().email('Enter a valid email address').max(254),
    fulfilmentType: z.enum(['Delivery', 'Collection']),
    address: addressDraftSchema,
  })
  .superRefine((data, ctx) => {
    if (data.prescriptionMethod === 'escript') {
      if (!isValidEscriptToken(data.escriptToken ?? '')) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['escriptToken'],
          message: 'The eScript token must be 8–40 letters and digits.',
        })
      }
    } else if (data.prescriptionMethod === 'upload') {
      if (!(data.scriptFileName ?? '').trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['scriptFileName'],
          message: 'Choose a photo or PDF of your script.',
        })
      }
    }

    if (data.fulfilmentType !== 'Delivery') return
    const parsed = addressSchema.safeParse(data.address)
    if (parsed.success) return
    for (const issue of parsed.error.issues) {
      ctx.addIssue({
        ...issue,
        path: ['address', ...issue.path],
      })
    }
  })

export const consentSchema = z.object({
  privacyPolicyAccepted: z.literal(true, {
    errorMap: () => ({ message: 'You must accept the privacy policy.' }),
  }),
  termsAccepted: z.literal(true, {
    errorMap: () => ({ message: 'You must accept the terms.' }),
  }),
})

export type DetailsFormValues = z.infer<typeof detailsSchema>
export type ConsentFormValues = z.infer<typeof consentSchema>

export type CreateRequestPayload = {
  clinicSlug: string
  scriptSource: 'Escript' | 'UploadedScript'
  escriptToken?: string
  notesToPharmacy?: string
  patientName: string
  mobile: string
  email: string
  fulfilmentType: 'Delivery' | 'Collection'
  address: {
    line1: string
    line2: string | null
    suburb: string
    state: string
    postcode: string
  } | null
  consent: {
    privacyPolicyAccepted: boolean
    termsAccepted: boolean
    privacyVersion: string
    termsVersion: string
  }
}

export function toCreateRequestPayload(
  clinicSlug: string,
  details: DetailsFormValues,
  consent: { privacyPolicyAccepted: boolean; termsAccepted: boolean },
): CreateRequestPayload {
  const address =
    details.fulfilmentType === 'Delivery'
      ? addressSchema.parse(details.address)
      : null

  const notes = details.notesToPharmacy?.trim() || undefined

  return {
    clinicSlug,
    scriptSource:
      details.prescriptionMethod === 'upload' ? 'UploadedScript' : 'Escript',
    escriptToken:
      details.prescriptionMethod === 'escript'
        ? normaliseToken(details.escriptToken ?? '')
        : undefined,
    notesToPharmacy: notes,
    patientName: details.patientName.trim(),
    mobile: details.mobile.trim(),
    email: details.email.trim(),
    fulfilmentType: details.fulfilmentType,
    address: address
      ? {
          line1: address.line1.trim(),
          line2: address.line2?.trim() || null,
          suburb: address.suburb.trim(),
          state: address.state,
          postcode: address.postcode.trim(),
        }
      : null,
    consent: {
      privacyPolicyAccepted: consent.privacyPolicyAccepted,
      termsAccepted: consent.termsAccepted,
      privacyVersion: PRIVACY_VERSION,
      termsVersion: TERMS_VERSION,
    },
  }
}

/** @deprecated Use toCreateRequestPayload */
export function toCreateRequestBody(
  clinicSlug: string,
  details: DetailsFormValues,
  consent: { privacyPolicyAccepted: boolean; termsAccepted: boolean },
) {
  const payload = toCreateRequestPayload(clinicSlug, details, consent)
  if (payload.scriptSource !== 'Escript' || !payload.escriptToken) {
    throw new Error('Only eScript JSON submissions use toCreateRequestBody.')
  }
  return {
    clinicSlug: payload.clinicSlug,
    escriptToken: payload.escriptToken,
    patientName: payload.patientName,
    mobile: payload.mobile,
    email: payload.email,
    fulfilmentType: payload.fulfilmentType,
    address: payload.address,
    consent: payload.consent,
    notesToPharmacy: payload.notesToPharmacy,
    scriptSource: payload.scriptSource,
  }
}

export const AU_STATE_OPTIONS = AU_STATES

export const lostLinkSchema = z.object({
  reference: z.string().trim().min(1, 'Enter your reference').max(20),
  email: z
    .string()
    .trim()
    .email('Enter the email used on the request')
    .max(254),
})

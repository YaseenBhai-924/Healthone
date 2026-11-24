export type FulfilmentType = 'Collection' | 'Delivery'

export type RequestStatus =
  | 'Draft'
  | 'PaymentPending'
  | 'Submitted'
  | 'InProgress'
  | 'ReadyOrDispatched'
  | 'Completed'
  | 'Rejected'

export type PaymentStatus =
  | 'None'
  | 'Pending'
  | 'Paid'
  | 'Failed'
  | 'RefundPending'
  | 'Refunded'
  | 'RefundFailed'

export interface PharmacyAddressDto {
  line1: string
  line2?: string | null
  suburb: string
  state: string
  postcode: string
}

export interface ClinicDto {
  slug: string
  name: string
  logoUrl: string | null
  brandColour: string
  priceCents: number
  deliveryFeeCents: number
  currency: string
  orderingEnabled: boolean
  /** Partner pharmacy display name (prefer over clinic name in patient UI). */
  pharmacyName?: string | null
  /** Collection location; omit/null when unavailable. */
  pharmacyAddress?: PharmacyAddressDto | null
}

export interface FeaturedCompetitorDto {
  pharmacyName: string
  priceCents: number
  deltaCents: number
}

export interface FeaturedPriceComparisonDto {
  medicineName: string
  ourPriceCents: number
  partnerPharmacyName: string
  currency: string
  maxSavingCents: number
  competitors: FeaturedCompetitorDto[]
}

export interface AddressDto {
  line1: string
  line2?: string | null
  suburb: string
  state: string
  postcode: string
}

export interface ConsentDto {
  privacyPolicyAccepted: boolean
  termsAccepted: boolean
  privacyVersion: string
  termsVersion: string
}

export type ScriptSource = 'Escript' | 'UploadedScript'

export interface CreateRequestBody {
  clinicSlug: string
  scriptSource?: ScriptSource
  escriptToken?: string
  notesToPharmacy?: string | null
  patientName: string
  mobile: string
  email: string
  fulfilmentType: FulfilmentType
  address?: AddressDto | null
  consent: ConsentDto
}

export interface CreateRequestResponse {
  requestId: string
  statusToken: string
}

export interface PaymentResponse {
  clientSecret: string
  amountCents: number
  currency: string
}

export interface TimelineEntry {
  status: RequestStatus
  at: string
}

export interface StatusLookupResponse {
  status: RequestStatus
  paymentStatus: PaymentStatus
  reference: string | null
  fulfilmentType: FulfilmentType
  rejectionReason: string | null
  rejectionNote: string | null
  detailsRemoved: boolean
  timeline: TimelineEntry[]
}

export interface PublicApiError {
  status: number
  code?: string
  message: string
  fieldErrors?: Record<string, string[]>
}

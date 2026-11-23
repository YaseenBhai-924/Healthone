/**
 * Admin API DTOs (camelCase JSON from the .NET API).
 * Enum values use PascalCase string names (JsonStringEnumConverter).
 */

import type { PaymentStatus, RequestStatus } from "@/components/ui/badge";

export type FulfilmentType = "Collection" | "Delivery";

export type RejectionReasonCode =
  | "InvalidOrExpiredScript"
  | "UnableToSupply"
  | "CannotContactPatient"
  | "DuplicateRequest"
  | "Other";

export type ActorType =
  | "Unknown"
  | "Patient"
  | "PharmacyStaff"
  | "SuperAdmin"
  | "System";

export type PaymentRecordStatus =
  | "Pending"
  | "Succeeded"
  | "Failed"
  | "Canceled";

export type RefundStatus = "Pending" | "Succeeded" | "Failed";

export type RequestListItem = {
  id: string;
  reference: string;
  status: RequestStatus;
  paymentStatus: PaymentStatus;
  fulfilmentType: FulfilmentType;
  submittedAt: string;
  totalCents: number;
  currency: string;
  patientName: string | null;
  clinicName: string;
  pharmacyName: string;
};

export type PagedRequests = {
  items: RequestListItem[];
  page: number;
  pageSize: number;
  totalCount: number;
  statusCounts: Record<string, number>;
};

export type PatientDto = {
  name: string | null;
  mobile: string | null;
  email: string | null;
};

export type AddressDto = {
  line1: string | null;
  line2: string | null;
  suburb: string | null;
  state: string | null;
  postcode: string | null;
};

export type PriceDto = {
  itemName: string;
  priceCents: number;
  deliveryFeeCents: number;
  totalCents: number;
  currency: string;
};

export type InvoiceLineItemDto = {
  description: string;
  quantity: number;
  unitPriceCents: number;
  lineTotalCents: number;
};

export type PaymentSummaryDto = {
  amountCents: number;
  currency: string;
  status: PaymentRecordStatus;
  refundStatus: RefundStatus | null;
  refundFailureReason: string | null;
  stripePaymentIntentId: string | null;
};

export type ConsentSummaryDto = {
  privacyVersion: string;
  termsVersion: string;
  acceptedAt: string;
};

export type RejectionDto = {
  reason: string | null;
  note: string | null;
  at: string | null;
};

export type HistoryItemDto = {
  from: RequestStatus;
  to: RequestStatus;
  actorType: ActorType;
  note: string | null;
  at: string;
};

export type ScriptSource = "Escript" | "UploadedScript";

export type ScriptSummaryDto = {
  fileName: string | null;
  contentType: string | null;
  sizeBytes: number | null;
};

export type RequestDetailDto = {
  id: string;
  reference: string | null;
  status: RequestStatus;
  paymentStatus: PaymentStatus;
  fulfilmentType: FulfilmentType;
  scriptSource: ScriptSource;
  submittedAt: string | null;
  createdAt: string;
  pharmacyId: string;
  pharmacyName: string;
  clinicName: string;
  patient: PatientDto;
  address: AddressDto | null;
  patientNotes: string | null;
  price: PriceDto;
  invoiceLines: InvoiceLineItemDto[];
  canIssueInvoice: boolean;
  defaultDeliveryFeeCents: number;
  payment: PaymentSummaryDto | null;
  consent: ConsentSummaryDto | null;
  rejection: RejectionDto | null;
  tokenAvailable: boolean;
  scriptAvailable: boolean;
  script: ScriptSummaryDto | null;
  detailsRemoved: boolean;
  rowVersion: string;
  allowedActions: RequestStatus[];
  history: HistoryItemDto[];
};

export type IssueInvoiceLineInput = {
  description: string;
  quantity: number;
  unitPriceCents: number;
};

export type IssueInvoiceResponse = {
  checkoutUrl: string;
  totalCents: number;
  currency: string;
};

export type RevealTokenResponse = {
  token: string;
};

export type DownloadScriptResponse = {
  fileName: string;
  contentType: string;
  contentBase64: string;
};

export type ListRequestsParams = {
  status?: RequestStatus | null;
  paymentStatus?: PaymentStatus | null;
  search?: string | null;
  page?: number;
  /** SuperAdmin only — scopes the queue to one pharmacy. */
  pharmacyId?: string | null;
};

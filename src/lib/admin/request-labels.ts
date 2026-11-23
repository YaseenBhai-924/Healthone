import type { RequestStatus } from "@/components/ui/badge";
import type { FulfilmentType, RejectionReasonCode } from "@/lib/api/admin-types";

/** Queue filter chips (prototype “New” = Submitted). */
export const QUEUE_FILTERS = [
  { key: "all", label: "All", status: null },
  { key: "Submitted", label: "New", status: "Submitted" as const },
  {
    key: "PaymentPending",
    label: "Awaiting payment",
    status: "PaymentPending" as const,
  },
  { key: "InProgress", label: "Dispensing", status: "InProgress" as const },
  {
    key: "ReadyOrDispatched",
    label: "Ready or dispatched",
    status: "ReadyOrDispatched" as const,
  },
  { key: "Completed", label: "Completed", status: "Completed" as const },
  { key: "Rejected", label: "Rejected", status: "Rejected" as const },
] as const;

export type QueueFilterKey = (typeof QUEUE_FILTERS)[number]["key"];

export function parseQueueFilter(
  value: string | null | undefined,
): RequestStatus | null {
  if (!value || value === "all") return null;
  const match = QUEUE_FILTERS.find((f) => f.key === value);
  return match?.status ?? null;
}

/** Fulfilment-aware status label (prototype Ready vs Dispatched). */
export function displayRequestStatus(
  status: RequestStatus,
  fulfilment: FulfilmentType,
): string {
  if (status === "ReadyOrDispatched") {
    return fulfilment === "Delivery" ? "Dispatched" : "Ready for collection";
  }
  const labels: Record<RequestStatus, string> = {
    Draft: "Draft",
    PaymentPending: "Awaiting payment",
    Submitted: "New",
    InProgress: "Dispensing",
    ReadyOrDispatched: "Ready / Dispatched",
    Completed: "Completed",
    Rejected: "Rejected",
  };
  return labels[status];
}

export function statusActionLabel(
  target: RequestStatus,
  fulfilment: FulfilmentType,
  paymentStatus?: string | null,
): string {
  switch (target) {
    case "InProgress":
      return "Mark in progress";
    case "ReadyOrDispatched":
      return fulfilment === "Delivery"
        ? "Mark dispatched"
        : "Mark ready for collection";
    case "Completed":
      return "Mark completed";
    case "Rejected":
      return paymentStatus === "Paid" ||
        paymentStatus === "RefundPending" ||
        paymentStatus === "Refunded" ||
        paymentStatus === "RefundFailed"
        ? "Reject and refund"
        : "Reject";
    default:
      return displayRequestStatus(target, fulfilment);
  }
}

export const REJECTION_REASONS: {
  value: RejectionReasonCode;
  label: string;
}[] = [
  { value: "InvalidOrExpiredScript", label: "Invalid or expired script" },
  { value: "UnableToSupply", label: "Unable to supply" },
  { value: "CannotContactPatient", label: "Cannot contact patient" },
  { value: "DuplicateRequest", label: "Duplicate request" },
  { value: "Other", label: "Other" },
];

export function formatAddress(parts: {
  line1: string | null;
  line2: string | null;
  suburb: string | null;
  state: string | null;
  postcode: string | null;
}): string {
  return [parts.line1, parts.line2, [parts.suburb, parts.state, parts.postcode].filter(Boolean).join(" ")]
    .filter(Boolean)
    .join(", ");
}

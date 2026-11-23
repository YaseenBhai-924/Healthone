/**
 * Super Admin read-only request detail (task 6.2.3).
 * No status / reject / token controls. Retry refund when RefundFailed.
 */
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  ArrowLeft,
  CreditCard,
  ExternalLink,
  History,
  Truck,
  UserRound,
} from "lucide-react";
import { requireRole } from "@/lib/auth/guards";
import { getRequest } from "@/lib/api/admin-requests";
import {
  displayRequestStatus,
  formatAddress,
} from "@/lib/admin/request-labels";
import { formatDateTimeLong } from "@/lib/format/datetime";
import { formatMoney } from "@/lib/format/money";
import { RetryRefundButton } from "@/components/hq/retry-refund-button";
import { Alert } from "@/components/ui/alert";
import { Badge, PaymentStatusBadge } from "@/components/ui/badge";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";

function DetailRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-subtle py-2.5 last:border-0">
      <dt className="shrink-0 text-sm text-fg-muted">{label}</dt>
      <dd className="text-right text-sm font-semibold text-heading">{children}</dd>
    </div>
  );
}

export default async function HqRequestDetailPage({
  params,
}: {
  params: Promise<{ id: string; requestId: string }>;
}) {
  await requireRole("SuperAdmin");
  const { id: pharmacyId, requestId } = await params;

  if (
    !/^[0-9a-f-]{36}$/i.test(pharmacyId) ||
    !/^[0-9a-f-]{36}$/i.test(requestId)
  ) {
    notFound();
  }

  const result = await getRequest(requestId);
  if (result.status === "forbidden") redirect("/forbidden");
  if (result.status === "notFound") notFound();
  if (result.status !== "ok") {
    return (
      <Alert variant="danger" title="Could not load order">
        Refresh and try again.
      </Alert>
    );
  }

  const r = result.data;
  if (r.pharmacyId !== pharmacyId) notFound();

  const reference = r.reference ?? "—";
  const statusLabel = displayRequestStatus(r.status, r.fulfilmentType);
  const stripeUrl = r.payment?.stripePaymentIntentId
    ? `https://dashboard.stripe.com/test/payments/${r.payment.stripePaymentIntentId}`
    : null;

  return (
    <div className="flex flex-col gap-6">
      <Link
        href={`/hq/pharmacies/${pharmacyId}`}
        className="focus-ring inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-brand-700 hover:underline"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        {r.pharmacyName}
      </Link>

      <div className="rounded-card border border-brand-200 bg-brand-50/70 px-4 py-3 text-sm text-brand-900">
        Viewing as HealthOne · read-only · this view is audited
      </div>

      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-mono text-sm text-fg-muted">{reference}</p>
          <h1 className="mt-1 text-2xl font-bold text-heading">{statusLabel}</h1>
        </div>
        <Badge
          variant={
            r.status === "Rejected"
              ? "danger"
              : r.status === "ReadyOrDispatched"
                ? "success"
                : "info"
          }
        >
          {statusLabel}
        </Badge>
      </header>

      {r.paymentStatus === "RefundFailed" ? (
        <Alert variant="danger" title="Refund failed">
          <div className="mt-3 flex flex-wrap gap-2">
            <RetryRefundButton requestId={r.id} />
            {stripeUrl ? (
              <a
                href={stripeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="focus-ring inline-flex items-center gap-1.5 rounded-control border border-subtle bg-surface px-3 py-1.5 text-sm font-semibold text-fg-secondary hover:bg-surface-muted"
              >
                <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                Open in Stripe
              </a>
            ) : null}
          </div>
        </Alert>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle as="h2" className="flex items-center gap-2">
              <UserRound className="h-4 w-4" aria-hidden />
              Patient and fulfilment
            </CardTitle>
          </CardHeader>
          <CardBody>
            <dl>
              <DetailRow label="Name">{r.patient.name ?? "—"}</DetailRow>
              <DetailRow label="Fulfilment">
                <span className="inline-flex items-center gap-1.5">
                  <Truck className="h-3.5 w-3.5" aria-hidden />
                  {r.fulfilmentType}
                </span>
              </DetailRow>
              <DetailRow label="Received">
                {r.submittedAt ? formatDateTimeLong(r.submittedAt) : "—"}
              </DetailRow>
              <DetailRow label="Clinic">{r.clinicName}</DetailRow>
              <DetailRow label="eScript token">Hidden for HealthOne</DetailRow>
              {r.fulfilmentType === "Delivery" && r.address ? (
                <DetailRow label="Address">
                  {formatAddress(r.address) || "—"}
                </DetailRow>
              ) : null}
            </dl>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle as="h2" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" aria-hidden />
              Payment
            </CardTitle>
          </CardHeader>
          <CardBody>
            <dl>
              <DetailRow label="Status">
                <PaymentStatusBadge status={r.paymentStatus} />
              </DetailRow>
              <DetailRow label="Amount">
                {formatMoney(r.price.totalCents, r.price.currency)}
              </DetailRow>
              {r.payment?.refundFailureReason ? (
                <DetailRow label="Last error">
                  <span className="font-mono text-xs">
                    {r.payment.refundFailureReason}
                  </span>
                </DetailRow>
              ) : null}
            </dl>
          </CardBody>
        </Card>
      </div>

      {r.history.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle as="h2" className="flex items-center gap-2">
              <History className="h-4 w-4" aria-hidden />
              Activity
            </CardTitle>
          </CardHeader>
          <CardBody>
            <ul className="space-y-2 text-sm">
              {r.history.map((h, i) => (
                <li
                  key={`${h.at}-${i}`}
                  className="flex justify-between gap-3 border-b border-subtle py-2 last:border-0"
                >
                  <span className="text-fg-secondary">
                    {h.from} → {h.to}
                    {h.note ? ` · ${h.note}` : ""}
                  </span>
                  <span className="shrink-0 text-xs text-fg-muted">
                    {formatDateTimeLong(h.at)}
                  </span>
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>
      ) : null}
    </div>
  );
}

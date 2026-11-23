/**
 * Pharmacy request detail (task 4.3.2).
 * Token reveal / status / reject via server actions (task 4.3.3).
 */
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  ArrowLeft,
  CreditCard,
  FileKey2,
  History,
  Package,
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
import { Alert } from "@/components/ui/alert";
import { Badge, PaymentStatusBadge } from "@/components/ui/badge";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { TokenPanel } from "@/components/admin/token-panel";
import { ScriptPanel } from "@/components/admin/script-panel";
import { StatusActions } from "@/components/admin/status-actions";
import { InvoicePanel } from "@/components/admin/invoice-panel";

function DetailRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5 border-b border-subtle last:border-0">
      <dt className="text-sm text-fg-muted shrink-0">{label}</dt>
      <dd className="text-sm font-semibold text-heading text-right">
        {children}
      </dd>
    </div>
  );
}

function SectionTitle({
  icon: Icon,
  children,
}: {
  icon: typeof UserRound;
  children: React.ReactNode;
}) {
  return (
    <CardTitle as="h2" className="flex items-center gap-2 !text-lg font-bold">
      <span className="inline-flex h-8 w-8 items-center justify-center rounded-control bg-brand-50 text-brand-700">
        <Icon className="h-4 w-4" aria-hidden />
      </span>
      {children}
    </CardTitle>
  );
}

export default async function RequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole("PharmacyStaff");
  const { id } = await params;

  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
  ) {
    notFound();
  }

  const result = await getRequest(id);

  if (result.status === "forbidden") redirect("/forbidden");
  if (result.status === "notFound") notFound();

  // Avoid /auth/sign-in bounce loop when Auth.js session is still present.
  if (result.status !== "ok") {
    return (
      <div className="flex flex-col gap-4">
        <Link
          href="/admin"
          className="focus-ring inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-brand-700 hover:underline"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Order queue
        </Link>
        <Alert
          variant="danger"
          title={
            result.status === "unauthorized"
              ? "Session expired"
              : "Could not load order"
          }
        >
          {result.status === "unauthorized"
            ? "Your API session expired. Sign out from the sidebar, then sign in again."
            : "The API is unavailable right now. Refresh and try again."}
        </Alert>
      </div>
    );
  }

  const r = result.data;
  const reference = r.reference ?? "—";
  const statusLabel = displayRequestStatus(r.status, r.fulfilmentType);
  const FulfilmentIcon = r.fulfilmentType === "Delivery" ? Truck : Package;
  const statusVariant =
    r.status === "Rejected"
      ? "danger"
      : r.status === "ReadyOrDispatched"
        ? "success"
        : r.status === "InProgress"
          ? "warning"
          : r.status === "Completed"
            ? "neutral"
            : "info";

  return (
    <div className="flex flex-col gap-6">
      <div className="overflow-hidden rounded-hero border border-line bg-surface shadow-[var(--shadow-md)]">
        <div className="border-b border-line bg-gradient-to-r from-brand-50/90 to-surface px-5 py-4 sm:px-6">
          <Link
            href="/admin"
            className="focus-ring inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:underline"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Order queue
          </Link>
        </div>
        <div className="flex flex-wrap items-start justify-between gap-4 px-5 py-5 sm:px-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-brand-600">
              Reference
            </p>
            <h1 className="mt-1 font-mono text-2xl font-bold tracking-tight text-heading whitespace-nowrap tabular-nums sm:text-3xl">
              {reference}
            </h1>
            <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-ink-muted">
              <span className="inline-flex items-center gap-1.5 font-medium text-ink">
                <FulfilmentIcon className="h-3.5 w-3.5 text-brand-600" aria-hidden />
                {r.fulfilmentType}
              </span>
              <span aria-hidden className="text-fg-disabled">
                ·
              </span>
              <span>{r.clinicName}</span>
              <span aria-hidden className="text-fg-disabled">
                ·
              </span>
              <span>{r.pharmacyName}</span>
            </p>
          </div>
          <Badge variant={statusVariant} className="px-3 py-1 text-sm">
            {statusLabel}
          </Badge>
        </div>
      </div>

      {r.paymentStatus === "RefundFailed" ? (
        <Alert variant="danger" title="Refund failed">
          A HealthOne Super Admin must retry this refund from headquarters.
        </Alert>
      ) : null}

      {r.detailsRemoved ? (
        <Alert variant="warning" title="Details removed">
          Patient details for this order have been removed under the retention
          policy.
        </Alert>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-[1.45fr_1fr]">
        <div className="flex flex-col gap-5">
          <Card className="shadow-[var(--shadow-sm)]">
            <CardHeader>
              <SectionTitle icon={UserRound}>Patient and fulfilment</SectionTitle>
            </CardHeader>
            <CardBody>
              <dl>
                <DetailRow label="Name">{r.patient.name ?? "—"}</DetailRow>
                <DetailRow label="Mobile">{r.patient.mobile ?? "—"}</DetailRow>
                <DetailRow label="Email">{r.patient.email ?? "—"}</DetailRow>
                <DetailRow label="Fulfilment">{r.fulfilmentType}</DetailRow>
                {r.address ? (
                  <DetailRow label="Address">
                    {formatAddress(r.address)}
                  </DetailRow>
                ) : null}
                <DetailRow label="Received">
                  {formatDateTimeLong(r.submittedAt)}
                </DetailRow>
              </dl>
            </CardBody>
          </Card>

          <Card className="border-brand-200 bg-brand-50/40 shadow-[var(--shadow-sm)]">
            <CardHeader>
              <SectionTitle icon={FileKey2}>
                {r.scriptSource === "UploadedScript"
                  ? "Uploaded script"
                  : "eScript token"}
              </SectionTitle>
            </CardHeader>
            <CardBody>
              {r.scriptSource === "UploadedScript" ? (
                <ScriptPanel
                  requestId={r.id}
                  scriptAvailable={r.scriptAvailable}
                  fileName={r.script?.fileName}
                  contentType={r.script?.contentType}
                  sizeBytes={r.script?.sizeBytes}
                />
              ) : (
                <TokenPanel
                  requestId={r.id}
                  tokenAvailable={r.tokenAvailable}
                />
              )}
            </CardBody>
          </Card>

          {r.patientNotes ? (
            <Card className="shadow-[var(--shadow-sm)]">
              <CardHeader>
                <SectionTitle icon={UserRound}>Notes to pharmacy</SectionTitle>
              </CardHeader>
              <CardBody>
                <p className="whitespace-pre-wrap text-sm text-fg-secondary">
                  {r.patientNotes}
                </p>
              </CardBody>
            </Card>
          ) : null}

          <Card className="shadow-[var(--shadow-sm)]">
            <CardHeader>
              <SectionTitle icon={CreditCard}>Consent and payment</SectionTitle>
            </CardHeader>
            <CardBody>
              <dl>
                <DetailRow label="Consent">
                  {r.consent
                    ? `Accepted, terms ${r.consent.termsVersion}`
                    : "—"}
                </DetailRow>
                <DetailRow label="Payment">
                  <PaymentStatusBadge status={r.paymentStatus} />
                </DetailRow>
                <DetailRow label="Amount">
                  {r.invoiceLines?.length
                    ? formatMoney(r.price.totalCents, r.price.currency)
                    : "Invoice not issued yet"}
                  {r.invoiceLines?.length &&
                  r.fulfilmentType === "Delivery" &&
                  r.price.deliveryFeeCents > 0
                    ? ` incl. ${formatMoney(r.price.deliveryFeeCents, r.price.currency)} delivery`
                    : ""}
                </DetailRow>
                {r.rejection ? (
                  <>
                    <DetailRow label="Reject reason">
                      {r.rejection.reason ?? "—"}
                    </DetailRow>
                    {r.rejection.note ? (
                      <DetailRow label="Note">{r.rejection.note}</DetailRow>
                    ) : null}
                  </>
                ) : null}
              </dl>
            </CardBody>
          </Card>

          <Card className="shadow-[var(--shadow-sm)]">
            <CardHeader>
              <SectionTitle icon={CreditCard}>Pharmacy invoice</SectionTitle>
            </CardHeader>
            <CardBody>
              <InvoicePanel
                requestId={r.id}
                rowVersion={r.rowVersion}
                currency={r.price.currency}
                fulfilmentIsDelivery={r.fulfilmentType === "Delivery"}
                defaultDeliveryFeeCents={r.defaultDeliveryFeeCents ?? 0}
                existingLines={r.invoiceLines ?? []}
                canIssue={r.canIssueInvoice}
              />
            </CardBody>
          </Card>
        </div>

        <div className="flex flex-col gap-5 lg:sticky lg:top-6 lg:self-start">
          <Card className="shadow-[var(--shadow-md)]">
            <CardHeader>
              <CardTitle as="h2">Update status</CardTitle>
              <p className="mt-1 text-xs text-fg-muted">
                Dispensing starts automatically after the patient pays. Then use
                the next status step.
              </p>
            </CardHeader>
            <CardBody>
              <StatusActions
                requestId={r.id}
                reference={reference}
                fulfilmentType={r.fulfilmentType}
                allowedActions={r.allowedActions}
                rowVersion={r.rowVersion}
                amountCents={r.price.totalCents}
                currency={r.price.currency}
                paymentStatus={r.paymentStatus}
              />
            </CardBody>
          </Card>

          <Card className="shadow-[var(--shadow-sm)]">
            <CardHeader>
              <SectionTitle icon={History}>Activity</SectionTitle>
            </CardHeader>
            <CardBody>
              {r.history.length === 0 ? (
                <p className="text-sm text-fg-muted">No activity yet.</p>
              ) : (
                <ol className="relative flex flex-col gap-0 border-l-2 border-brand-100 pl-4">
                  {[...r.history].reverse().map((h, i) => (
                    <li key={`${h.at}-${i}`} className="relative pb-4 last:pb-0">
                      <span
                        className="absolute top-1.5 -left-[1.3rem] h-2.5 w-2.5 rounded-full border-2 border-surface bg-brand-600"
                        aria-hidden
                      />
                      <p className="text-sm font-semibold text-heading">
                        {displayRequestStatus(h.from, r.fulfilmentType)} →{" "}
                        {displayRequestStatus(h.to, r.fulfilmentType)}
                      </p>
                      <p className="mt-0.5 text-xs text-fg-muted">
                        {h.actorType} · {formatDateTimeLong(h.at)}
                        {h.note ? ` · ${h.note}` : ""}
                      </p>
                    </li>
                  ))}
                </ol>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}

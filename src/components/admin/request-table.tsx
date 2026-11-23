import Link from "next/link";
import {
  ChevronRight,
  Inbox,
  MoreHorizontal,
  Package,
  Truck,
} from "lucide-react";
import {
  Badge,
  PaymentStatusBadge,
  RequestStatusBadge,
  type RequestStatus,
} from "@/components/ui/badge";
import type { RequestListItem } from "@/lib/api/admin-types";
import { displayRequestStatus } from "@/lib/admin/request-labels";
import { formatDateTime } from "@/lib/format/datetime";
import { formatMoney } from "@/lib/format/money";
import { cn } from "@/lib/cn";

function statusVariant(status: RequestStatus) {
  const map = {
    Draft: "neutral",
    PaymentPending: "warning",
    Submitted: "info",
    InProgress: "warning",
    ReadyOrDispatched: "success",
    Completed: "neutral",
    Rejected: "danger",
  } as const;
  return map[status];
}

function patientInitials(name: string | null): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0]}${parts[parts.length - 1]![0]}`.toUpperCase();
}

export function RequestTable({
  items,
  detailHref,
}: {
  items: RequestListItem[];
  /** Defaults to pharmacy admin detail path. */
  detailHref?: (id: string) => string;
}) {
  const hrefFor = detailHref ?? ((id: string) => `/admin/requests/${id}`);
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center px-6 py-16 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-card bg-surface-muted text-fg-muted">
          <Inbox className="h-7 w-7" aria-hidden />
        </div>
        <p className="mt-4 text-base font-semibold text-heading">
          No orders in this view
        </p>
        <p className="mt-1 max-w-sm text-sm text-fg-muted">
          Try another status card, or clear the reference search.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[52rem] text-left text-sm">
        <thead>
          <tr className="border-b border-subtle">
            {[
              "Reference",
              "Patient",
              "Fulfilment",
              "Received",
              "Payment",
              "Status",
              "Amount",
              "",
            ].map((label) => (
              <th
                key={label || "actions"}
                className={cn(
                  "px-4 py-3 text-xs font-semibold uppercase tracking-wide text-fg-muted",
                  label === "Amount" && "text-right",
                  !label && "w-12",
                )}
              >
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
            const label = displayRequestStatus(item.status, item.fulfilmentType);
            const useCustomLabel = item.status === "ReadyOrDispatched";
            const FulfilmentIcon =
              item.fulfilmentType === "Delivery" ? Truck : Package;

            return (
              <tr
                key={item.id}
                className="group border-b border-subtle last:border-0 transition-colors duration-[150ms] hover:bg-surface-muted/60"
              >
                <td className="px-4 py-3.5">
                  <Link
                    href={hrefFor(item.id)}
                    className="focus-ring font-mono text-sm font-bold tracking-wide text-brand-800"
                  >
                    {item.reference}
                  </Link>
                </td>
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-800"
                      aria-hidden
                    >
                      {patientInitials(item.patientName)}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-heading">
                        {item.patientName ?? "—"}
                      </p>
                      <p className="truncate text-xs text-fg-muted">
                        {item.clinicName}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3.5">
                  <span className="inline-flex items-center gap-1.5 rounded-badge bg-surface-muted px-2.5 py-1 text-xs font-semibold text-fg-secondary">
                    <FulfilmentIcon
                      className="h-3.5 w-3.5 text-brand-600"
                      aria-hidden
                    />
                    {item.fulfilmentType}
                  </span>
                </td>
                <td className="px-4 py-3.5 whitespace-nowrap text-fg-secondary">
                  {formatDateTime(item.submittedAt)}
                </td>
                <td className="px-4 py-3.5">
                  <PaymentStatusBadge status={item.paymentStatus} />
                </td>
                <td className="px-4 py-3.5">
                  {useCustomLabel ? (
                    <Badge variant={statusVariant(item.status)}>{label}</Badge>
                  ) : (
                    <RequestStatusBadge status={item.status} />
                  )}
                </td>
                <td className="px-4 py-3.5 text-right font-bold tabular-nums text-heading">
                  {formatMoney(item.totalCents, item.currency)}
                </td>
                <td className="px-3 py-3.5">
                  <Link
                    href={hrefFor(item.id)}
                    className="focus-ring inline-flex h-8 w-8 items-center justify-center rounded-control text-fg-muted transition-colors hover:bg-brand-50 hover:text-brand-800"
                    aria-label={`Open ${item.reference}`}
                  >
                    <ChevronRight className="h-4 w-4" aria-hidden />
                    <MoreHorizontal className="sr-only" />
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function RequestPagination({
  page,
  pageSize,
  totalCount,
  status,
  search,
  basePath = "/admin",
}: {
  page: number;
  pageSize: number;
  totalCount: number;
  status?: string | null;
  search?: string;
  basePath?: string;
}) {
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  function hrefFor(p: number) {
    const params = new URLSearchParams();
    if (status && status !== "all") params.set("status", status);
    if (search) params.set("search", search);
    if (p > 1) params.set("page", String(p));
    const qs = params.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  }

  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1).slice(
    Math.max(0, page - 3),
    Math.max(0, page - 3) + 5,
  );

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-subtle px-4 py-3.5">
      <p className="text-xs font-medium text-fg-muted">
        {totalCount === 0
          ? "No results"
          : `Showing ${(page - 1) * pageSize + 1}–${Math.min(page * pageSize, totalCount)} of ${totalCount}`}
      </p>
      {totalPages > 1 ? (
        <div className="flex items-center gap-1.5">
          {page > 1 ? (
            <Link
              href={hrefFor(page - 1)}
              className="focus-ring rounded-badge border border-subtle bg-surface px-3 py-1.5 text-xs font-semibold text-fg-secondary hover:bg-brand-50"
            >
              Prev
            </Link>
          ) : null}
          {pageNumbers.map((n) => (
            <Link
              key={n}
              href={hrefFor(n)}
              className={cn(
                "focus-ring flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-colors",
                n === page
                  ? "bg-brand-800 text-white"
                  : "text-fg-secondary hover:bg-brand-50",
              )}
              aria-current={n === page ? "page" : undefined}
            >
              {n}
            </Link>
          ))}
          {page < totalPages ? (
            <Link
              href={hrefFor(page + 1)}
              className="focus-ring rounded-badge border border-subtle bg-surface px-3 py-1.5 text-xs font-semibold text-fg-secondary hover:bg-brand-50"
            >
              Next
            </Link>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

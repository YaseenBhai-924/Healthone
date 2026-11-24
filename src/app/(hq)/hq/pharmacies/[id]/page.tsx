/**
 * Super Admin read-only pharmacy orders (task 6.2.3).
 */
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Eye } from "lucide-react";
import { requireRole } from "@/lib/auth/guards";
import { getPharmacy } from "@/lib/api/hq-pharmacies";
import { listRequests } from "@/lib/api/admin-requests";
import type { PagedRequests } from "@/lib/api/admin-types";
import { parseQueueFilter } from "@/lib/admin/request-labels";
import { formatMoney } from "@/lib/format/money";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button-variants";
import { Card } from "@/components/ui/card";
import {
  RequestPagination,
  RequestTable,
} from "@/components/admin/request-table";
import { cn } from "@/lib/cn";

export default async function HqPharmacyOrdersPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ status?: string; search?: string; page?: string }>;
}) {
  await requireRole("SuperAdmin");
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();

  const query = await searchParams;
  const statusFilter = parseQueueFilter(query.status);
  const search = query.search?.trim() || undefined;
  const page = Math.max(1, Number.parseInt(query.page ?? "1", 10) || 1);

  const pharmacyResult = await getPharmacy(id);
  if (pharmacyResult.status === "forbidden") redirect("/forbidden");
  if (pharmacyResult.status === "notFound") notFound();
  if (pharmacyResult.status !== "ok") {
    return (
      <Alert variant="danger" title="Could not load pharmacy">
        Refresh and try again.
      </Alert>
    );
  }

  const pharmacy = pharmacyResult.data;
  let ordersUnavailable = true;
  let data: PagedRequests = {
    items: [],
    page: 1,
    pageSize: 20,
    totalCount: 0,
    statusCounts: {},
  };

  try {
    const ordersResult = await listRequests({
      pharmacyId: id,
      status: statusFilter,
      search,
      page,
    });
    if (ordersResult.status === "forbidden") redirect("/forbidden");
    if (ordersResult.status === "ok") {
      ordersUnavailable = false;
      data = ordersResult.data;
    }
  } catch {
    ordersUnavailable = true;
  }
  const basePath = `/hq/pharmacies/${id}`;

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/hq/pharmacies"
        className="focus-ring inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-brand-700 hover:underline"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Pharmacies
      </Link>

      <div className="rounded-card border border-brand-200 bg-brand-50/70 px-4 py-3 text-sm text-brand-900">
        <p className="flex items-center gap-2 font-semibold">
          <Eye className="h-4 w-4" aria-hidden />
          Viewing as HealthOne
        </p>
        <p className="mt-1 text-brand-800/90">
          Read-only. You cannot update status, reject, or reveal eScript tokens.
          Failed refunds can be retried from the order detail.
        </p>
      </div>

      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-heading">
              {pharmacy.name}
            </h1>
            <Badge variant={pharmacy.isActive ? "success" : "neutral"}>
              {pharmacy.isActive ? "Active" : "Inactive"}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-fg-muted">
            {pharmacy.orders} orders · {formatMoney(pharmacy.grossCents)} gross
            {pharmacy.newRequests > 0
              ? ` · ${pharmacy.newRequests} awaiting`
              : ""}
          </p>
          {pharmacy.address ? (
            <p className="mt-2 text-sm text-ink">
              {[
                pharmacy.address.line1,
                pharmacy.address.line2,
                `${pharmacy.address.suburb} ${pharmacy.address.state} ${pharmacy.address.postcode}`,
              ]
                .filter(Boolean)
                .join(", ")}
            </p>
          ) : null}
        </div>
        <Link
          href={`/hq/pharmacies/${id}/edit`}
          className={cn(buttonVariants({ variant: "secondary", size: "sm" }))}
        >
          Edit pharmacy
        </Link>
      </header>

      {ordersUnavailable ? (
        <Alert variant="warning" title="Orders unavailable">
          Order history needs the API. Pharmacy details and address above still
          work in static demo mode.
        </Alert>
      ) : (
        <Card className="overflow-hidden p-0">
          <div className="border-b border-subtle px-5 py-4">
            <p className="font-bold text-heading">Orders</p>
            <p className="mt-0.5 text-xs text-fg-muted">
              Open a row for read-only detail
            </p>
          </div>
          <RequestTable
            items={data.items}
            detailHref={(requestId) =>
              `/hq/pharmacies/${id}/requests/${requestId}`
            }
          />
          <RequestPagination
            page={data.page}
            pageSize={data.pageSize}
            totalCount={data.totalCount}
            status={query.status}
            search={search}
            basePath={basePath}
          />
        </Card>
      )}
    </div>
  );
}

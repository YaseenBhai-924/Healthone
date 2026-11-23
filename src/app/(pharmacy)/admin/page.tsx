/**
 * Pharmacy request queue (task 4.3.1).
 * Filters, search, table, pagination — data via server apiFetch (4.3.3).
 */
import Link from "next/link";
import { redirect } from "next/navigation";
import { X } from "lucide-react";
import { requireRole } from "@/lib/auth/guards";
import { listRequests } from "@/lib/api/admin-requests";
import { parseQueueFilter, QUEUE_FILTERS } from "@/lib/admin/request-labels";
import { Alert } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";
import { QueueWelcomeBanner } from "@/components/admin/queue-welcome-banner";
import { StatusFilterChips } from "@/components/admin/status-filter-chips";
import { QueueFilterDropdown } from "@/components/admin/queue-filter-dropdown";
import { RequestSearch } from "@/components/admin/request-search";
import {
  RequestPagination,
  RequestTable,
} from "@/components/admin/request-table";

export default async function PharmacyAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; search?: string; page?: string }>;
}) {
  const user = await requireRole("PharmacyStaff");
  const params = await searchParams;
  const statusFilter = parseQueueFilter(params.status);
  const search = params.search?.trim() || undefined;
  const page = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);
  const activeKey = statusFilter ?? "all";
  const activeFilter = QUEUE_FILTERS.find((f) => f.key === activeKey);

  const result = await listRequests({
    status: statusFilter,
    search,
    page,
  });

  if (result.status === "forbidden") redirect("/forbidden");

  if (result.status !== "ok") {
    return (
      <div className="flex flex-col gap-6">
        <header>
          <h1 className="font-display text-2xl font-extrabold tracking-tight text-heading sm:text-3xl">
            Order queue
          </h1>
        </header>
        <Alert
          variant="danger"
          title={
            result.status === "unauthorized"
              ? "Session expired"
              : "Could not load orders"
          }
        >
          {result.status === "unauthorized"
            ? "Your API session expired. Sign out, then sign in again."
            : "The API is unavailable right now. Check that the API is running, then refresh this page."}
        </Alert>
      </div>
    );
  }

  const data = result.data;
  const pharmacyName = user.pharmacyName ?? data.items[0]?.pharmacyName;
  const clearParams = new URLSearchParams();
  if (activeKey !== "all") clearParams.set("status", activeKey);
  const clearSearchHref = clearParams.size
    ? `/admin?${clearParams}`
    : "/admin";
  const newCount = data.statusCounts.Submitted ?? 0;
  const inProgressCount = data.statusCounts.InProgress ?? 0;
  const queueTotal = Object.values(data.statusCounts).reduce(
    (sum, n) => sum + n,
    0,
  );

  return (
    <div className="flex flex-col gap-6">
      <QueueWelcomeBanner
        userName={user.name ?? "Staff user"}
        pharmacyName={pharmacyName}
        newCount={newCount}
        inProgressCount={inProgressCount}
        totalCount={queueTotal}
      />

      <StatusFilterChips
        activeKey={activeKey}
        statusCounts={data.statusCounts}
        search={search}
      />

      <Card className="overflow-hidden rounded-hero border-line p-0 shadow-[var(--shadow-md)]">
        <div className="flex flex-col gap-3 border-b border-line bg-surface px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-display text-base font-bold text-heading">
              Orders
            </p>
            <p className="mt-0.5 text-xs text-ink-muted">
              Showing{" "}
              <span className="font-semibold text-ink">
                {activeFilter?.label ?? "All"}
              </span>
              {" · "}
              open a row to manage the order
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="min-w-[12rem] flex-1 md:hidden">
              <RequestSearch
                defaultValue={search}
                status={params.status}
                compact
                id="list-request-search"
              />
            </div>
            <QueueFilterDropdown
              activeKey={activeKey}
              statusCounts={data.statusCounts}
              search={search}
            />
          </div>
        </div>

        {search ? (
          <div className="border-b border-line bg-brand-50/50 px-5 py-2.5">
            <span className="inline-flex items-center gap-2 rounded-badge border border-brand-200 bg-surface px-2.5 py-1 text-xs font-semibold text-brand-800">
              Search: {search}
              <Link
                href={clearSearchHref}
                className="focus-ring inline-flex rounded-full p-0.5 hover:bg-brand-100"
                aria-label="Clear search"
              >
                <X className="h-3.5 w-3.5" aria-hidden />
              </Link>
            </span>
          </div>
        ) : null}

        {data.items.some((i) => i.paymentStatus === "RefundFailed") ? (
          <div className="px-5 pt-4">
            <Alert variant="warning" title="Refund failed">
              One or more rows show a failed refund. A HealthOne Super Admin must
              retry those from headquarters.
            </Alert>
          </div>
        ) : null}

        <RequestTable items={data.items} />
        <RequestPagination
          page={data.page}
          pageSize={data.pageSize}
          totalCount={data.totalCount}
          status={params.status}
          search={search}
        />
      </Card>
    </div>
  );
}

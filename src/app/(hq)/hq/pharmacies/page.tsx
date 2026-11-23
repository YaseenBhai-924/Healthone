/**
 * Super Admin pharmacies list (tasks 6.2.3 / 6.2.4).
 */
import Link from "next/link";
import { redirect } from "next/navigation";
import { Building2, Plus } from "lucide-react";
import { requireRole } from "@/lib/auth/guards";
import { listPharmacies } from "@/lib/api/hq-pharmacies";
import { formatMoney } from "@/lib/format/money";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button-variants";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/cn";

export default async function HqPharmaciesPage() {
  await requireRole("SuperAdmin");
  const result = await listPharmacies();

  if (result.status === "forbidden") redirect("/forbidden");
  if (result.status === "unauthorized") {
    return (
      <Alert variant="danger" title="Session expired">
        Sign out, then sign in again.
      </Alert>
    );
  }
  if (result.status !== "ok") {
    return (
      <Alert variant="warning" title="Could not load pharmacies">
        The API is unavailable. Refresh and try again.
      </Alert>
    );
  }

  const pharmacies = result.data;

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight text-heading sm:text-3xl">
            Pharmacies
          </h1>
          <p className="mt-1 text-sm text-ink-muted">
            Network pharmacies, Entra groups, and alert recipients.
          </p>
        </div>
        <Link
          href="/hq/pharmacies/new"
          className={cn(buttonVariants({ size: "sm" }), "gap-1.5")}
        >
          <Plus className="h-4 w-4" aria-hidden />
          Add pharmacy
        </Link>
      </header>

      <Card className="overflow-hidden border-line p-0 shadow-[var(--shadow-md)]">
        {pharmacies.length === 0 ? (
          <div className="flex flex-col items-center px-6 py-16 text-center">
            <Building2 className="h-8 w-8 text-fg-muted" aria-hidden />
            <p className="mt-3 font-semibold text-heading">No pharmacies yet</p>
            <p className="mt-1 text-sm text-fg-muted">
              Create the first pharmacy to attach clinics and staff groups.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[40rem] text-left text-sm">
              <thead>
                <tr className="border-b border-subtle">
                  {["Pharmacy", "Orders", "Gross", "New", "Status", ""].map(
                    (label) => (
                      <th
                        key={label || "open"}
                        className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-fg-muted"
                      >
                        {label}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {pharmacies.map((p) => (
                  <tr
                    key={p.id}
                    className="border-b border-subtle last:border-0 hover:bg-surface-muted/50"
                  >
                    <td className="px-4 py-3.5">
                      <Link
                        href={`/hq/pharmacies/${p.id}`}
                        className="focus-ring font-semibold text-brand-800 hover:underline"
                      >
                        {p.name}
                      </Link>
                      <p className="mt-0.5 font-mono text-[11px] text-fg-muted">
                        {p.entraGroupId}
                      </p>
                    </td>
                    <td className="px-4 py-3.5 tabular-nums">{p.orders}</td>
                    <td className="px-4 py-3.5 tabular-nums">
                      {formatMoney(p.grossCents)}
                    </td>
                    <td className="px-4 py-3.5">
                      {p.newRequests > 0 ? (
                        <Badge variant="info">{p.newRequests} new</Badge>
                      ) : (
                        <span className="text-fg-muted">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <Badge variant={p.isActive ? "success" : "neutral"}>
                        {p.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <Link
                        href={`/hq/pharmacies/${p.id}/edit`}
                        className={cn(
                          buttonVariants({ variant: "secondary", size: "sm" }),
                        )}
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

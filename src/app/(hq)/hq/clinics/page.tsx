/**
 * Super Admin clinics list + QR download (task 5.3.3).
 */
import Link from "next/link";
import { redirect } from "next/navigation";
import { Hospital, Plus } from "lucide-react";
import { requireRole } from "@/lib/auth/guards";
import { listClinics, listPricingItems } from "@/lib/api/hq-clinics";
import { formatMoney } from "@/lib/format/money";
import { ClinicQrButton } from "@/components/hq/clinic-qr-button";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button-variants";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/cn";

export default async function HqClinicsPage() {
  await requireRole("SuperAdmin");

  const [clinicsResult, pricingResult] = await Promise.all([
    listClinics(),
    listPricingItems(),
  ]);

  if (
    clinicsResult.status === "forbidden" ||
    pricingResult.status === "forbidden"
  ) {
    redirect("/forbidden");
  }
  if (
    clinicsResult.status === "unauthorized" ||
    pricingResult.status === "unauthorized"
  ) {
    return (
      <Alert variant="danger" title="Session expired">
        Sign out, then sign in again.
      </Alert>
    );
  }
  if (clinicsResult.status !== "ok" || pricingResult.status !== "ok") {
    return (
      <Alert variant="warning" title="Could not load clinics">
        The API is unavailable. Refresh and try again.
      </Alert>
    );
  }

  const clinics = clinicsResult.data;
  const priceById = new Map(pricingResult.data.map((p) => [p.id, p]));

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight text-heading sm:text-3xl">
            Clinics and QR codes
          </h1>
          <p className="mt-1 text-sm text-ink-muted">
            Landing pages, pricing, and printable clinic QR codes.
          </p>
        </div>
        <Link
          href="/hq/clinics/new"
          className={cn(buttonVariants({ size: "sm" }), "gap-1.5")}
        >
          <Plus className="h-4 w-4" aria-hidden />
          Add clinic
        </Link>
      </header>

      <Card className="overflow-hidden border-line p-0 shadow-[var(--shadow-md)]">
        {clinics.length === 0 ? (
          <div className="flex flex-col items-center px-6 py-16 text-center">
            <Hospital className="h-8 w-8 text-fg-muted" aria-hidden />
            <p className="mt-3 font-semibold text-heading">No clinics yet</p>
            <p className="mt-1 text-sm text-fg-muted">
              Add a clinic linked to a pharmacy and price item.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[48rem] text-left text-sm">
              <thead>
                <tr className="border-b border-subtle">
                  {[
                    "Clinic",
                    "Slug",
                    "Pharmacy",
                    "Price",
                    "Status",
                    "",
                  ].map((label) => (
                    <th
                      key={label || "actions"}
                      className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-fg-muted"
                    >
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {clinics.map((c) => {
                  const price = priceById.get(c.pricingItemId);
                  return (
                    <tr
                      key={c.id}
                      className="border-b border-subtle last:border-0 hover:bg-surface-muted/50"
                    >
                      <td className="px-4 py-3.5">
                        <Link
                          href={`/hq/clinics/${c.id}`}
                          className="focus-ring font-semibold text-brand-800 hover:underline"
                        >
                          {c.name}
                        </Link>
                      </td>
                      <td className="px-4 py-3.5 font-mono text-xs text-fg-secondary">
                        <Link
                          href={`/hq/clinics/${c.id}`}
                          className="focus-ring hover:underline"
                        >
                          {c.slug}
                        </Link>
                      </td>
                      <td className="px-4 py-3.5 text-fg-secondary">
                        {c.pharmacyName}
                      </td>
                      <td className="px-4 py-3.5 tabular-nums">
                        {price
                          ? formatMoney(price.priceCents, price.currency)
                          : "—"}
                      </td>
                      <td className="px-4 py-3.5">
                        <Badge variant={c.isActive ? "success" : "neutral"}>
                          {c.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex flex-wrap items-center justify-end gap-2">
                          <ClinicQrButton
                            clinicId={c.id}
                            clinicName={c.name}
                          />
                          <Link
                            href={`/hq/clinics/${c.id}/edit`}
                            className={cn(
                              buttonVariants({ variant: "secondary", size: "sm" }),
                            )}
                          >
                            Edit
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

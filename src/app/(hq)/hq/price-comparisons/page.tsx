import Link from "next/link";
import { Plus } from "lucide-react";
import { requireRole } from "@/lib/auth/guards";
import { listPriceComparisons } from "@/lib/api/hq-price-comparisons";
import { formatMoney } from "@/lib/format/money";
import { DeleteComparisonButton } from "@/components/hq/delete-comparison-button";
import { PriceComparisonCsvTools } from "@/components/hq/price-comparison-csv";
import { Alert } from "@/components/ui/alert";
import { buttonVariants } from "@/components/ui/button-variants";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/cn";

export default async function HqPriceComparisonsPage() {
  await requireRole("SuperAdmin");
  const result = await listPriceComparisons();

  if (result.status !== "ok") {
    return (
      <Alert variant="warning" title="Could not load comparisons">
        Refresh and try again.
      </Alert>
    );
  }

  const comparisons = result.data;

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight text-heading sm:text-3xl">
            Price comparisons
          </h1>
          <p className="mt-1 text-sm text-ink-muted">
            Partner medicine prices vs retail competitors (AUD cents). Featured
            patient UI uses the lowest partner price with competitors.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <PriceComparisonCsvTools />
          <Link
            href="/hq/price-comparisons/new"
            className={cn(buttonVariants({ size: "sm" }), "gap-1.5")}
          >
            <Plus className="h-4 w-4" aria-hidden />
            Add comparison
          </Link>
        </div>
      </header>

      <Card className="overflow-hidden border-line p-0 shadow-[var(--shadow-md)]">
        {comparisons.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <p className="font-semibold text-heading">No comparisons yet</p>
            <p className="mt-1 text-sm text-fg-muted">
              Create one or import a CSV to power the homepage featured price.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[44rem] text-left text-sm">
              <thead>
                <tr className="border-b border-subtle">
                  {[
                    "Medicine",
                    "Partner",
                    "Our price",
                    "Competitors",
                    "Updated",
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
                {comparisons.map((c) => (
                  <tr
                    key={c.id}
                    className="border-b border-subtle last:border-0 hover:bg-surface-muted/50"
                  >
                    <td className="px-4 py-3.5 font-semibold text-heading">
                      {c.medicineName}
                    </td>
                    <td className="px-4 py-3.5">{c.partnerPharmacyName}</td>
                    <td className="px-4 py-3.5 tabular-nums">
                      {formatMoney(c.ourPriceCents)}
                    </td>
                    <td className="px-4 py-3.5 text-fg-muted">
                      {c.competitors.length}
                    </td>
                    <td className="px-4 py-3.5 text-xs text-fg-muted">
                      {new Date(c.updatedAt).toLocaleString("en-AU", {
                        timeZone: "UTC",
                      })}{" "}
                      UTC
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/hq/price-comparisons/${c.id}/edit`}
                          className={cn(
                            buttonVariants({
                              variant: "secondary",
                              size: "sm",
                            }),
                          )}
                        >
                          Edit
                        </Link>
                        <DeleteComparisonButton id={c.id} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <p className="text-xs text-ink-muted">
        CSV columns: MedicineName,OurPriceCents,PartnerPharmacyName,CompetitorPharmacyName,CompetitorPriceCents,Notes
      </p>
    </div>
  );
}

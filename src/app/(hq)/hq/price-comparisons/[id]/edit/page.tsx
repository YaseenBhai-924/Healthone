import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireRole } from "@/lib/auth/guards";
import { listPharmacies } from "@/lib/api/hq-pharmacies";
import { getPriceComparison } from "@/lib/api/hq-price-comparisons";
import { PriceComparisonForm } from "@/components/hq/price-comparison-form";
import { Alert } from "@/components/ui/alert";

export default async function EditPriceComparisonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole("SuperAdmin");
  const { id } = await params;

  const [comparisonResult, pharmaciesResult] = await Promise.all([
    getPriceComparison(id),
    listPharmacies(),
  ]);

  if (comparisonResult.status === "notFound") notFound();
  if (comparisonResult.status !== "ok" || pharmaciesResult.status !== "ok") {
    return (
      <Alert variant="warning" title="Could not load comparison">
        Refresh and try again.
      </Alert>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/hq/price-comparisons"
        className="focus-ring inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-brand-700 hover:underline"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Price comparisons
      </Link>
      <div>
        <h1 className="font-display text-2xl font-extrabold text-heading">
          Edit price comparison
        </h1>
        <p className="mt-1 text-sm text-ink-muted">
          {comparisonResult.data.medicineName}
        </p>
      </div>
      <PriceComparisonForm
        comparison={comparisonResult.data}
        pharmacies={pharmaciesResult.data}
      />
    </div>
  );
}

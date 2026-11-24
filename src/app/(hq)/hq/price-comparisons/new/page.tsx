import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireRole } from "@/lib/auth/guards";
import { listPharmacies } from "@/lib/api/hq-pharmacies";
import { PriceComparisonForm } from "@/components/hq/price-comparison-form";
import { Alert } from "@/components/ui/alert";

export default async function NewPriceComparisonPage() {
  await requireRole("SuperAdmin");
  const pharmacies = await listPharmacies();

  if (pharmacies.status !== "ok") {
    return (
      <Alert variant="warning" title="Could not load pharmacies">
        Partner pharmacies are required to create a comparison.
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
          New price comparison
        </h1>
        <p className="mt-1 text-sm text-ink-muted">
          Link a medicine to a real partner pharmacy and competitor retail rates.
        </p>
      </div>
      <PriceComparisonForm pharmacies={pharmacies.data} />
    </div>
  );
}

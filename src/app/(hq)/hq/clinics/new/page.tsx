import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireRole } from "@/lib/auth/guards";
import { listPharmacies } from "@/lib/api/hq-pharmacies";
import { listPricingItems } from "@/lib/api/hq-clinics";
import { ClinicForm } from "@/components/hq/clinic-form";
import { Alert } from "@/components/ui/alert";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";

export default async function NewClinicPage() {
  await requireRole("SuperAdmin");

  const [pharmaciesResult, pricingResult] = await Promise.all([
    listPharmacies(),
    listPricingItems(),
  ]);

  if (
    pharmaciesResult.status === "forbidden" ||
    pricingResult.status === "forbidden"
  ) {
    redirect("/forbidden");
  }
  if (pharmaciesResult.status !== "ok" || pricingResult.status !== "ok") {
    return (
      <Alert variant="warning" title="Could not load form data">
        Pharmacies or pricing items are unavailable. Refresh and try again.
      </Alert>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/hq/clinics"
        className="focus-ring inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-brand-700 hover:underline"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Clinics
      </Link>
      <Card>
        <CardHeader>
          <CardTitle as="h1">Add clinic</CardTitle>
        </CardHeader>
        <CardBody>
          <ClinicForm
            pharmacies={pharmaciesResult.data}
            pricingItems={pricingResult.data}
          />
        </CardBody>
      </Card>
    </div>
  );
}

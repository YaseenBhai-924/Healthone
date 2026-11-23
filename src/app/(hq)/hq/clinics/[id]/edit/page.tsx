import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireRole } from "@/lib/auth/guards";
import { listPharmacies } from "@/lib/api/hq-pharmacies";
import { listClinics, listPricingItems } from "@/lib/api/hq-clinics";
import { ClinicForm } from "@/components/hq/clinic-form";
import { DeactivateButton } from "@/components/hq/deactivate-button";
import { Alert } from "@/components/ui/alert";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";

export default async function EditClinicPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole("SuperAdmin");
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();

  const [clinicsResult, pharmaciesResult, pricingResult] = await Promise.all([
    listClinics(),
    listPharmacies(),
    listPricingItems(),
  ]);

  if (
    clinicsResult.status === "forbidden" ||
    pharmaciesResult.status === "forbidden" ||
    pricingResult.status === "forbidden"
  ) {
    redirect("/forbidden");
  }
  if (
    clinicsResult.status !== "ok" ||
    pharmaciesResult.status !== "ok" ||
    pricingResult.status !== "ok"
  ) {
    return (
      <Alert variant="danger" title="Could not load clinic">
        Refresh and try again.
      </Alert>
    );
  }

  const clinic = clinicsResult.data.find((c) => c.id === id);
  if (!clinic) notFound();

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
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <CardTitle as="h1">Edit clinic</CardTitle>
          {clinic.isActive ? (
            <DeactivateButton
              kind="clinic"
              id={id}
              label="Deactivate"
              confirmMessage={`Deactivate ${clinic.name}? Patients will see ordering paused.`}
              redirectTo="/hq/clinics"
            />
          ) : null}
        </CardHeader>
        <CardBody>
          <ClinicForm
            clinic={clinic}
            pharmacies={pharmaciesResult.data}
            pricingItems={pricingResult.data}
          />
        </CardBody>
      </Card>
    </div>
  );
}

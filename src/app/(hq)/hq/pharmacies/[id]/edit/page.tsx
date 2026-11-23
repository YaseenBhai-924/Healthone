import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireRole } from "@/lib/auth/guards";
import { getPharmacy } from "@/lib/api/hq-pharmacies";
import { PharmacyForm } from "@/components/hq/pharmacy-form";
import { DeactivateButton } from "@/components/hq/deactivate-button";
import { Alert } from "@/components/ui/alert";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";

export default async function EditPharmacyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole("SuperAdmin");
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();

  const result = await getPharmacy(id);
  if (result.status === "forbidden") redirect("/forbidden");
  if (result.status === "notFound") notFound();
  if (result.status !== "ok") {
    return (
      <Alert variant="danger" title="Could not load pharmacy">
        Refresh and try again.
      </Alert>
    );
  }

  const pharmacy = result.data;

  return (
    <div className="flex flex-col gap-6">
      <Link
        href={`/hq/pharmacies/${id}`}
        className="focus-ring inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-brand-700 hover:underline"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        {pharmacy.name}
      </Link>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <CardTitle as="h1">Edit pharmacy</CardTitle>
          {pharmacy.isActive ? (
            <DeactivateButton
              kind="pharmacy"
              id={id}
              label="Deactivate"
              confirmMessage={`Deactivate ${pharmacy.name}? Staff will no longer receive new clinic orders through this pharmacy.`}
              redirectTo="/hq/pharmacies"
            />
          ) : null}
        </CardHeader>
        <CardBody>
          <PharmacyForm pharmacy={pharmacy} />
        </CardBody>
      </Card>
    </div>
  );
}

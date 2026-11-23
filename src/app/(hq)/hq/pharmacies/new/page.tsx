import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireRole } from "@/lib/auth/guards";
import { PharmacyForm } from "@/components/hq/pharmacy-form";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";

export default async function NewPharmacyPage() {
  await requireRole("SuperAdmin");

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/hq/pharmacies"
        className="focus-ring inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-brand-700 hover:underline"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Pharmacies
      </Link>
      <Card>
        <CardHeader>
          <CardTitle as="h1">Add pharmacy</CardTitle>
        </CardHeader>
        <CardBody>
          <PharmacyForm />
        </CardBody>
      </Card>
    </div>
  );
}

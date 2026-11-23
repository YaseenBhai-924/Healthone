/**
 * Super Admin clinic detail — open a clinic separately from the list.
 */
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, ExternalLink, Hospital } from "lucide-react";
import { requireRole } from "@/lib/auth/guards";
import { listClinics, listPricingItems } from "@/lib/api/hq-clinics";
import { formatMoney } from "@/lib/format/money";
import { ClinicQrButton } from "@/components/hq/clinic-qr-button";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button-variants";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/cn";

function DetailRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-subtle py-2.5 last:border-0">
      <dt className="shrink-0 text-sm text-fg-muted">{label}</dt>
      <dd className="text-right text-sm font-semibold text-heading">{children}</dd>
    </div>
  );
}

export default async function HqClinicDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole("SuperAdmin");
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();

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
  if (clinicsResult.status !== "ok" || pricingResult.status !== "ok") {
    return (
      <Alert variant="danger" title="Could not load clinic">
        Refresh and try again.
      </Alert>
    );
  }

  const clinic = clinicsResult.data.find((c) => c.id === id);
  if (!clinic) notFound();

  const price = pricingResult.data.find((p) => p.id === clinic.pricingItemId);
  const landingPath = `/c/${clinic.slug}`;

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/hq/clinics"
        className="focus-ring inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-brand-700 hover:underline"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Clinics
      </Link>

      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-control bg-brand-100 text-brand-800">
              <Hospital className="h-5 w-5" aria-hidden />
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-heading">
              {clinic.name}
            </h1>
            <Badge variant={clinic.isActive ? "success" : "neutral"}>
              {clinic.isActive ? "Active" : "Inactive"}
            </Badge>
          </div>
          <p className="mt-2 font-mono text-sm text-fg-muted">{clinic.slug}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <ClinicQrButton clinicId={clinic.id} clinicName={clinic.name} />
          <Link
            href={`/hq/clinics/${id}/edit`}
            className={cn(buttonVariants({ variant: "secondary", size: "sm" }))}
          >
            Edit clinic
          </Link>
        </div>
      </header>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle as="h2">Clinic details</CardTitle>
          </CardHeader>
          <CardBody>
            <dl>
              <DetailRow label="Pharmacy">{clinic.pharmacyName}</DetailRow>
              <DetailRow label="Slug">
                <span className="font-mono text-xs">{clinic.slug}</span>
              </DetailRow>
              <DetailRow label="Brand colour">
                <span className="inline-flex items-center gap-2">
                  <span
                    className="inline-block h-4 w-4 rounded-full border border-subtle"
                    style={{ backgroundColor: clinic.brandColour }}
                    aria-hidden
                  />
                  {clinic.brandColour}
                </span>
              </DetailRow>
              <DetailRow label="Logo">
                {clinic.logoUrl ? (
                  <a
                    href={clinic.logoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand-700 hover:underline"
                  >
                    Open URL
                  </a>
                ) : (
                  "—"
                )}
              </DetailRow>
              <DetailRow label="Landing page">
                <Link
                  href={landingPath}
                  className="inline-flex items-center gap-1 text-brand-700 hover:underline"
                  target="_blank"
                >
                  {landingPath}
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                </Link>
              </DetailRow>
            </dl>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle as="h2">Pricing</CardTitle>
          </CardHeader>
          <CardBody>
            <dl>
              <DetailRow label="Price item">
                {price?.name ?? "—"}
              </DetailRow>
              <DetailRow label="Dispensing">
                {price
                  ? formatMoney(price.priceCents, price.currency)
                  : "—"}
              </DetailRow>
              <DetailRow label="Delivery fee">
                {price
                  ? formatMoney(price.deliveryFeeCents, price.currency)
                  : "—"}
              </DetailRow>
              <DetailRow label="Price status">
                {price ? (
                  <Badge variant={price.isActive ? "success" : "neutral"}>
                    {price.isActive ? "Active" : "Inactive"}
                  </Badge>
                ) : (
                  "—"
                )}
              </DetailRow>
            </dl>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

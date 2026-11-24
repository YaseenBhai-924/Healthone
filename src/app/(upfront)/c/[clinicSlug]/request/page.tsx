import { UpfrontFlow } from '@/components/patient/upfront-flow'
import { getClinicServer } from '@/lib/api/public-server'
import { clinicDisplayName } from '@/lib/patient/mock-clinic'

export default async function RequestPage({
  params,
}: {
  params: Promise<{ clinicSlug: string }>
}) {
  const { clinicSlug } = await params
  const clinic = await getClinicServer(clinicSlug)

  if (!clinic || !clinic.orderingEnabled) {
    return (
      <main className="mx-auto max-w-xl px-4 py-16 text-center">
        <h1 className="font-display text-2xl font-bold text-heading">
          Ordering unavailable
        </h1>
        <p className="mt-3 text-sm text-ink-muted">
          {clinic
            ? 'This clinic is not accepting new requests right now.'
            : 'We could not load this clinic. Please go back and try again.'}
        </p>
      </main>
    )
  }

  return (
    <UpfrontFlow
      clinicName={clinicDisplayName(clinic)}
      pharmacyName={clinic.pharmacyName}
      pharmacyAddress={clinic.pharmacyAddress}
    />
  )
}

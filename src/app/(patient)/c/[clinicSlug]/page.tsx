import { ClinicLanding } from '@/components/patient/clinic-landing'
import { getClinicServer, getFeaturedComparisonServer } from '@/lib/api/public-server'

export default async function ClinicLandingPage({
  params,
  searchParams,
}: {
  params: Promise<{ clinicSlug: string }>
  searchParams: Promise<{ src?: string }>
}) {
  const { clinicSlug } = await params
  const { src } = await searchParams
  const clinic = await getClinicServer(clinicSlug)
  const featured = await getFeaturedComparisonServer()

  if (!clinic) {
    return (
      <main className="mx-auto max-w-xl px-4 py-16 text-center">
        <h1 className="font-display text-2xl font-bold text-heading">
          Clinic unavailable
        </h1>
        <p className="mt-3 text-sm text-ink-muted">
          We could not load this clinic right now. Check the link from your clinic
          or try again later — we will not send you to a broken order page.
        </p>
      </main>
    )
  }

  return (
    <ClinicLanding clinic={clinic} fromQr={src === 'qr'} featured={featured} />
  )
}

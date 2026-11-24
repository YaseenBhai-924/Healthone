import { ClinicLanding } from '@/components/patient/clinic-landing'
import { getClinicServer, getFeaturedComparisonServer } from '@/lib/api/public-server'
import { mockClinic } from '@/lib/patient/mock-clinic'

export default async function ClinicLandingPage({
  params,
  searchParams,
}: {
  params: Promise<{ clinicSlug: string }>
  searchParams: Promise<{ src?: string }>
}) {
  const { clinicSlug } = await params
  const { src } = await searchParams
  // Fall back when public API is unreachable (local / Vercel demo).
  const clinic = (await getClinicServer(clinicSlug)) ?? mockClinic(clinicSlug)
  const featured = await getFeaturedComparisonServer()

  return (
    <ClinicLanding clinic={clinic} fromQr={src === 'qr'} featured={featured} />
  )
}

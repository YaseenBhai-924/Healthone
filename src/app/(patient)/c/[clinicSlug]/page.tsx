import { ClinicLanding } from '@/components/patient/clinic-landing'
import { getClinicServer } from '@/lib/api/public-server'
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
  const clinic = (await getClinicServer(clinicSlug)) ?? mockClinic(clinicSlug)

  return <ClinicLanding clinic={clinic} fromQr={src === 'qr'} />
}

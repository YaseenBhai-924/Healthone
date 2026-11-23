import { UpfrontFlow } from '@/components/patient/upfront-flow'
import { getClinicServer } from '@/lib/api/public-server'
import { mockClinic } from '@/lib/patient/mock-clinic'

export default async function RequestPage({
  params,
}: {
  params: Promise<{ clinicSlug: string }>
}) {
  const { clinicSlug } = await params
  const clinic = (await getClinicServer(clinicSlug)) ?? mockClinic(clinicSlug)
  return <UpfrontFlow clinicName={clinic.name} />
}

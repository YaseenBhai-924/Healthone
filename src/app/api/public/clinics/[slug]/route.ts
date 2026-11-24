import { NextResponse } from 'next/server'
import {
  getStaticClinicBySlug,
  toPublicClinicDto,
} from '@/lib/static/store'

export const dynamic = 'force-dynamic'

/** Anonymous clinic DTO with pharmacy collection address (no-store). */
export async function GET(
  _request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  const { slug } = await context.params
  const clinic = getStaticClinicBySlug(slug)
  if (!clinic) {
    return NextResponse.json(
      { title: 'Not found', detail: 'Clinic not found.' },
      { status: 404, headers: { 'Cache-Control': 'no-store' } },
    )
  }

  return NextResponse.json(toPublicClinicDto(clinic), {
    headers: { 'Cache-Control': 'no-store' },
  })
}

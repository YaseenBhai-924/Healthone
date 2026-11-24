import { NextResponse } from 'next/server'
import { getFeaturedStaticComparison } from '@/lib/static/store'

export const dynamic = 'force-dynamic'

/** Anonymous featured comparison (Cache-Control: no-store). */
export async function GET() {
  const featured = getFeaturedStaticComparison()
  if (!featured) {
    return NextResponse.json(null, {
      status: 204,
      headers: { 'Cache-Control': 'no-store' },
    })
  }

  return NextResponse.json(featured, {
    headers: { 'Cache-Control': 'no-store' },
  })
}

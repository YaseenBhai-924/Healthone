'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Link2, Loader2 } from 'lucide-react'
import {
  Alert,
  Card,
  CardBody,
  IconBadge,
  buttonVariants,
} from '@/components/ui'
import { lookupStatus } from '@/lib/api/public-client'
import type { StatusLookupResponse } from '@/lib/api/public-types'
import { StatusView } from '@/components/patient/status-timeline'
import { claimStatusTokenFromHash } from '@/lib/patient/status-token'
import { cn } from '@/lib/cn'

export default function StatusPage() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<StatusLookupResponse | null>(null)
  const [missing, setMissing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const token = claimStatusTokenFromHash()
    if (!token) {
      setMissing(true)
      setLoading(false)
      return
    }

    let cancelled = false
    void (async () => {
      const result = await lookupStatus(token)
      if (cancelled) return
      setLoading(false)
      if (!result.ok) {
        if (result.error.status === 404) {
          setMissing(true)
          return
        }
        setError(result.error.message)
        return
      }
      setData(result.data)
    })()

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <main className="relative overflow-hidden px-4 py-10 sm:py-14">
      <div className="sd-blob sd-blob-a left-1/2 top-0 -translate-x-1/2 opacity-50" aria-hidden />
      <div className="sd-blob sd-blob-b right-[-10%] top-40 opacity-40" aria-hidden />

      <div className="relative mx-auto w-full max-w-xl sm:max-w-2xl">
        <Card className="sd-glass border-white/70 shadow-lg">
          <CardBody className="p-6 sm:p-8">
            {loading ? (
              <div className="flex flex-col items-center gap-3 py-10 text-center">
                <Loader2
                  className="h-8 w-8 animate-spin text-brand-600"
                  aria-hidden
                />
                <p className="text-sm font-medium text-ink-muted">
                  Loading your order status…
                </p>
              </div>
            ) : null}

            {!loading && error ? (
              <Alert variant="danger" title="Could not load status">
                {error}
              </Alert>
            ) : null}

            {!loading && missing && !error ? (
              <div className="space-y-5 text-center">
                <div className="flex justify-center">
                  <IconBadge icon={Link2} />
                </div>
                <h1 className="font-display !text-2xl font-bold leading-snug text-heading sm:!text-3xl">
                  Status link required
                </h1>
                <p className="text-sm leading-relaxed text-ink-muted">
                  Open the private link from your confirmation email, or ask us
                  to resend it. No account or password is needed.
                </p>
                <Link
                  href="/status/lost-link"
                  className={cn(buttonVariants({ size: 'lg' }), 'w-full')}
                >
                  Resend my status link
                </Link>
              </div>
            ) : null}

            {!loading && data ? <StatusView data={data} /> : null}
          </CardBody>
        </Card>

        {!loading && data ? (
          <p className="mt-5 text-center text-sm text-ink-muted">
            Lost this page?{' '}
            <Link
              href="/status/lost-link"
              className="font-semibold text-brand-700 hover:underline"
            >
              Resend link
            </Link>
          </p>
        ) : null}
      </div>
    </main>
  )
}

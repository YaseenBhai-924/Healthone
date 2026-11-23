'use client'

import { Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { CheckCircle2, XCircle } from 'lucide-react'
import { Alert, Card, CardBody, buttonVariants } from '@/components/ui'
import { cn } from '@/lib/cn'

function ThankYouContent() {
  const params = useSearchParams()
  const canceled = params.get('canceled') === '1'

  if (canceled) {
    return (
      <Card>
        <CardBody className="space-y-4 text-center">
          <XCircle
            className="mx-auto size-12 text-warning-fg"
            aria-hidden
          />
          <h1 className="font-display text-2xl font-extrabold text-heading">
            Payment not completed
          </h1>
          <p className="text-sm text-fg-secondary">
            No charge was made. You can use the payment link from your email
            again when you are ready, or contact the pharmacy if you need a
            new link.
          </p>
          <Alert variant="info" title="Need your order status?">
            Open the private status link from your confirmation email to track
            this request.
          </Alert>
          <Link
            href="/status/lost-link"
            className={cn(buttonVariants({ variant: 'secondary' }), 'w-full')}
          >
            Resend my status link
          </Link>
        </CardBody>
      </Card>
    )
  }

  return (
    <Card>
      <CardBody className="space-y-4 text-center">
        <CheckCircle2
          className="mx-auto size-12 text-success-fg"
          aria-hidden
        />
        <h1 className="font-display text-2xl font-extrabold text-heading">
          Thank you for your payment
        </h1>
        <p className="text-sm text-fg-secondary">
          Your payment was successful. The pharmacy has been notified and will
          start preparing your order.
        </p>
        <Alert variant="info" title="Track your order">
          Keep the private status link from your confirmation email. That is
          how you check progress. We will also email you when the status
          changes.
        </Alert>
        <Link
          href="/status/lost-link"
          className={cn(buttonVariants({ variant: 'secondary' }), 'w-full')}
        >
          Lost your status link?
        </Link>
      </CardBody>
    </Card>
  )
}

export default function ThankYouPage() {
  return (
    <main className="mx-auto w-full max-w-md px-4 py-10">
      <Suspense
        fallback={
          <p className="text-center text-sm text-fg-muted">Loading…</p>
        }
      >
        <ThankYouContent />
      </Suspense>
    </main>
  )
}

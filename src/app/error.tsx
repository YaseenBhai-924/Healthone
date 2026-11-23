'use client'

import Link from 'next/link'
import { SiteFooter } from '@/components/patient/site-footer'
import { SiteHeader } from '@/components/patient/site-header'
import { Button, buttonVariants } from '@/components/ui'
import { Container } from '@/components/site'
import { cn } from '@/lib/cn'
import { patientFontClass } from '@/lib/patient/fonts'

function ErrorArt({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 160 120"
      className={className}
      aria-hidden
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="24" y="32" width="112" height="64" rx="14" fill="#BFDBFE" />
      <path
        d="M80 48v20"
        stroke="#2563EB"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <circle cx="80" cy="80" r="3" fill="#2563EB" />
      <circle cx="52" cy="56" r="8" fill="#93C5FD" />
      <circle cx="108" cy="56" r="8" fill="#93C5FD" />
    </svg>
  )
}

export default function Error({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className={`${patientFontClass} patient-atmosphere flex min-h-svh flex-col`}>
      <SiteHeader />
      <main id="main-content" className="relative flex flex-1 items-center py-16">
        <div className="sd-blob sd-blob-b right-1/4 top-10 opacity-50" aria-hidden />
        <Container className="relative text-center">
          <ErrorArt className="mx-auto h-28 w-40" />
          <h1 className="sd-display sd-display-lg mt-6">
            Something went wrong
          </h1>
          <p className="mx-auto mt-3 max-w-md text-ink-muted">
            We could not load this page. You can try again, or go home and
            continue from there.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button type="button" onClick={() => reset()}>
              Try again
            </Button>
            <Link
              href="/"
              className={cn(buttonVariants({ variant: 'secondary' }))}
            >
              Back home
            </Link>
            <Link
              href="/contact"
              className={cn(buttonVariants({ variant: 'ghost' }))}
            >
              Contact
            </Link>
          </div>
        </Container>
      </main>
      <SiteFooter />
    </div>
  )
}

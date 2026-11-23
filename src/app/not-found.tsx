import Link from 'next/link'
import { SiteFooter } from '@/components/patient/site-footer'
import { SiteHeader } from '@/components/patient/site-header'
import { buttonVariants } from '@/components/ui'
import { Container } from '@/components/site'
import { cn } from '@/lib/cn'
import { patientFontClass } from '@/lib/patient/fonts'

function LostPathArt({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 160 120"
      className={className}
      aria-hidden
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="20" y="28" width="120" height="72" rx="14" fill="#BFDBFE" />
      <rect x="32" y="40" width="96" height="48" rx="8" fill="#EFF6FF" />
      <circle cx="80" cy="64" r="18" fill="#2563EB" />
      <path
        d="M72 64h16M80 56v16"
        stroke="#EFF6FF"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <text
        x="80"
        y="22"
        textAnchor="middle"
        fill="#1E40AF"
        fontSize="14"
        fontFamily="system-ui,sans-serif"
        fontWeight="700"
      >
        404
      </text>
    </svg>
  )
}

export default function NotFound() {
  return (
    <div className={`${patientFontClass} patient-atmosphere flex min-h-svh flex-col`}>
      <SiteHeader />
      <main id="main-content" className="relative flex flex-1 items-center py-16">
        <div className="sd-blob sd-blob-a left-1/2 top-8 -translate-x-1/2 opacity-50" aria-hidden />
        <Container className="relative text-center">
          <LostPathArt className="mx-auto h-28 w-40" />
          <h1 className="sd-display sd-display-lg mt-6">
            Page not found
          </h1>
          <p className="mx-auto mt-3 max-w-md text-ink-muted">
            That link does not match a page on Script Direct. Check the URL or
            head back home to start an order.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link href="/" className={cn(buttonVariants())}>
              Back home
            </Link>
            <Link
              href="/contact"
              className={cn(buttonVariants({ variant: 'secondary' }))}
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

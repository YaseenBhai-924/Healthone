/**
 * /auth/signed-out: shown after successful sign-out.
 * Entra redirects here via post_logout_redirect_uri.
 */
import type { Metadata } from 'next'
import Link from 'next/link'
import { LogOut } from 'lucide-react'
import { AuthShell } from '@/components/auth/auth-shell'
import { buttonVariants } from '@/components/ui/button-variants'
import { cn } from '@/lib/cn'

export const metadata: Metadata = {
  title: 'Signed out | Script Direct',
  robots: { index: false, follow: false },
}

export default function SignedOutPage() {
  return (
    <AuthShell
      title="Signed out"
      subtitle="You have been signed out successfully."
      footer={
        <Link href="/" className="font-semibold text-brand-700 hover:underline">
          Back to Script Direct
        </Link>
      }
    >
      <div className="flex flex-col items-center gap-5 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 text-brand-700 ring-1 ring-brand-100">
          <LogOut className="h-6 w-6" aria-hidden />
        </span>
        <p className="text-sm leading-relaxed text-ink-muted">
          Your session has ended. Sign in again when you need the pharmacy
          portal or headquarters.
        </p>
        <Link
          href="/auth/sign-in"
          className={cn(buttonVariants({ size: 'lg' }), 'w-full')}
        >
          Sign in again
        </Link>
      </div>
    </AuthShell>
  )
}

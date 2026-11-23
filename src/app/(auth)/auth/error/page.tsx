/**
 * /auth/error: Auth.js error page with calm, actionable copy.
 */
import type { Metadata } from 'next'
import Link from 'next/link'
import { TriangleAlert } from 'lucide-react'
import { AuthShell } from '@/components/auth/auth-shell'
import { Alert } from '@/components/ui/alert'
import { buttonVariants } from '@/components/ui/button-variants'
import { cn } from '@/lib/cn'

export const metadata: Metadata = {
  title: 'Sign-in error | Script Direct',
  robots: { index: false, follow: false },
}

const ERROR_MESSAGES: Record<string, string> = {
  Configuration:
    'There is a problem with the server configuration. Please contact support.',
  AccessDenied:
    'Your account does not have permission to access Script Direct. Please contact your administrator.',
  Verification: 'Your sign-in link has expired. Please request a new one.',
  OAuthSignin: 'Could not start the sign-in process. Please try again.',
  OAuthCallback:
    'The sign-in process could not be completed. Please try again.',
  OAuthCreateAccount: 'Could not create your account. Please contact support.',
  OAuthAccountNotLinked:
    'This account is already linked to another sign-in method.',
  SessionRequired: 'Please sign in to access this page.',
  Default: 'An unexpected error occurred during sign-in. Please try again.',
}

interface Props {
  searchParams: Promise<{ error?: string }>
}

export default async function AuthErrorPage({ searchParams }: Props) {
  const params = await searchParams
  const message =
    (params.error ? ERROR_MESSAGES[params.error] : null) ??
    ERROR_MESSAGES.Default

  return (
    <AuthShell
      title="Sign-in failed"
      subtitle="We could not complete authentication."
      footer={
        <Link href="/" className="font-semibold text-brand-700 hover:underline">
          Back to Script Direct
        </Link>
      }
    >
      <div className="flex flex-col gap-5">
        <div className="flex justify-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-danger-bg text-danger ring-1 ring-danger/20">
            <TriangleAlert className="h-6 w-6" aria-hidden />
          </span>
        </div>
        <Alert variant="danger">{message}</Alert>
        <Link
          href="/auth/sign-in"
          className={cn(buttonVariants({ size: 'lg' }), 'w-full')}
        >
          Try again
        </Link>
      </div>
    </AuthShell>
  )
}

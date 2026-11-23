/**
 * /auth/sign-in: Microsoft Entra ID staff sign-in.
 */
import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Alert } from '@/components/ui/alert'
import { AuthShell } from '@/components/auth/auth-shell'
import { auth } from '@/auth'
import { safeReturnPath } from '@/lib/auth/return-url'
import { signInWithMicrosoft } from './actions'

export const metadata: Metadata = {
  title: 'Sign in | Script Direct',
  robots: { index: false, follow: false },
}

const ERROR_MESSAGES: Record<string, string> = {
  OAuthSignin: 'Could not initiate sign-in. Please try again.',
  OAuthCallback: 'Sign-in callback failed. Please try again.',
  OAuthCreateAccount: 'Could not create your account. Contact support.',
  OAuthAccountNotLinked:
    'This account is linked to a different sign-in method.',
  SessionRequired: 'Please sign in to access this page.',
  AccessDenied:
    'Access denied. Your account does not have permission to use Script Direct.',
  Configuration:
    'Authentication is not configured correctly. Contact support.',
  Default: 'An unexpected error occurred. Please try again.',
}

interface Props {
  searchParams: Promise<{ callbackUrl?: string; error?: string }>
}

export default async function SignInPage({ searchParams }: Props) {
  const params = await searchParams
  const session = await auth()
  if (session?.user && !session.user.error) {
    const roleHome = safeReturnPath(
      params.callbackUrl ?? null,
      session.user.role,
    )
    redirect(roleHome)
  }

  const callbackUrl = safeReturnPath(params.callbackUrl ?? null, null)
  const errorMessage = params.error
    ? (ERROR_MESSAGES[params.error] ?? ERROR_MESSAGES.Default)
    : null

  return (
    <AuthShell
      title="Staff sign in"
      subtitle="Pharmacy and HealthOne staff use Microsoft Entra ID with MFA."
      footer={
        <p>
          Patients order without an account.{' '}
          <Link href="/" className="font-semibold text-brand-700 hover:underline">
            Back to Script Direct
          </Link>
        </p>
      }
    >
      <div className="flex flex-col gap-5">
        {errorMessage ? <Alert variant="danger">{errorMessage}</Alert> : null}

        <div className="flex items-start gap-3 rounded-card border border-brand-100 bg-brand-50/70 px-3 py-3">
          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-control bg-white text-brand-700 shadow-sm ring-1 ring-brand-100">
            <ShieldCheck className="h-4 w-4" aria-hidden />
          </span>
          <p className="text-sm leading-relaxed text-ink-muted">
            Sign in with your organisation account to open the pharmacy portal
            or HealthOne headquarters.
          </p>
        </div>

        <form action={signInWithMicrosoft.bind(null, callbackUrl)}>
          <Button type="submit" size="lg" className="w-full">
            Sign in with Microsoft
          </Button>
        </form>
      </div>
    </AuthShell>
  )
}

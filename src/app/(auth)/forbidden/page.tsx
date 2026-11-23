/**
 * /forbidden: authenticated but not allowed (wrong role or pharmacy assignment).
 * Middleware rewrites here with HTTP 403.
 */
import type { Metadata } from 'next'
import Link from 'next/link'
import { ShieldAlert } from 'lucide-react'
import { auth } from '@/auth'
import { Button } from '@/components/ui/button'
import { Alert } from '@/components/ui/alert'
import { AuthShell } from '@/components/auth/auth-shell'
import { buttonVariants } from '@/components/ui/button-variants'
import { signOutAction } from '@/lib/auth/sign-out-action'
import { cn } from '@/lib/cn'

export const metadata: Metadata = {
  title: 'Access denied | Script Direct',
  robots: { index: false, follow: false },
}

export default async function ForbiddenPage({
  searchParams,
}: {
  searchParams?: Promise<{ code?: string }>
}) {
  const session = await auth()
  const params = searchParams ? await searchParams : {}
  const assignmentProblem =
    params.code === 'pharmacy_assignment_problem' ||
    !!session?.user?.pharmacyAssignmentProblem
  const apiError = !!session?.user?.apiError
  const role = session?.user?.role ?? null
  const home =
    role === 'SuperAdmin' ? '/hq' : role === 'PharmacyStaff' ? '/admin' : null

  const alertTitle = apiError
    ? 'API unavailable'
    : 'Access is managed by your organisation'

  const alertText = apiError
    ? 'We could not reach the Script Direct API to check your permissions. Make sure the API is running (and can connect to SQL), then sign out and sign in again.'
    : assignmentProblem
      ? 'Your account is not linked to a pharmacy, or is linked to more than one. Ask your organisation’s administrator to fix your group membership, then sign in again.'
      : 'Your signed-in account does not have permission for this part of Script Direct. Sign out and use the account your organisation issued for this role.'

  return (
    <AuthShell
      title="Access denied"
      subtitle="You do not have access to this area of Script Direct."
      footer={
        <Link href="/" className="font-semibold text-brand-700 hover:underline">
          Back to Script Direct
        </Link>
      }
    >
      <div className="flex flex-col gap-5">
        <div className="flex justify-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-warning-bg text-warning ring-1 ring-warning/25">
            <ShieldAlert className="h-6 w-6" aria-hidden />
          </span>
        </div>

        <Alert variant="danger" title={alertTitle}>
          {alertText}
        </Alert>

        <form action={signOutAction}>
          <Button type="submit" size="lg" className="w-full">
            Sign out
          </Button>
        </form>

        {home ? (
          <Link
            href={home}
            className={cn(buttonVariants({ variant: 'secondary', size: 'lg' }), 'w-full')}
          >
            Go to your home
          </Link>
        ) : null}
      </div>
    </AuthShell>
  )
}

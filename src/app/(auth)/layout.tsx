/**
 * Auth route group layout: sign-in, continue, error, signed-out, forbidden.
 * Atmosphere comes from AuthShell on each page. Cache-Control: no-store via middleware.
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

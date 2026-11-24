/**
 * Global middleware: security headers (incl. CSP) + auth route protection.
 *
 * Security headers applied to every response:
 *  - Content-Security-Policy   (nonce + Stripe + Entra form-action)
 *  - Cache-Control: no-store   (dynamic content never cached)
 *  - X-Content-Type-Options: nosniff
 *  - X-Frame-Options: DENY
 *  - Referrer-Policy: no-referrer
 *  - Permissions-Policy: minimal surface
 *  - X-Correlation-Id: generated per request (for log correlation)
 *  HSTS is enforced at Front Door (architecture §12), not here.
 *
 * Route protection:
 *  /admin/*  → requires PharmacyStaff session
 *  /hq/*     → requires SuperAdmin session
 *  /auth/*, patient routes → public
 *
 * Static assets (/_next/static, favicon…) are exempt from no-store so
 * Next.js CDN headers and Front Door caching work correctly.
 */
import NextAuth from 'next-auth'
import authConfig from '@/auth.config'
import { type NextRequest, NextResponse } from 'next/server'
import { safeReturnPath } from '@/lib/auth/return-url'
import {
  buildContentSecurityPolicy,
  createCspNonce,
} from '@/lib/security/csp'
import { isStaticDemo } from '@/lib/static/is-static-demo'
import type { Session } from 'next-auth'

const { auth } = NextAuth(authConfig)

const isDev = process.env.NODE_ENV === 'development'

// ─── Pure helpers (exported for unit tests) ──────────────────────────────────

export function isCacheablePath(pathname: string): boolean {
  return (
    pathname.startsWith('/_next/static') ||
    pathname.startsWith('/_next/image') ||
    pathname.startsWith('/favicon') ||
    /\.(png|jpg|jpeg|gif|svg|ico|webp|woff|woff2|ttf)$/.test(pathname)
  )
}

function setSecurityHeaders(
  response: NextResponse,
  pathname: string,
  nonce: string,
): NextResponse {
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('Referrer-Policy', 'no-referrer')
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=()',
  )
  response.headers.delete('Server')

  const csp = buildContentSecurityPolicy({
    nonce,
    isDev,
    extraImgSrc: process.env.CSP_IMG_SRC_EXTRA ?? '',
  })
  response.headers.set('Content-Security-Policy', csp)

  if (!isCacheablePath(pathname)) {
    response.headers.set('Cache-Control', 'no-store')
  }

  return response
}

/**
 * Pass-through response with security headers and a forwarded
 * correlation ID + CSP nonce (x-nonce) for Next.js script noncing.
 */
export function applySecurityHeaders(request: NextRequest): NextResponse {
  const correlationId = crypto.randomUUID()
  const nonce = createCspNonce()
  const { pathname } = request.nextUrl

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-correlation-id', correlationId)
  requestHeaders.set('x-nonce', nonce)

  // Next.js reads CSP from the request to apply nonces to its scripts.
  const csp = buildContentSecurityPolicy({
    nonce,
    isDev,
    extraImgSrc: process.env.CSP_IMG_SRC_EXTRA ?? '',
  })
  requestHeaders.set('Content-Security-Policy', csp)

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  })

  response.headers.set('X-Correlation-Id', correlationId)
  return setSecurityHeaders(response, pathname, nonce)
}

function securedRedirect(
  url: URL,
  pathname: string,
): NextResponse {
  const nonce = createCspNonce()
  const redirect = NextResponse.redirect(url)
  return setSecurityHeaders(redirect, pathname, nonce)
}

function securedRewrite(
  url: URL,
  pathname: string,
  status: number,
): NextResponse {
  const nonce = createCspNonce()
  const rewrite = NextResponse.rewrite(url, { status })
  return setSecurityHeaders(rewrite, pathname, nonce)
}

// ─── Middleware (auth-wrapped) ────────────────────────────────────────────────

export default auth((req) => {
  const { pathname } = req.nextUrl
  const session = req.auth as (Session & { user: Session['user'] }) | null

  const isAdminRoute = pathname.startsWith('/admin')
  const isHqRoute = pathname.startsWith('/hq')

  if (isAdminRoute || isHqRoute) {
    // Frontend-only static demo: allow HQ without Entra / API.
    if (isHqRoute && isStaticDemo()) {
      return applySecurityHeaders(req)
    }

    const requiredRole: 'PharmacyStaff' | 'SuperAdmin' = isAdminRoute
      ? 'PharmacyStaff'
      : 'SuperAdmin'

    if (!session || session.user.error === 'RefreshTokenError') {
      const attempted =
        pathname + (req.nextUrl.search ? req.nextUrl.search : '')
      const callbackUrl = safeReturnPath(attempted, requiredRole)
      const signInUrl = new URL('/auth/sign-in', req.nextUrl.origin)
      signInUrl.searchParams.set('callbackUrl', callbackUrl)
      return securedRedirect(signInUrl, pathname)
    }

    if (session.user.apiError) {
      const forbiddenUrl = new URL('/forbidden', req.nextUrl.origin)
      return securedRewrite(forbiddenUrl, pathname, 503)
    }

    if (session.user.accessDenied) {
      const forbiddenUrl = new URL('/forbidden', req.nextUrl.origin)
      if (session.user.pharmacyAssignmentProblem) {
        forbiddenUrl.searchParams.set('code', 'pharmacy_assignment_problem')
      }
      return securedRewrite(forbiddenUrl, pathname, 403)
    }

    if (session.user.role && session.user.role !== requiredRole) {
      const home = session.user.role === 'SuperAdmin' ? '/hq' : '/admin'
      return securedRedirect(new URL(home, req.nextUrl.origin), pathname)
    }

    if (session.user.role !== requiredRole) {
      const forbiddenUrl = new URL('/forbidden', req.nextUrl.origin)
      return securedRewrite(forbiddenUrl, pathname, 403)
    }
  }

  return applySecurityHeaders(req)
})

export const config = {
  matcher: [
    {
      source: '/((?!_next/static|_next/image|favicon.ico).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
}

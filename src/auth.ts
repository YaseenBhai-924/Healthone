/**
 * Full Auth.js configuration (Node runtime only).
 *
 * Adds the jwt callback that:
 *  - Calls GET /api/admin/me on initial sign-in to fetch role + pharmacyName.
 *  - Enforces an absolute 8-hour session from signedInAt.
 *  - Silently refreshes the access token within 60 s of expiry.
 *  - Sets error = 'RefreshTokenError' and clears tokens on refresh failure.
 *
 * Never logs tokens. Never exposes accessToken / refreshToken through
 * the session callback.
 */
import NextAuth from "next-auth";
import { cookies } from "next/headers";
import { cache } from "react";
import { getToken, type JWT } from "@auth/core/jwt";
import authConfig from "./auth.config";

// ─── Module augmentation ──────────────────────────────────────────────────────

declare module "next-auth" {
  interface Session {
    user: {
      name: string;
      role: "PharmacyStaff" | "SuperAdmin" | null;
      pharmacyName: string | null;
      accessDenied: boolean;
      pharmacyAssignmentProblem: boolean;
      apiError: boolean;
      error: "RefreshTokenError" | null;
    };
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    accessToken?: string;
    refreshToken?: string;
    accessTokenExpiresAt?: number;
    signedInAt?: number;
    role?: "PharmacyStaff" | "SuperAdmin" | null;
    pharmacyName?: string | null;
    accessDenied?: boolean;
    pharmacyAssignmentProblem?: boolean;
    apiError?: boolean;
    error?: "RefreshTokenError";
  }
}

// ─── Constants ────────────────────────────────────────────────────────────────

const SESSION_MAX_AGE_MS = 8 * 60 * 60 * 1000; // 8 hours in ms
const REFRESH_BUFFER_MS = 60 * 1000; // refresh if < 60 s to expiry

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function fetchUserRole(
  accessToken: string,
): Promise<
  | { role: "PharmacyStaff" | "SuperAdmin"; pharmacyName: string | null }
  | { accessDenied: true; pharmacyAssignmentProblem?: boolean }
  | { apiError: true }
> {
  const apiBaseUrl = process.env.API_BASE_URL ?? "";
  if (!apiBaseUrl) return { apiError: true };

  try {
    const res = await fetch(`${apiBaseUrl}/api/admin/me`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
      cache: "no-store",
    });

    if (res.status === 401 || res.status === 403) {
      let pharmacyAssignmentProblem = false;
      try {
        const body = (await res.json()) as { code?: string };
        pharmacyAssignmentProblem = body.code === "pharmacy_assignment_problem";
      } catch {
        /* ignore body parse errors */
      }
      return { accessDenied: true, pharmacyAssignmentProblem };
    }

    if (!res.ok) return { apiError: true };

    const data = (await res.json()) as {
      role: "PharmacyStaff" | "SuperAdmin";
      pharmacy: { id: string; name: string } | null;
    };

    if (data.role !== "PharmacyStaff" && data.role !== "SuperAdmin") {
      return { accessDenied: true };
    }

    return {
      role: data.role,
      pharmacyName: data.pharmacy?.name ?? null,
    };
  } catch {
    return { apiError: true };
  }
}

async function refreshAccessToken(
  token: JWT,
): Promise<JWT> {
  const tenantId = process.env.ENTRA_TENANT_ID ?? "";
  const clientId = process.env.ENTRA_CLIENT_ID ?? "";
  const clientSecret = process.env.ENTRA_CLIENT_SECRET ?? "";
  const scope = `openid profile offline_access ${process.env.API_SCOPE ?? ""}`.trim();

  try {
    const res = await fetch(
      `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`,
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          grant_type: "refresh_token",
          refresh_token: token.refreshToken ?? "",
          scope,
        }),
        cache: "no-store",
      },
    );

    if (!res.ok) throw new Error("Token refresh failed");

    const data = (await res.json()) as {
      access_token: string;
      refresh_token?: string;
      expires_in: number;
    };

    return {
      ...token,
      accessToken: data.access_token,
      refreshToken: data.refresh_token ?? token.refreshToken,
      accessTokenExpiresAt: Date.now() + data.expires_in * 1000,
      // Clear previous errors
      error: undefined,
    };
  } catch {
    // Drop tokens on refresh failure so the user must re-authenticate.
    return {
      ...token,
      accessToken: undefined,
      refreshToken: undefined,
      accessTokenExpiresAt: undefined,
      error: "RefreshTokenError",
    };
  }
}

// ─── Cookie policy ────────────────────────────────────────────────────────────
// Local HTTP (AUTH_URL=http://...) must use SameSite=Lax and Secure=false.
// SameSite=None requires Secure, and Secure cookies only work over HTTPS —
// using None without Secure makes the browser drop the cookie and breaks the
// Entra callback. Production HTTPS keeps Lax + Secure (top-level OAuth
// redirects still send Lax cookies).

const useSecureCookies = (process.env.AUTH_URL ?? "").startsWith("https://");

// ─── NextAuth instance ────────────────────────────────────────────────────────

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,

  useSecureCookies,

  cookies: {
    sessionToken: {
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: useSecureCookies,
      },
    },
    // Explicit Lax so PKCE/state survive the Microsoft redirect on localhost
    // HTTP without requiring SameSite=None (which browsers reject without Secure).
    pkceCodeVerifier: {
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: useSecureCookies,
        maxAge: 60 * 15,
      },
    },
    state: {
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: useSecureCookies,
        maxAge: 60 * 15,
      },
    },
  },

  callbacks: {
    // Spread the edge-safe callbacks (session, redirect) from authConfig.
    ...authConfig.callbacks,

    /**
     * jwt callback runs on every token access (sign-in, session refresh, token
     * validation in middleware). On initial sign-in (account + profile present)
     * we store tokens and call /api/admin/me to populate role and pharmacyName.
     *
     * Never log token values.
     */
    async jwt({ token, account, profile }) {
      // ── Initial sign-in ──────────────────────────────────────────────────
      if (account && profile) {
        const base: JWT = {
          ...token,
          accessToken: account.access_token,
          refreshToken: account.refresh_token,
          accessTokenExpiresAt: account.expires_at
            ? account.expires_at * 1000
            : Date.now() + 3600_000,
          signedInAt: Date.now(),
          // name claim only
          name: (profile as { name?: string }).name ?? token.name ?? "",
          error: undefined,
        };

        const meResult = await fetchUserRole(account.access_token ?? "");

        if ("accessDenied" in meResult) {
          return {
            ...base,
            accessDenied: true,
            pharmacyAssignmentProblem: !!meResult.pharmacyAssignmentProblem,
          };
        }
        if ("apiError" in meResult) {
          return { ...base, apiError: true };
        }

        return {
          ...base,
          role: meResult.role,
          pharmacyName: meResult.pharmacyName,
          accessDenied: false,
          pharmacyAssignmentProblem: false,
        };
      }

      // ── Absolute 8-hour expiry ───────────────────────────────────────────
      const signedInAt =
        typeof token.signedInAt === "number" ? token.signedInAt : 0;
      if (signedInAt > 0 && Date.now() > signedInAt + SESSION_MAX_AGE_MS) {
        return {
          ...token,
          accessToken: undefined,
          refreshToken: undefined,
          error: "RefreshTokenError",
        };
      }

      // ── Access token refresh ─────────────────────────────────────────────
      const expiresAt =
        typeof token.accessTokenExpiresAt === "number"
          ? token.accessTokenExpiresAt
          : 0;
      if (Date.now() > expiresAt - REFRESH_BUFFER_MS) {
        const refreshed = await refreshAccessToken(token);
        if (refreshed.error || !refreshed.accessToken) return refreshed;

        // Re-read /api/admin/me so role and pharmacy changes propagate.
        const meResult = await fetchUserRole(refreshed.accessToken);
        if ("accessDenied" in meResult) {
          return {
            ...refreshed,
            accessDenied: true,
            pharmacyAssignmentProblem: !!meResult.pharmacyAssignmentProblem,
            role: null,
            pharmacyName: null,
          };
        }
        if ("apiError" in meResult) {
          return { ...refreshed, apiError: true };
        }
        return {
          ...refreshed,
          role: meResult.role,
          pharmacyName: meResult.pharmacyName,
          accessDenied: false,
          pharmacyAssignmentProblem: false,
          apiError: false,
        };
      }

      return token;
    },
  },
});

/**
 * Server-only bearer for internal API calls.
 *
 * `getToken` alone does not run the jwt refresh callback, so an expired
 * access token would 401 the API while Auth.js still shows a valid session
 * (sign-in ↔ /admin redirect loop). Calling `auth()` first runs refresh and
 * updates the session cookie; then we read the access token. If the cookie is
 * still near expiry, refresh once more for this request.
 *
 * Wrapped in React `cache` so parallel apiFetch calls in one RSC render
 * (e.g. HQ dashboard) only resolve/refresh the token once.
 */
export const getAccessToken = cache(async (): Promise<string | null> => {
  const session = await auth();
  if (!session?.user || session.user.error === "RefreshTokenError") {
    return null;
  }

  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");

  const token = await getToken({
    req: { headers: { cookie: cookieHeader } },
    secret: process.env.AUTH_SECRET ?? "",
    secureCookie: useSecureCookies,
  });

  if (!token?.accessToken || token.error === "RefreshTokenError") {
    return null;
  }

  const expiresAt =
    typeof token.accessTokenExpiresAt === "number"
      ? token.accessTokenExpiresAt
      : 0;

  if (Date.now() > expiresAt - REFRESH_BUFFER_MS) {
    const refreshed = await refreshAccessToken(token);
    if (refreshed.error || !refreshed.accessToken) return null;
    return refreshed.accessToken;
  }

  return token.accessToken;
});

/**
 * Edge-safe Auth.js configuration.
 *
 * This file is imported by both middleware.ts (edge runtime) and auth.ts (Node
 * runtime). It must NOT import Node-only APIs or 'server-only'. The jwt
 * callback that makes API calls lives in auth.ts.
 *
 * Provider: Microsoft Entra ID (confidential web client, PKCE + state, no Graph).
 * Session: JWT, maxAge 8 hours.
 * Pages: /auth/sign-in, /auth/error.
 *
 * We do not use next-auth's built-in MicrosoftEntraID helper: its conformInternal
 * path clones the token Response then re-reads it, which breaks under Next.js
 * fetch ("response body has been used already"). Single-tenant discovery already
 * returns a concrete issuer GUID, so that path is unnecessary.
 */
import { customFetch } from "@auth/core";
import type { NextAuthConfig, Profile } from "next-auth";
import type { OIDCConfig } from "next-auth/providers";

const tenantId = process.env.ENTRA_TENANT_ID ?? "";
const issuer = `https://login.microsoftonline.com/${tenantId}/v2.0`;

/**
 * Entra OIDC discovery sometimes returns issuer with a `{tenantid}` placeholder.
 * Built-in Auth.js regex used `\\w+` which cannot match GUID hyphens.
 */
function entraCustomFetch(
  ...args: Parameters<typeof fetch>
): ReturnType<typeof fetch> {
  const input = args[0];
  const init: RequestInit = { ...(args[1] ?? {}), cache: "no-store" };
  const url = new URL(input instanceof Request ? input.url : String(input));

  if (!url.pathname.endsWith(".well-known/openid-configuration")) {
    return fetch(input, init);
  }

  return (async () => {
    const response = await fetch(input, init);
    const json = (await response.clone().json()) as {
      issuer?: string;
      [key: string]: unknown;
    };
    const tenantRe = /microsoftonline\.com\/([^/]+)\/v2\.0/;
    const tenant =
      url.href.match(tenantRe)?.[1] ??
      issuer.match(tenantRe)?.[1] ??
      "common";
    const resolvedIssuer =
      typeof json.issuer === "string"
        ? json.issuer.replaceAll("{tenantid}", tenant)
        : issuer;
    return Response.json({ ...json, issuer: resolvedIssuer });
  })();
}

function microsoftEntraIdProvider(): OIDCConfig<Profile> {
  return {
    id: "microsoft-entra-id",
    name: "Microsoft Entra ID",
    type: "oidc",
    clientId: process.env.ENTRA_CLIENT_ID ?? "",
    clientSecret: process.env.ENTRA_CLIENT_SECRET ?? "",
    issuer,
    authorization: {
      params: {
        scope: `openid profile offline_access ${process.env.API_SCOPE ?? ""}`.trim(),
        prompt: process.env.AUTH_ENTRA_PROMPT ?? "select_account",
      },
    },
    checks: ["pkce", "state"],
    // Skip Graph profile photo (bloats JWT; needs User.Read).
    profile(profile: Profile) {
      return {
        id: profile.sub ?? "",
        name: profile.name ?? null,
        email: profile.email ?? null,
      };
    },
    [customFetch]: entraCustomFetch,
  };
}

const authConfig: NextAuthConfig = {
  providers: [microsoftEntraIdProvider()],

  session: {
    strategy: "jwt",
    maxAge: 8 * 60 * 60, // 8 hours
  },

  pages: {
    signIn: "/auth/sign-in",
    error: "/auth/error",
  },

  callbacks: {
    /**
     * Map the JWT claims we store onto the public-facing Session object.
     * Exposes ONLY: name, role, pharmacyName, accessDenied, apiError, error.
     * The accessToken and refreshToken are intentionally NOT included so
     * useSession() / /api/auth/session never leak them to the browser.
     */
    session({ session, token }) {
      return {
        ...session,
        user: {
          name: (token.name as string | undefined) ?? "",
          role:
            (token.role as "PharmacyStaff" | "SuperAdmin" | undefined) ?? null,
          pharmacyName: (token.pharmacyName as string | undefined) ?? null,
          accessDenied: !!(token.accessDenied),
          pharmacyAssignmentProblem: !!(token.pharmacyAssignmentProblem),
          apiError: !!(token.apiError),
          error:
            (token.error as "RefreshTokenError" | undefined) ?? null,
        },
      };
    },

    /**
     * Validate redirect URLs. Allow:
     *  - Same-origin (SITE_URL) paths and absolute URLs.
     *  - Entra end-session endpoint (for sign-out).
     * Reject everything else to prevent open-redirect attacks.
     */
    redirect({ url, baseUrl }) {
      const siteUrl = process.env.SITE_URL ?? baseUrl;
      let siteOrigin = baseUrl;
      try {
        siteOrigin = new URL(siteUrl).origin;
      } catch {
        /* keep baseUrl */
      }

      const tid = process.env.ENTRA_TENANT_ID ?? "";

      // Allow the Entra end-session endpoint for sign-out.
      if (
        tid &&
        url.startsWith(
          `https://login.microsoftonline.com/${tid}/oauth2/v2.0/logout`,
        )
      ) {
        return url;
      }

      // Allow same-origin absolute URLs.
      try {
        const parsed = new URL(url);
        if (parsed.origin === siteOrigin) return url;
      } catch {
        // Relative path.
        if (url.startsWith("/")) return `${siteOrigin}${url}`;
      }

      return siteUrl;
    },
  },
};

export default authConfig;

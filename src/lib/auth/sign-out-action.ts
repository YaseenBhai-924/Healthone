/**
 * Sign-out server action.
 *
 * Clears the Auth.js session cookie and redirects the browser to the
 * Microsoft Entra ID end-session endpoint. Entra then redirects back to
 * /auth/signed-out via post_logout_redirect_uri.
 *
 * The Entra logout URL is allowed by the redirect callback in auth.config.ts.
 */
"use server";

import { signOut } from "@/auth";

export async function signOutAction(): Promise<never> {
  const tenantId = process.env.ENTRA_TENANT_ID ?? "";
  const siteUrl = process.env.SITE_URL ?? "http://localhost:3000";
  const postLogoutUri = encodeURIComponent(`${siteUrl}/auth/signed-out`);

  // signOut throws a NEXT_REDIRECT internally (handled by Next.js).
  await signOut({
    redirectTo: `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/logout?post_logout_redirect_uri=${postLogoutUri}`,
  });

  // TypeScript needs this for the never return type; signOut always throws.
  throw new Error("unreachable");
}

"use server";

import { signIn } from "@/auth";
import { safeReturnPath } from "@/lib/auth/return-url";

/**
 * Initiates the Microsoft Entra ID OIDC flow.
 *
 * After Entra returns, Auth.js lands on /auth/continue which reads the role
 * from GET /api/admin/me and redirects to /admin (PharmacyStaff) or /hq
 * (SuperAdmin). The optional callbackUrl is only kept if it matches that role.
 */
export async function signInWithMicrosoft(
  callbackUrl: string,
): Promise<never> {
  const safe = safeReturnPath(callbackUrl, null);
  const continueTo = `/auth/continue?callbackUrl=${encodeURIComponent(safe)}`;
  await signIn("microsoft-entra-id", { redirectTo: continueTo });
  throw new Error("unreachable"); // signIn always throws NEXT_REDIRECT
}

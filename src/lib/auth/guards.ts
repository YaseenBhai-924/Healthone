/**
 * Server-only auth guards.
 *
 * requireRole — call from layouts and pages that need a specific role.
 *   Redirects to /auth/sign-in when there is no valid session.
 *   Redirects to /forbidden when the role or access check fails.
 *
 * getCurrentUser — returns the current session user (or null).
 *   Suitable for pages that just display user info after the layout
 *   has already enforced the role.
 */
import "server-only";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import type { Session } from "next-auth";

export type CurrentUser = Session["user"];

export async function requireRole(
  role: "PharmacyStaff" | "SuperAdmin",
): Promise<CurrentUser> {
  const session = await auth();

  // No session, expired, or token refresh error → sign-in.
  if (!session || session.user.error === "RefreshTokenError") {
    redirect("/auth/sign-in");
  }

  // API marked this user as access-denied → forbidden.
  if (session.user.accessDenied) {
    redirect("/forbidden");
  }

  // Wrong role → forbidden.
  if (session.user.role !== role) {
    redirect("/forbidden");
  }

  return session.user;
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const session = await auth();
  return session?.user ?? null;
}

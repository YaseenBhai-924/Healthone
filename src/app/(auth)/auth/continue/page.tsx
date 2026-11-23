/**
 * /auth/continue — post-Entra landing.
 *
 * Auth.js always returns here after Microsoft sign-in. We read the role that
 * GET /api/admin/me stored on the session, then send the user to the correct
 * portal: PharmacyStaff → /admin, SuperAdmin → /hq.
 */
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { safeReturnPath } from "@/lib/auth/return-url";

interface Props {
  searchParams: Promise<{ callbackUrl?: string }>;
}

export default async function AuthContinuePage({ searchParams }: Props) {
  const session = await auth();
  const params = await searchParams;

  if (!session || session.user.error === "RefreshTokenError") {
    redirect("/auth/sign-in");
  }

  if (session.user.apiError || session.user.accessDenied || !session.user.role) {
    redirect("/forbidden");
  }

  const dest = safeReturnPath(params.callbackUrl ?? null, session.user.role);
  redirect(dest);
}

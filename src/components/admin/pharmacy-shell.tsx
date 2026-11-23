import Link from "next/link";
import { Building2, ClipboardList, ShieldCheck } from "lucide-react";
import { RequestSearch } from "./request-search";
import { NotificationBell } from "./notification-bell";
import { ProfileMenu } from "./profile-menu";

export type PharmacyShellProps = {
  pharmacyName: string;
  userName: string;
  children: React.ReactNode;
};

/**
 * Top-only chrome for pharmacy admin.
 * Pharmacy MVP has a single Orders surface — no sidebar nav.
 */
export function PharmacyShell({
  pharmacyName,
  userName,
  children,
}: PharmacyShellProps) {
  return (
    <div data-density="compact" className="relative min-h-dvh bg-canvas">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-72 sd-mesh opacity-80"
        aria-hidden
      />

      <header className="sticky top-0 z-20 border-b border-line/80 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-7xl items-center gap-3 px-4 py-3 sm:gap-4 sm:px-6 lg:px-8">
          <Link
            href="/admin"
            className="focus-ring flex min-w-0 shrink-0 items-center gap-2.5 rounded-control"
          >
            <span
              className="flex h-10 w-10 items-center justify-center rounded-card bg-gradient-to-br from-brand-600 to-brand-800 text-xs font-bold tracking-wide text-white shadow-[var(--shadow-glow)]"
              aria-hidden
            >
              SD
            </span>
            <span className="hidden min-w-0 sm:block">
              <span className="font-display block truncate text-sm font-extrabold tracking-tight text-heading">
                Script Direct
              </span>
              <span className="mt-0.5 block truncate text-[11px] font-semibold text-brand-700">
                Pharmacy portal
              </span>
            </span>
          </Link>

          <span
            className="hidden h-8 w-px bg-line sm:block"
            aria-hidden
          />

          <div className="hidden min-w-0 items-center gap-2 md:flex">
            <span
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-control bg-brand-100 text-brand-800"
              aria-hidden
            >
              <Building2 className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-heading">
                {pharmacyName}
              </p>
              <p className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-success">
                <ShieldCheck className="h-3 w-3" aria-hidden />
                MFA secured
              </p>
            </div>
          </div>

          <div className="mx-auto hidden min-w-0 w-full max-w-sm flex-1 md:block">
            <RequestSearch compact id="header-request-search" />
          </div>

          <div className="ml-auto flex shrink-0 items-center gap-2">
            <Link
              href="/admin"
              className="focus-ring inline-flex items-center gap-1.5 rounded-badge border border-brand-200 bg-brand-50 px-3 py-1.5 text-xs font-bold text-brand-800 shadow-[var(--shadow-sm)]"
              aria-current="page"
            >
              <ClipboardList className="h-3.5 w-3.5" aria-hidden />
              Orders
            </Link>
            <NotificationBell />
            <ProfileMenu userName={userName} brandLabel={pharmacyName} />
          </div>
        </div>
      </header>

      <main className="relative mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        {children}
      </main>
    </div>
  );
}

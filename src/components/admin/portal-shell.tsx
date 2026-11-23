import { Building2, Lock, LogOut, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { signOutAction } from "@/lib/auth/sign-out-action";
import { NotificationBell } from "./notification-bell";
import { PortalNav, type PortalNavItem } from "./portal-nav";
import { ProfileMenu } from "./profile-menu";

export type PortalShellProps = {
  brandLabel: string;
  subtitle: string;
  roleLabel?: string;
  roleVariant?: "info" | "neutral";
  userName: string;
  navItems: PortalNavItem[];
  navSectionLabel?: string;
  /** Short label shown in the top header (e.g. HQ Admin) */
  headerTitle?: string;
  /** Mark in the sidebar logo tile (defaults to H1) */
  brandMark?: string;
  /** Optional centered search in the top bar */
  topBar?: React.ReactNode;
  /** Optional footer note under the brand card */
  brandFooter?: string;
  /** Show in-app notification bell (pharmacy + HQ). */
  showNotifications?: boolean;
  children: React.ReactNode;
};

/**
 * Shared shell for HQ (/hq). Pharmacy uses PharmacyShell (top chrome only).
 * Same Script Direct tokens as patient surfaces; denser for staff work.
 */
export function PortalShell({
  brandLabel,
  subtitle,
  userName,
  navItems,
  navSectionLabel,
  headerTitle = "HQ Admin",
  brandMark = "H1",
  topBar,
  brandFooter = "Entra ID · signed in as staff",
  showNotifications = true,
  children,
}: PortalShellProps) {
  return (
    <div
      data-density="compact"
      className="min-h-dvh bg-canvas lg:grid lg:grid-cols-[15.5rem_1fr]"
    >
      <aside className="relative z-[1] flex flex-col border-b border-line bg-surface lg:sticky lg:top-0 lg:h-dvh lg:border-b-0 lg:border-r lg:shadow-[var(--shadow-sm)]">
        <div
          className="pointer-events-none absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-brand-600 via-brand-700 to-brand-800"
          aria-hidden
        />

        <div className="relative overflow-hidden border-b border-line px-4 py-5">
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-br from-brand-50 via-white to-surface-muted"
            aria-hidden
          />
          <div className="relative flex items-center gap-3">
            <span
              className="flex h-11 w-11 items-center justify-center rounded-card bg-gradient-to-br from-brand-600 to-brand-800 text-sm font-bold tracking-wide text-white shadow-[var(--shadow-glow)]"
              aria-hidden
            >
              {brandMark}
            </span>
            <div className="min-w-0">
              <p className="font-display truncate text-base font-extrabold tracking-tight text-heading">
                Script Direct
              </p>
              <p className="mt-0.5 truncate text-xs font-semibold text-brand-700">
                {subtitle}
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-5">
          <PortalNav items={navItems} sectionLabel={navSectionLabel} />
        </div>

        <div className="space-y-3 border-t border-line bg-canvas/60 p-3">
          <div className="rounded-card border border-line bg-surface p-3 shadow-[var(--shadow-sm)]">
            <div className="flex items-start gap-2.5">
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-control bg-brand-100 text-brand-800"
                aria-hidden
              >
                <Building2 className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-heading">
                  {brandLabel}
                </p>
                <p className="mt-1 inline-flex items-center gap-1 rounded-badge bg-success-bg px-2 py-0.5 text-[10px] font-bold text-success">
                  <ShieldCheck className="h-3 w-3" aria-hidden />
                  MFA secured
                </p>
              </div>
            </div>
            <p className="mt-2.5 flex items-center gap-1 text-[11px] text-ink-muted">
              <Lock className="h-3 w-3 shrink-0" aria-hidden />
              {brandFooter}
            </p>
          </div>

          <form action={signOutAction}>
            <Button
              type="submit"
              variant="secondary"
              size="sm"
              className="w-full justify-center"
            >
              <LogOut className="h-4 w-4" aria-hidden />
              Sign out
            </Button>
          </form>
        </div>
      </aside>

      <div className="relative flex min-w-0 flex-col">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-72 sd-mesh opacity-80"
          aria-hidden
        />

        <header className="sticky top-0 z-10 border-b border-line/80 bg-white/80 backdrop-blur-md">
          <div className="relative mx-auto flex w-full max-w-7xl items-center gap-4 px-4 py-3 sm:px-6 lg:px-8">
            <div className="hidden min-w-0 shrink-0 items-center gap-2.5 sm:flex">
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-control bg-brand-100 text-brand-800 shadow-[var(--shadow-sm)]"
                aria-hidden
              >
                <ShieldCheck className="h-4 w-4" strokeWidth={2.5} />
              </span>
              <div className="min-w-0">
                <p className="font-display truncate text-base font-bold tracking-tight text-heading sm:text-lg">
                  {headerTitle}
                </p>
                <p className="truncate text-[11px] font-semibold text-brand-700">
                  HealthOne · Super Admin
                </p>
              </div>
            </div>

            <div className="mx-auto min-w-0 w-full max-w-sm flex-1">
              {topBar}
            </div>

            <div className="ml-auto flex shrink-0 items-center gap-2">
              {showNotifications ? <NotificationBell /> : null}
              <ProfileMenu userName={userName} brandLabel={brandLabel} />
            </div>
          </div>
        </header>

        <main className="relative mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}

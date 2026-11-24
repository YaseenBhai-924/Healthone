/**
 * HQ route group layout.
 * /hq/* — requires SuperAdmin session (enforced here so every child page is
 * protected automatically).
 */
import { requireRole } from "@/lib/auth/guards";
import { PortalShell } from "@/components/admin/portal-shell";
import type { PortalNavItem } from "@/components/admin/portal-nav";

const NAV: PortalNavItem[] = [
  { href: "/hq", label: "Dashboard", icon: "layout-dashboard" },
  { href: "/hq/pharmacies", label: "Pharmacies", icon: "building-2" },
  { href: "/hq/clinics", label: "Clinics", icon: "hospital" },
  {
    href: "/hq/price-comparisons",
    label: "Price comparisons",
    icon: "clipboard-list",
  },
];

export default async function HqLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireRole("SuperAdmin");

  return (
    <PortalShell
      brandLabel="HealthOne Super Admin"
      subtitle="HQ Admin"
      headerTitle="HQ Admin"
      brandMark="H1"
      roleLabel="Super admin"
      roleVariant="neutral"
      userName={user.name ?? "HQ user"}
      navItems={NAV}
      navSectionLabel="Main menu"
      brandFooter="Entra ID · Super Admin · read-only orders"
    >
      {children}
    </PortalShell>
  );
}

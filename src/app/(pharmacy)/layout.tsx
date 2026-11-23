/**
 * Pharmacy admin route group layout.
 * /admin/* — requires PharmacyStaff session (enforced here so every child page
 * is protected automatically).
 *
 * Single Orders surface: top chrome only (no sidebar for one nav item).
 */
import { requireRole } from "@/lib/auth/guards";
import { PharmacyShell } from "@/components/admin/pharmacy-shell";

export default async function PharmacyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireRole("PharmacyStaff");

  return (
    <PharmacyShell
      pharmacyName={user.pharmacyName ?? "Pharmacy"}
      userName={user.name ?? "Staff user"}
    >
      {children}
    </PharmacyShell>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  ClipboardList,
  Hospital,
  LayoutDashboard,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/cn";

const ICONS = {
  "clipboard-list": ClipboardList,
  "layout-dashboard": LayoutDashboard,
  "building-2": Building2,
  hospital: Hospital,
} as const satisfies Record<string, LucideIcon>;

export type PortalNavIcon = keyof typeof ICONS;

export type PortalNavItem = {
  href: string;
  label: string;
  icon: PortalNavIcon;
  /** When true, render as non-interactive upcoming item */
  soon?: boolean;
  /** @deprecated Kept for callers; all items share the same interactive treatment. */
  emphasis?: boolean;
};

/** Avoid `/hq` staying active on `/hq/clinics` (prefix false-positive). */
function isNavActive(
  pathname: string,
  href: string,
  allHrefs: string[],
): boolean {
  if (pathname === href) return true;
  if (!pathname.startsWith(`${href}/`)) return false;

  const stolenBySibling = allHrefs.some(
    (other) =>
      other !== href &&
      other.length > href.length &&
      (other === href || other.startsWith(`${href}/`)) &&
      (pathname === other || pathname.startsWith(`${other}/`)),
  );
  return !stolenBySibling;
}

export function PortalNav({
  items,
  sectionLabel = "Main menu",
}: {
  items: PortalNavItem[];
  sectionLabel?: string;
}) {
  const pathname = usePathname();
  const hrefs = items.filter((i) => !i.soon).map((i) => i.href);

  return (
    <nav aria-label="Portal" className="flex flex-col gap-1">
      <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.14em] text-ink-muted">
        {sectionLabel}
      </p>
      {items.map((item) => {
        const Icon = ICONS[item.icon];
        const active = !item.soon && isNavActive(pathname, item.href, hrefs);

        if (item.soon) {
          return (
            <span
              key={item.label}
              className="flex items-center gap-3 rounded-card px-2.5 py-2.5 text-sm font-semibold text-fg-disabled"
              aria-disabled="true"
            >
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-control bg-canvas">
                <Icon className="h-4 w-4" aria-hidden />
              </span>
              <span className="flex-1">{item.label}</span>
              <span className="rounded-badge bg-canvas px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-ink-muted">
                Soon
              </span>
            </span>
          );
        }

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "focus-ring group relative flex items-center gap-3 rounded-card px-2.5 py-2.5 text-sm font-semibold",
              "transition-[color,background-color,box-shadow,transform] duration-150 ease-out",
              "hover:-translate-y-px active:translate-y-0",
              active
                ? "bg-brand-700 text-white shadow-[var(--shadow-md)] hover:bg-brand-800"
                : "text-ink hover:bg-brand-50 hover:text-brand-800 hover:shadow-[var(--shadow-sm)]",
            )}
            aria-current={active ? "page" : undefined}
          >
            <span
              className={cn(
                "pointer-events-none absolute inset-y-2 left-0 w-1 rounded-full transition-colors",
                active ? "bg-sky-300" : "bg-transparent group-hover:bg-brand-300",
              )}
              aria-hidden
            />
            <span
              className={cn(
                "inline-flex h-9 w-9 items-center justify-center rounded-control transition-colors",
                active
                  ? "bg-white/20 text-white"
                  : "bg-brand-50 text-brand-700 group-hover:bg-brand-100",
              )}
            >
              <Icon className="h-4 w-4" aria-hidden />
            </span>
            <span className="flex-1">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

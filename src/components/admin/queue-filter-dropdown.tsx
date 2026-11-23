"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { Check, ChevronDown, Filter } from "lucide-react";
import { QUEUE_FILTERS } from "@/lib/admin/request-labels";
import { cn } from "@/lib/cn";

function filterHref(key: string, search?: string): string {
  const params = new URLSearchParams();
  if (key !== "all") params.set("status", key);
  if (search) params.set("search", search);
  return params.size ? `/admin?${params}` : "/admin";
}

export function QueueFilterDropdown({
  activeKey,
  statusCounts,
  search,
}: {
  activeKey: string;
  statusCounts: Record<string, number>;
  search?: string;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const active =
    QUEUE_FILTERS.find((f) => f.key === activeKey) ?? QUEUE_FILTERS[0]!;
  const total = Object.values(statusCounts).reduce((a, b) => a + b, 0);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        className={cn(
          "focus-ring inline-flex h-9 items-center gap-1.5 rounded-badge border px-3 text-xs font-semibold shadow-[var(--shadow-sm)] transition-colors",
          open
            ? "border-brand-300 bg-brand-50 text-brand-800"
            : "border-line bg-surface text-ink hover:border-brand-200 hover:bg-brand-50/60",
        )}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={menuId}
        onClick={() => setOpen((value) => !value)}
      >
        <Filter className="h-3.5 w-3.5 text-brand-700" aria-hidden />
        {active.label}
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 text-ink-muted transition-transform duration-150",
            open && "rotate-180",
          )}
          aria-hidden
        />
      </button>

      <div
        id={menuId}
        role="listbox"
        aria-label="Filter orders by status"
        className={cn(
          "absolute right-0 z-30 mt-2 w-64 origin-top-right overflow-hidden rounded-card border border-line bg-surface shadow-[var(--shadow-lg)] transition-[opacity,transform,visibility] duration-150 ease-out",
          open
            ? "visible translate-y-0 opacity-100"
            : "invisible -translate-y-1 opacity-0",
        )}
      >
        <div className="border-b border-line bg-canvas/80 px-3 py-2">
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-ink-muted">
            Status filter
          </p>
        </div>
        <ul className="max-h-80 overflow-y-auto p-1.5">
          {QUEUE_FILTERS.map((filter) => {
            const count =
              filter.status === null
                ? total
                : (statusCounts[filter.status] ?? 0);
            const selected = activeKey === filter.key;
            return (
              <li key={filter.key}>
                <Link
                  href={filterHref(filter.key, search)}
                  role="option"
                  aria-selected={selected}
                  className={cn(
                    "focus-ring flex items-center gap-2 rounded-control px-2.5 py-2 text-sm transition-colors",
                    selected
                      ? "bg-brand-50 font-semibold text-brand-800"
                      : "text-ink hover:bg-canvas",
                  )}
                  onClick={() => setOpen(false)}
                >
                  <span className="min-w-0 flex-1 truncate">{filter.label}</span>
                  <span
                    className={cn(
                      "rounded-badge px-2 py-0.5 text-[11px] font-bold tabular-nums",
                      selected
                        ? "bg-brand-100 text-brand-800"
                        : "bg-canvas text-ink-muted",
                    )}
                  >
                    {count}
                  </span>
                  {selected ? (
                    <Check
                      className="h-4 w-4 shrink-0 text-brand-700"
                      aria-hidden
                    />
                  ) : (
                    <span className="w-4 shrink-0" aria-hidden />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

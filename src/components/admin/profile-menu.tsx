"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ChevronDown, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { signOutAction } from "@/lib/auth/sign-out-action";
import { cn } from "@/lib/cn";

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0]}${parts[parts.length - 1]![0]}`.toUpperCase();
}

export function ProfileMenu({
  userName,
  brandLabel,
}: {
  userName: string;
  brandLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

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
    <div ref={rootRef} className="relative w-52 shrink-0">
      <div
        className={cn(
          "relative z-20 w-full overflow-hidden border border-subtle bg-surface transition-[border-radius,box-shadow] duration-200 ease-out",
          open
            ? "rounded-t-control rounded-b-none border-b-0 shadow-[var(--shadow-md)]"
            : "rounded-control shadow-[var(--shadow-sm)]",
        )}
      >
        <button
          type="button"
          className="focus-ring flex w-full cursor-pointer items-center gap-2.5 px-2 py-1.5"
          aria-expanded={open}
          aria-controls={menuId}
          aria-haspopup="menu"
          onClick={() => setOpen((value) => !value)}
        >
          <span
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-control bg-brand-100 text-xs font-bold text-brand-800"
            aria-hidden
          >
            {initials(userName)}
          </span>
          <span className="min-w-0 flex-1 truncate text-left text-sm font-medium text-fg-secondary">
            {userName}
          </span>
          <ChevronDown
            className={cn(
              "h-4 w-4 shrink-0 text-fg-muted transition-transform duration-200 ease-out",
              open && "rotate-180",
            )}
            aria-hidden
          />
        </button>
      </div>

      <div
        id={menuId}
        role="menu"
        className={cn(
          "absolute top-full left-0 z-20 w-full origin-top overflow-hidden border border-subtle border-t-0 bg-surface shadow-[var(--shadow-md)] transition-[opacity,transform,visibility] duration-200 ease-out",
          open
            ? "visible translate-y-0 rounded-b-control opacity-100"
            : "invisible -translate-y-1 rounded-b-control opacity-0",
        )}
      >
        <div className="border-t border-subtle px-1.5 pt-1.5 pb-1.5">
          <p className="truncate px-2.5 py-1 text-xs text-fg-muted">
            {brandLabel}
          </p>
          <form action={signOutAction}>
            <Button
              type="submit"
              variant="ghost"
              size="sm"
              role="menuitem"
              className="h-9 w-full justify-start px-2.5"
            >
              <LogOut className="h-4 w-4 shrink-0" aria-hidden />
              Sign out
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

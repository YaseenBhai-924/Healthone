"use client";

import Link from "next/link";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Bell } from "lucide-react";
import {
  loadNotificationsAction,
  markNotificationsReadAction,
} from "@/lib/admin/notification-actions";
import type { StaffNotificationItem } from "@/lib/api/admin-notifications";
import { cn } from "@/lib/cn";

const POLL_MS = 45_000;

function formatWhen(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleString("en-AU", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

export function NotificationBell({
  initialUnread = 0,
}: {
  initialUnread?: number;
}) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<StaffNotificationItem[]>([]);
  const [unread, setUnread] = useState(initialUnread);
  const [loading, setLoading] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  const refresh = useCallback(async () => {
    setLoading(true);
    const result = await loadNotificationsAction();
    setLoading(false);
    if (!result.ok) return;
    setItems(result.data.items);
    setUnread(result.data.unreadCount);
  }, []);

  useEffect(() => {
    void refresh();
    const id = window.setInterval(() => void refresh(), POLL_MS);
    return () => window.clearInterval(id);
  }, [refresh]);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
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

  async function openPanel() {
    const next = !open;
    setOpen(next);
    if (!next) return;

    const result = await loadNotificationsAction();
    if (result.ok) {
      setItems(result.data.items);
      setUnread(result.data.unreadCount);
      if (result.data.unreadCount > 0) {
        await markNotificationsReadAction();
        setUnread(0);
        setItems(result.data.items.map((i) => ({ ...i, isRead: true })));
      }
    }
  }

  return (
    <div ref={rootRef} className="relative shrink-0">
      <button
        type="button"
        className="focus-ring relative flex h-10 w-10 items-center justify-center rounded-control border border-subtle bg-surface text-fg-secondary shadow-[var(--shadow-sm)] hover:bg-surface-muted"
        aria-expanded={open}
        aria-controls={menuId}
        aria-haspopup="menu"
        aria-label={
          unread > 0
            ? `Notifications, ${unread} unread`
            : "Notifications"
        }
        onClick={() => void openPanel()}
      >
        <Bell className="h-4 w-4" aria-hidden />
        {unread > 0 ? (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger-fg px-1 text-[10px] font-bold text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        ) : null}
      </button>

      {open ? (
        <div
          id={menuId}
          role="menu"
          className="absolute right-0 z-30 mt-2 w-[22rem] max-w-[calc(100vw-2rem)] overflow-hidden rounded-card border border-subtle bg-surface shadow-[var(--shadow-md)]"
        >
          <div className="flex items-center justify-between border-b border-subtle px-3 py-2">
            <p className="text-sm font-bold text-heading">Notifications</p>
            {loading ? (
              <span className="text-xs text-fg-muted">Updating…</span>
            ) : null}
          </div>

          <ul className="max-h-80 overflow-y-auto">
            {items.length === 0 ? (
              <li className="px-3 py-6 text-center text-sm text-fg-muted">
                No notifications yet.
              </li>
            ) : (
              items.map((item) => (
                <li key={item.id} role="none">
                  <Link
                    role="menuitem"
                    href={item.href}
                    className={cn(
                      "block border-b border-subtle px-3 py-2.5 last:border-b-0 hover:bg-surface-muted",
                      !item.isRead && "bg-brand-50/40",
                    )}
                    onClick={() => setOpen(false)}
                  >
                    <p className="text-sm font-medium text-heading">
                      {item.message}
                    </p>
                    <p className="mt-0.5 text-xs text-fg-muted">
                      {item.reference ? (
                        <span className="font-mono">{item.reference}</span>
                      ) : null}
                      {item.reference ? " · " : null}
                      {formatWhen(item.createdAt)}
                    </p>
                  </Link>
                </li>
              ))
            )}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

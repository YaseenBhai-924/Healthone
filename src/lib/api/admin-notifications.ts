/**
 * Server-only staff notification API helpers (pharmacy + HQ in-app feed).
 * Bearer stays on the server via apiFetch — never reaches the browser.
 */
import "server-only";

import { apiFetch, type ApiResult } from "@/lib/api/server-client";

export type StaffNotificationType = "NewRequest" | "RefundFailed";

export type StaffNotificationItem = {
  id: string;
  type: StaffNotificationType;
  reference: string | null;
  message: string;
  href: string;
  createdAt: string;
  isRead: boolean;
  pharmacyId: string;
};

export type StaffNotificationList = {
  items: StaffNotificationItem[];
  unreadCount: number;
};

export function listNotifications(
  take = 30,
): Promise<ApiResult<StaffNotificationList>> {
  return apiFetch<StaffNotificationList>(
    `/api/admin/notifications?take=${take}`,
  );
}

export function getUnreadCount(): Promise<
  ApiResult<{ unreadCount: number }>
> {
  return apiFetch<{ unreadCount: number }>(
    "/api/admin/notifications/unread-count",
  );
}

export function markNotificationsRead(
  ids?: string[],
): Promise<ApiResult<void>> {
  return apiFetch<void>("/api/admin/notifications/read", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ids: ids ?? null }),
  });
}

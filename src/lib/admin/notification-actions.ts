"use server";

import { revalidatePath } from "next/cache";
import {
  listNotifications,
  markNotificationsRead,
  type StaffNotificationList,
} from "@/lib/api/admin-notifications";

export type NotificationActionResult =
  | { ok: true; data: StaffNotificationList }
  | { ok: false; message: string };

export async function loadNotificationsAction(): Promise<NotificationActionResult> {
  const result = await listNotifications(30);
  if (result.status === "ok") return { ok: true, data: result.data };
  if (result.status === "unauthorized")
    return { ok: false, message: "Session expired. Sign in again." };
  if (result.status === "forbidden")
    return { ok: false, message: "You do not have access to notifications." };
  return { ok: false, message: "Could not load notifications." };
}

export async function markNotificationsReadAction(
  ids?: string[],
): Promise<{ ok: true } | { ok: false; message: string }> {
  const result = await markNotificationsRead(ids);
  if (result.status === "ok") {
    revalidatePath("/admin");
    revalidatePath("/hq");
    return { ok: true };
  }
  if (result.status === "unauthorized")
    return { ok: false, message: "Session expired. Sign in again." };
  return { ok: false, message: "Could not update notifications." };
}

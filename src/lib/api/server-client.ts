/**
 * Server-only typed API client.
 *
 * apiFetch<T>(path, init?) calls the internal API with:
 *  - Bearer token from the encrypted session JWT (read via @auth/core/jwt).
 *  - X-Correlation-ID forwarded from the incoming request headers.
 *  - Accept: application/json
 *  - cache: no-store
 *  - AbortController timeout (default 20s; override with API_FETCH_TIMEOUT_MS).
 *
 * Returns a discriminated union so callers handle all status classes
 * without catching raw errors:
 *   ok | notFound | conflict | invalid | unauthorized | forbidden | unavailable
 *
 * Security constraints enforced here:
 *  - Refuses absolute URLs outside API_BASE_URL origin.
 *  - Never forwards cookies to the API (Bearer only).
 *  - Never exposes raw API error details to the browser.
 */
import "server-only";

import { headers } from "next/headers";
import { getAccessToken } from "@/auth";
import { getServerConfig } from "@/lib/config";

// ─── Result type ──────────────────────────────────────────────────────────────

export type ApiOk<T> = { status: "ok"; data: T };
export type ApiNotFound = { status: "notFound" };
export type ApiConflict = { status: "conflict"; message: string };
export type ApiInvalid = { status: "invalid"; message: string };
export type ApiGone = { status: "gone"; message: string };
export type ApiUnauthorized = { status: "unauthorized" };
export type ApiForbidden = { status: "forbidden" };
export type ApiUnavailable = { status: "unavailable" };

export type ApiResult<T> =
  | ApiOk<T>
  | ApiNotFound
  | ApiConflict
  | ApiInvalid
  | ApiGone
  | ApiUnauthorized
  | ApiForbidden
  | ApiUnavailable;

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function readProblemMessage(
  res: Response,
  fallback: string,
): Promise<string> {
  try {
    const body = (await res.json()) as { detail?: string; title?: string };
    if (body.detail) return body.detail;
    if (body.title) return body.title;
  } catch {
    /* ignore */
  }
  return fallback;
}

function mapHttpStatus(status: number, message?: string): ApiResult<never> {
  if (status === 401) return { status: "unauthorized" };
  if (status === 403) return { status: "forbidden" };
  if (status === 404) return { status: "notFound" };
  if (status === 409)
    return { status: "conflict", message: message ?? "Conflict" };
  if (status === 410)
    return { status: "gone", message: message ?? "This resource is no longer available." };
  if (status === 422)
    return { status: "invalid", message: message ?? "Validation error" };
  return { status: "unavailable" };
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function apiFetch<T>(
  path: string,
  init: Omit<RequestInit, "cache"> = {},
): Promise<ApiResult<T>> {
  const config = getServerConfig();

  // Reject absolute URLs outside API_BASE_URL origin (never throw to callers).
  if (/^https?:\/\//i.test(path)) {
    try {
      const reqOrigin = new URL(path).origin;
      const baseOrigin = new URL(config.API_BASE_URL).origin;
      if (reqOrigin !== baseOrigin) return { status: "unavailable" };
    } catch {
      return { status: "unavailable" };
    }
  }

  const url = path.startsWith("http")
    ? path
    : `${config.API_BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;

  const accessToken = await getAccessToken();
  const correlationId = (await headers()).get("x-correlation-id") ?? crypto.randomUUID();

  const controller = new AbortController();
  // 20s covers LocalDB wake-up and the first Entra JWKS download on a cold host.
  const timeoutMs = Number(process.env.API_FETCH_TIMEOUT_MS) || 20_000;
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      ...init,
      cache: "no-store",
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "X-Correlation-ID": correlationId,
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        // Spread caller headers last so they can override Content-Type etc.
        // but never forward cookies.
        ...Object.fromEntries(
          Object.entries(
            (init.headers as Record<string, string> | undefined) ?? {},
          ).filter(([k]) => k.toLowerCase() !== "cookie"),
        ),
      },
    });

    if (res.ok) {
      // POSTs such as status/reject/token-copied return 204 No Content.
      if (res.status === 204) {
        return { status: "ok", data: undefined as T };
      }
      const text = await res.text();
      if (!text) {
        return { status: "ok", data: undefined as T };
      }
      try {
        return { status: "ok", data: JSON.parse(text) as T };
      } catch {
        if (process.env.NODE_ENV === "development") {
          console.error(`[apiFetch] Invalid JSON from ${url} (${res.status})`);
        }
        return { status: "unavailable" };
      }
    }

    if (res.status === 409 || res.status === 410 || res.status === 422) {
      const fallback =
        res.status === 409
          ? "Conflict"
          : res.status === 410
            ? "This resource is no longer available."
            : "Validation error";
      const message = await readProblemMessage(res, fallback);
      return mapHttpStatus(res.status, message);
    }

    if (process.env.NODE_ENV === "development") {
      console.error(`[apiFetch] ${init.method ?? "GET"} ${url} → ${res.status}`);
    }
    return mapHttpStatus(res.status);
  } catch (err) {
    if (process.env.NODE_ENV === "development") {
      const reason =
        err instanceof Error && err.name === "AbortError"
          ? `timeout (${timeoutMs}ms)`
          : err instanceof Error
            ? err.message
            : "unknown error";
      console.error(`[apiFetch] ${init.method ?? "GET"} ${url} failed: ${reason}`);
    }
    if (err instanceof Error && err.name === "AbortError") {
      return { status: "unavailable" };
    }
    // Never expose internal errors to callers; return unavailable.
    return { status: "unavailable" };
  } finally {
    clearTimeout(timeout);
  }
}

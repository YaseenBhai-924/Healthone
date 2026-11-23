/**
 * safeReturnPath — validate a raw callback URL for post-sign-in redirect.
 *
 * Accepts only a same-origin relative path that starts with a single slash and
 * begins with /admin (PharmacyStaff) and/or /hq (SuperAdmin).
 *
 * When role is known, only that role's prefix is allowed and the default home
 * is /admin (PharmacyStaff) or /hq (SuperAdmin). When role is null (pre-auth),
 * both prefixes are allowed so /auth/continue can carry the intended path
 * until the role from GET /api/admin/me is known.
 */

/** Portal home for a resolved staff role. */
export function portalHome(
  role: "PharmacyStaff" | "SuperAdmin",
): "/admin" | "/hq" {
  return role === "SuperAdmin" ? "/hq" : "/admin";
}

const STAFF_PREFIXES = ["/admin", "/hq"] as const;

function roleHome(role: "PharmacyStaff" | "SuperAdmin" | null): string {
  if (role === "SuperAdmin" || role === "PharmacyStaff") {
    return portalHome(role);
  }
  // Pre-auth placeholder only — /auth/continue replaces this with role home.
  return "/admin";
}

function allowedPrefixes(
  role: "PharmacyStaff" | "SuperAdmin" | null,
): readonly string[] {
  if (role === "SuperAdmin") return ["/hq"];
  if (role === "PharmacyStaff") return ["/admin"];
  return STAFF_PREFIXES;
}

function isHostile(raw: string): boolean {
  if (raw.length > 2048) return true;
  // Control chars (CR/LF/TAB) raw or percent-encoded.
  if (/[\r\n\t]/.test(raw)) return true;
  if (/%0[dDaA]|%09/.test(raw)) return true;
  // Backslash (raw or encoded) — used in open-redirect tricks.
  if (raw.includes("\\") || /%5[cC]/.test(raw)) return true;
  // Protocol-relative or encoded double-slash after first slash.
  if (raw.startsWith("//") || raw.startsWith("/\\")) return true;
  if (/^\/(%2[fF]){2}/.test(raw)) return true;
  if (/^\/\\/.test(raw) || /^\/\//.test(raw)) return true;
  // Dangerous schemes.
  if (/^(javascript|data|vbscript):/i.test(raw)) return true;
  if (/^\/(javascript|data|vbscript):/i.test(raw)) return true;
  // Embedded credentials in absolute URLs are handled by URL parsing below.
  return false;
}

function pathStartsWithRoleHome(path: string, prefix: string): boolean {
  return path === prefix || path.startsWith(`${prefix}/`) || path.startsWith(`${prefix}?`);
}

function matchesAllowedPrefix(
  path: string,
  prefixes: readonly string[],
): boolean {
  return prefixes.some((prefix) => pathStartsWithRoleHome(path, prefix));
}

export function safeReturnPath(
  raw: string | null | undefined,
  role: "PharmacyStaff" | "SuperAdmin" | null,
): string {
  const home = roleHome(role);
  const prefixes = allowedPrefixes(role);

  if (raw == null || raw === "") return home;
  if (isHostile(raw)) return home;

  // Absolute URL: only same origin as SITE_URL, then take pathname+search.
  try {
    const url = new URL(raw);
    if (url.username || url.password) return home;

    const siteUrl = process.env.SITE_URL;
    if (!siteUrl) return home;

    let siteOrigin: string;
    try {
      siteOrigin = new URL(siteUrl).origin;
    } catch {
      return home;
    }

    if (url.origin !== siteOrigin) return home;

    const relative = `${url.pathname}${url.search}`;
    if (!matchesAllowedPrefix(relative, prefixes)) return home;
    return relative;
  } catch {
    // Not absolute — continue as relative.
  }

  // Relative: single leading slash, no second slash, role prefix required.
  if (!raw.startsWith("/") || raw.startsWith("//")) return home;
  if (!matchesAllowedPrefix(raw, prefixes)) return home;

  // Reject encoded path tricks that decode to // or \.
  try {
    const decoded = decodeURIComponent(raw);
    if (isHostile(decoded) || decoded.startsWith("//") || decoded.includes("\\")) return home;
  } catch {
    return home;
  }

  return raw;
}

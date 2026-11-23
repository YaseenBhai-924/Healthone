const STORAGE_KEY = 'sd-status-token'

/** Keep the status token in sessionStorage only — never in URLs or logs. */
export function storeStatusToken(token: string): void {
  if (typeof window === 'undefined') return
  sessionStorage.setItem(STORAGE_KEY, token)
}

export function readStoredStatusToken(): string | null {
  if (typeof window === 'undefined') return null
  return sessionStorage.getItem(STORAGE_KEY)
}

export function clearStoredStatusToken(): void {
  if (typeof window === 'undefined') return
  sessionStorage.removeItem(STORAGE_KEY)
}

/**
 * Read token from `#fragment`, strip it from the address bar, and persist
 * to sessionStorage so refresh still works without leaking the token.
 */
export function claimStatusTokenFromHash(): string | null {
  if (typeof window === 'undefined') return null
  const hash = window.location.hash.replace(/^#/, '').trim()
  if (hash) {
    const url = new URL(window.location.href)
    url.hash = ''
    window.history.replaceState(null, '', url.pathname + url.search)
    storeStatusToken(hash)
    return hash
  }
  return readStoredStatusToken()
}

import { afterEach, describe, expect, it } from 'vitest'
import {
  claimStatusTokenFromHash,
  clearStoredStatusToken,
  readStoredStatusToken,
  storeStatusToken,
} from './status-token'

afterEach(() => {
  clearStoredStatusToken()
  window.history.replaceState(null, '', '/status')
})

describe('status token helpers', () => {
  it('stores and reads from sessionStorage', () => {
    storeStatusToken('tok-abc')
    expect(readStoredStatusToken()).toBe('tok-abc')
  })

  it('claims the hash fragment and clears it from the URL', () => {
    window.history.replaceState(null, '', '/status#secret-token')
    const token = claimStatusTokenFromHash()
    expect(token).toBe('secret-token')
    expect(window.location.hash).toBe('')
    expect(readStoredStatusToken()).toBe('secret-token')
  })

  it('falls back to sessionStorage when hash is empty', () => {
    storeStatusToken('persisted')
    window.history.replaceState(null, '', '/status')
    expect(claimStatusTokenFromHash()).toBe('persisted')
  })
})

import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useTypeIn } from './use-type-in'

describe('useTypeIn', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('reveals the text one character at a time', () => {
    const { result } = renderHook(() =>
      useTypeIn('ABC', { delayMs: 100, stepMs: 50 }),
    )
    expect(result.current).toEqual({ visible: '', done: false })

    act(() => {
      vi.advanceTimersByTime(100 + 50)
    })
    expect(result.current.visible).toBe('A')

    act(() => {
      vi.advanceTimersByTime(50 * 3)
    })
    expect(result.current).toEqual({ visible: 'ABC', done: true })
  })

  it('restarts when the restart key changes', () => {
    const { result, rerender } = renderHook(
      ({ k }) => useTypeIn('AB', { restartKey: k, delayMs: 0, stepMs: 10 }),
      { initialProps: { k: 0 } },
    )
    act(() => {
      vi.advanceTimersByTime(100)
    })
    expect(result.current.done).toBe(true)

    rerender({ k: 1 })
    expect(result.current.visible).toBe('')
  })

  it('shows the full text immediately under reduced motion', () => {
    window.matchMedia = ((query: string) => ({
      matches: true,
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
    })) as unknown as typeof window.matchMedia
    const { result } = renderHook(() => useTypeIn('ABC'))
    expect(result.current).toEqual({ visible: 'ABC', done: true })
    // @ts-expect-error cleanup of the test shim
    delete window.matchMedia
  })
})

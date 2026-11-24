import { describe, expect, it } from 'vitest'
import { isStaticDemo } from './is-static-demo'

describe('isStaticDemo', () => {
  it('defaults on outside production', () => {
    expect(isStaticDemo({ NODE_ENV: 'development' })).toBe(true)
  })

  it('respects explicit off', () => {
    expect(isStaticDemo({ NODE_ENV: 'development', STATIC_DEMO: '0' })).toBe(
      false,
    )
  })

  it('defaults off in production unless enabled', () => {
    expect(isStaticDemo({ NODE_ENV: 'production' })).toBe(false)
    expect(isStaticDemo({ NODE_ENV: 'production', STATIC_DEMO: '1' })).toBe(
      true,
    )
  })
})

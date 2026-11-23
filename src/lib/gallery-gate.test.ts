import { describe, it, expect } from 'vitest'
import { isComponentGalleryEnabled } from './gallery-gate'

describe('isComponentGalleryEnabled', () => {
  it('is true in development', () => {
    expect(isComponentGalleryEnabled({ NODE_ENV: 'development' })).toBe(true)
  })

  it('is true when COMPONENT_GALLERY_ENABLED=true', () => {
    expect(
      isComponentGalleryEnabled({
        NODE_ENV: 'production',
        COMPONENT_GALLERY_ENABLED: 'true',
      }),
    ).toBe(true)
  })

  it('is false in production without the flag', () => {
    expect(isComponentGalleryEnabled({ NODE_ENV: 'production' })).toBe(false)
    expect(
      isComponentGalleryEnabled({
        NODE_ENV: 'production',
        COMPONENT_GALLERY_ENABLED: '',
      }),
    ).toBe(false)
  })
})

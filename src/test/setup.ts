/// <reference types="vitest/globals" />
import '@testing-library/jest-dom'
import { expect } from 'vitest'
import * as axeMatchers from 'vitest-axe/matchers'

expect.extend(axeMatchers)

// axe colour-contrast checks call canvas; jsdom has no implementation.
HTMLCanvasElement.prototype.getContext = vi.fn() as never

// jsdom does not implement HTMLDialogElement methods.
if (typeof HTMLDialogElement !== 'undefined') {
  HTMLDialogElement.prototype.showModal = vi.fn(function (this: HTMLDialogElement) {
    this.setAttribute('open', '')
  })

  HTMLDialogElement.prototype.close = vi.fn(function (this: HTMLDialogElement) {
    this.removeAttribute('open')
    this.dispatchEvent(new Event('close'))
  })
}

import { TextDecoder, TextEncoder } from 'node:util'

// jsdom doesn't expose these Node globals; react-router-dom needs them.
if (typeof globalThis.TextEncoder === 'undefined') {
  // @ts-expect-error -- test-only polyfill
  globalThis.TextEncoder = TextEncoder
}
if (typeof globalThis.TextDecoder === 'undefined') {
  // @ts-expect-error -- test-only polyfill
  globalThis.TextDecoder = TextDecoder
}

import '@testing-library/jest-dom'

// jsdom doesn't implement ResizeObserver; the map components observe their
// container to keep mapbox-gl's canvas sized correctly.
// jsdom doesn't implement scrollIntoView; the custom Select dropdown calls it
// to keep the focused option visible.
if (typeof Element.prototype.scrollIntoView === 'undefined') {
  Element.prototype.scrollIntoView = () => {}
}

if (typeof globalThis.ResizeObserver === 'undefined') {
  class ResizeObserverStub {
    observe() {}
    unobserve() {}
    disconnect() {}
  }

  // @ts-expect-error -- test-only polyfill
  globalThis.ResizeObserver = ResizeObserverStub
}

import '@testing-library/jest-dom/vitest'
import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

afterEach(() => cleanup())

// jsdom não implementa estas APIs usadas pelo Motion, Sheet e pela cena de scroll
class IO {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return []
  }
}
globalThis.IntersectionObserver ??= IO as unknown as typeof IntersectionObserver
globalThis.ResizeObserver ??= IO as unknown as typeof ResizeObserver
window.matchMedia ??= ((query: string) => ({
  matches: query.includes('reduce'),
  media: query,
  onchange: null,
  addListener: () => {},
  removeListener: () => {},
  addEventListener: () => {},
  removeEventListener: () => {},
  dispatchEvent: () => false,
})) as typeof window.matchMedia
window.scrollTo = () => {}
HTMLMediaElement.prototype.pause = () => {}
HTMLMediaElement.prototype.play = () => Promise.resolve()

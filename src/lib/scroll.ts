/**
 * Preferência de movimento da página.
 * A rolagem é nativa (roda no compositor): o Lenis foi removido porque amarrava
 * cada quadro de rolagem ao thread principal e causava solavancos em aparelhos
 * mais modestos (medido com scripts/perf-frames.mjs). A cena AtelierCraft usa
 * GSAP ScrollTrigger com `scrub`, que já suaviza o avanço dos quadros.
 * `?movimento=1` força animações mesmo com "reduzir movimento" ligado (demonstração).
 */
import { useSyncExternalStore } from 'react'

export const forceMotion = () => typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('movimento') === '1'

const QUERY = '(prefers-reduced-motion: reduce)'

function subscribe(cb: () => void) {
  const mq = window.matchMedia(QUERY)
  mq.addEventListener?.('change', cb)
  return () => mq.removeEventListener?.('change', cb)
}

/** true quando a página pode animar (sem preferência de movimento reduzido, ou forçado por ?movimento=1). */
export function useCanAnimate() {
  return useSyncExternalStore(
    subscribe,
    () => forceMotion() || !window.matchMedia(QUERY).matches,
    () => false,
  )
}

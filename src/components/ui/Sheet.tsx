import { useEffect, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'motion/react'
import { ease, easeIn } from './motion'

type Side = 'right' | 'center' | 'left'

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

let scrollbarWidth = 0

/** Curva de gaveta: arranca rápido e assenta devagar, sem quique */
const drawerEase = [0.32, 0.72, 0, 1] as const

// `transform` como string (e não x/y) roda via WAAPI no compositor: o deslize
// continua fluido mesmo que o thread principal esteja ocupado montando o painel.
const panelMotion: Record<Side, object> = {
  right: {
    initial: { transform: 'translateX(100%)' },
    animate: { transform: 'translateX(0%)', transition: { duration: 0.5, ease: drawerEase } },
    exit: { transform: 'translateX(100%)', transition: { duration: 0.3, ease: easeIn } },
  },
  left: {
    initial: { transform: 'translateX(-100%)' },
    animate: { transform: 'translateX(0%)', transition: { duration: 0.5, ease: drawerEase } },
    exit: { transform: 'translateX(-100%)', transition: { duration: 0.3, ease: easeIn } },
  },
  center: {
    initial: { opacity: 0, transform: 'translateY(28px)' },
    animate: { opacity: 1, transform: 'translateY(0px)', transition: { duration: 0.45, ease } },
    exit: { opacity: 0, transform: 'translateY(14px)', transition: { duration: 0.2 } },
  },
}

const panelClass: Record<Side, string> = {
  right: 'ml-auto h-full w-full max-w-[460px] sm:rounded-l-[28px]',
  left: 'mr-auto h-full w-full max-w-sm',
  center: 'mx-auto mt-auto max-h-[94dvh] w-full max-w-6xl rounded-t-[28px] md:my-auto md:max-h-[90dvh] md:w-[calc(100%-3rem)] md:rounded-[28px]',
}

/**
 * Diálogo modal acessível: prende o foco, fecha com Esc ou clique no fundo,
 * trava a rolagem e devolve o foco a quem o abriu.
 */
export function Sheet({
  open,
  onClose,
  side = 'center',
  labelledBy,
  children,
  className = '',
}: {
  open: boolean
  onClose: () => void
  side?: Side
  labelledBy: string
  children: ReactNode
  className?: string
}) {
  const panelRef = useRef<HTMLDivElement>(null)
  const onCloseRef = useRef(onClose)
  useEffect(() => {
    onCloseRef.current = onClose
  })

  // Mede a barra de rolagem com o diálogo fechado (layout já limpo) para não
  // forçar um layout da página inteira no quadro em que o painel monta.
  useEffect(() => {
    if (open) return
    const measure = () => {
      scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
    }
    measure()
    window.addEventListener('resize', measure, { passive: true })
    return () => window.removeEventListener('resize', measure)
  }, [open])

  useEffect(() => {
    if (!open) return
    const previous = document.activeElement as HTMLElement | null
    const root = document.documentElement
    root.style.overflow = 'hidden'
    root.style.paddingRight = `${scrollbarWidth}px`

    // Um quadro depois da montagem, quando o deslize já roda no compositor:
    // o foco não deve rolar nada.
    const focusFirst = requestAnimationFrame(() => {
      const panel = panelRef.current
      const target = panel?.querySelector<HTMLElement>('[data-autofocus]') ?? panel?.querySelector<HTMLElement>(FOCUSABLE)
      ;(target ?? panel)?.focus({ preventScroll: true })
    })

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        onCloseRef.current()
        return
      }
      if (e.key !== 'Tab' || !panelRef.current) return
      const items = [...panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((el) => el.getClientRects().length > 0)
      if (items.length === 0) return
      const first = items[0]
      const last = items[items.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKey)

    return () => {
      cancelAnimationFrame(focusFirst)
      document.removeEventListener('keydown', onKey)
      root.style.overflow = ''
      root.style.paddingRight = ''
      previous?.focus?.({ preventScroll: true })
    }
  }, [open])

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[70] flex">
          <motion.div
            className="absolute inset-0 bg-espresso/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.4 } }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={labelledBy}
            tabIndex={-1}
            className={`relative flex flex-col overflow-hidden bg-ivory shadow-lift outline-none ${panelClass[side]} ${className}`}
            {...panelMotion[side]}
          >
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  )
}

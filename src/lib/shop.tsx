/**
 * Estado da boutique, dividido em contextos para que abrir a sacola ou o
 * detalhe não re-renderize a vitrine inteira:
 * - ações (estáveis): useShopActions
 * - sacola, totais e preferências: useBag
 * - painéis abertos: useShopUI
 * - filtros da vitrine: useCatalogFilter
 * - prefill da consultoria: useStylingPrefill
 * A sacola não faz checkout: monta um pedido enviado pelo WhatsApp.
 */
import { createContext, useContext, useEffect, useMemo, useReducer, useState, type ReactNode } from 'react'
import type { CategoryId } from '../data/categories'
import type { Size } from '../data/products'
import { bagReducer, computeTotals, sanitizeBag, type BagAction, type BagLine, type BagTotals, type CheckoutPrefs } from './bag'

export const BAG_KEY = 'aura-atelier:sacola'
const PREFS_KEY = 'aura-atelier:preferencias'

export interface StylingPrefill {
  occasion?: string
  size?: Size
  notes?: string
  tick: number
}

function read<T>(key: string, fallback: T, parse: (v: unknown) => T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? parse(JSON.parse(raw)) : fallback
  } catch {
    return fallback
  }
}

const defaultPrefs: CheckoutPrefs = { payment: 'pix', shipping: 'economico', name: '', cep: '' }

const parsePrefs = (v: unknown): CheckoutPrefs => {
  const p = (v ?? {}) as Partial<CheckoutPrefs>
  return {
    payment: p.payment === 'cartao' || p.payment === 'combinar' ? p.payment : 'pix',
    shipping: p.shipping === 'expresso' ? 'expresso' : 'economico',
    name: typeof p.name === 'string' ? p.name.slice(0, 60) : '',
    cep: typeof p.cep === 'string' ? p.cep.slice(0, 9) : '',
  }
}

interface ShopActions {
  dispatchBag: (action: BagAction) => void
  addToBag: (slug: string, size: Size, color: string, quantity?: number) => void
  addLook: (lines: BagLine[]) => void
  setPrefs: (patch: Partial<CheckoutPrefs>) => void
  setBagOpen: (open: boolean) => void
  openProduct: (slug: string | null) => void
  setCategory: (c: CategoryId) => void
  setSizeFilter: (s: Size | 'todos') => void
  requestStyling: (p: Omit<StylingPrefill, 'tick'>) => void
}

interface BagState {
  bag: BagLine[]
  totals: BagTotals
  prefs: CheckoutPrefs
  lastAdded: { lines: BagLine[]; tick: number } | null
}

interface UIState {
  bagOpen: boolean
  openSlug: string | null
}

interface FilterState {
  category: CategoryId
  sizeFilter: Size | 'todos'
}

const ActionsContext = createContext<ShopActions | null>(null)
const BagContext = createContext<BagState | null>(null)
const UIContext = createContext<UIState | null>(null)
const FilterContext = createContext<FilterState | null>(null)
const StylingContext = createContext<StylingPrefill | null>(null)

export function ShopProvider({ children }: { children: ReactNode }) {
  const [bag, dispatchBag] = useReducer(bagReducer, undefined, () => read(BAG_KEY, [], sanitizeBag))
  const [prefs, setPrefsState] = useState<CheckoutPrefs>(() => read(PREFS_KEY, defaultPrefs, parsePrefs))
  const [lastAdded, setLastAdded] = useState<BagState['lastAdded']>(null)
  const [bagOpen, setBagOpen] = useState(false)
  const [openSlug, openProduct] = useState<string | null>(null)
  const [category, setCategory] = useState<CategoryId>('todos')
  const [sizeFilter, setSizeFilter] = useState<Size | 'todos'>('todos')
  const [stylingPrefill, setStylingPrefill] = useState<StylingPrefill | null>(null)

  useEffect(() => {
    try {
      localStorage.setItem(BAG_KEY, JSON.stringify(bag))
    } catch {
      /* armazenamento indisponível: a sacola vale só para esta visita */
    }
  }, [bag])

  useEffect(() => {
    try {
      localStorage.setItem(PREFS_KEY, JSON.stringify(prefs))
    } catch {
      /* idem */
    }
  }, [prefs])

  // Todas as funções são estáveis (setters do React), então este objeto nunca muda
  const actions = useMemo<ShopActions>(
    () => ({
      dispatchBag,
      addToBag: (slug, size, color, quantity = 1) => {
        const line = { slug, size, color, quantity }
        dispatchBag({ type: 'add', line })
        setLastAdded((prev) => ({ lines: [line], tick: (prev?.tick ?? 0) + 1 }))
      },
      addLook: (lines) => {
        dispatchBag({ type: 'addMany', lines })
        setLastAdded((prev) => ({ lines, tick: (prev?.tick ?? 0) + 1 }))
      },
      setPrefs: (patch) => setPrefsState((p) => ({ ...p, ...patch })),
      setBagOpen,
      openProduct,
      setCategory,
      setSizeFilter,
      requestStyling: (p) => setStylingPrefill((prev) => ({ ...p, tick: (prev?.tick ?? 0) + 1 })),
    }),
    [],
  )

  const bagState = useMemo<BagState>(
    () => ({ bag, prefs, lastAdded, totals: computeTotals(bag, prefs.payment, prefs.cep, prefs.shipping) }),
    [bag, prefs, lastAdded],
  )
  const ui = useMemo<UIState>(() => ({ bagOpen, openSlug }), [bagOpen, openSlug])
  const filters = useMemo<FilterState>(() => ({ category, sizeFilter }), [category, sizeFilter])

  return (
    <ActionsContext.Provider value={actions}>
      <BagContext.Provider value={bagState}>
        <UIContext.Provider value={ui}>
          <FilterContext.Provider value={filters}>
            <StylingContext.Provider value={stylingPrefill}>{children}</StylingContext.Provider>
          </FilterContext.Provider>
        </UIContext.Provider>
      </BagContext.Provider>
    </ActionsContext.Provider>
  )
}

function need<T>(value: T | null, name: string): T {
  if (value === null) throw new Error(`${name} precisa estar dentro de <ShopProvider>`)
  return value
}

/* eslint-disable react-refresh/only-export-components */
export const useShopActions = () => need(useContext(ActionsContext), 'useShopActions')
export const useBag = () => need(useContext(BagContext), 'useBag')
export const useShopUI = () => need(useContext(UIContext), 'useShopUI')
export const useCatalogFilter = () => need(useContext(FilterContext), 'useCatalogFilter')
export const useStylingPrefill = () => useContext(StylingContext)

/** Rola suavemente até uma seção (instantâneo com movimento reduzido). */
export function scrollToId(id: string) {
  const el = document.getElementById(id)
  if (!el) return
  el.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' })
}
/* eslint-enable react-refresh/only-export-components */

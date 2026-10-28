import { useMemo, useState } from 'react'
import { AnimatePresence, LayoutGroup, motion } from 'motion/react'
import { MagnifyingGlass, X } from '@phosphor-icons/react'
import { categories } from '../../data/categories'
import { products, SIZES, type Size } from '../../data/products'
import { filterProducts, type SortKey } from '../../lib/catalog'
import { useCatalogFilter, useShopActions } from '../../lib/shop'
import { Button } from '../ui/Button'
import { ease } from '../ui/motion'
import { MaskTitle, Reveal, RevealGroup, RevealItem } from '../ui/Reveal'
import { ProductCard } from './ProductCard'

const sortOptions: { value: SortKey; label: string }[] = [
  { value: 'destaque', label: 'Destaques' },
  { value: 'novidades', label: 'Novidades' },
  { value: 'menor-preco', label: 'Menor preço' },
  { value: 'maior-preco', label: 'Maior preço' },
]

export function ProductGrid() {
  const { category, sizeFilter } = useCatalogFilter()
  const { setCategory, setSizeFilter } = useShopActions()
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<SortKey>('destaque')

  const list = useMemo(() => filterProducts(products, { category, size: sizeFilter, query, sort }), [category, sizeFilter, query, sort])
  const clear = () => {
    setCategory('todos')
    setSizeFilter('todos')
    setQuery('')
  }

  return (
    <section id="colecao" aria-labelledby="colecao-titulo" className="bg-ivory py-20 md:py-28">
      <div className="container-x">
        <RevealGroup at={0.2} stagger={0.12} className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl">
            <RevealItem as="p" variant="fade" className="eyebrow mb-3">
              Coleção Outono/Inverno
            </RevealItem>
            <MaskTitle id="colecao-titulo" className="h2">
              A vitrine, peça <em>por</em> peça
            </MaskTitle>
          </div>
          <RevealItem as="p" variant="fade" className="max-w-sm text-taupe">
            Passe o mouse para ver o detalhe do tecido. Escolha o tamanho no card e a peça vai direto para a sacola.
          </RevealItem>
        </RevealGroup>

        {/* Filtros */}
        <div className="mt-10 grid grid-cols-[minmax(0,1fr)] gap-4">
          <LayoutGroup id="cat">
            <div role="group" aria-label="Filtrar por categoria" className="-mx-4 flex gap-1.5 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0">
              {categories.map((c) => {
                const active = c.id === category
                return (
                  <button
                    key={c.id}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setCategory(c.id)}
                    className={`relative h-11 shrink-0 rounded-full px-4 text-sm font-semibold transition-colors ${active ? 'text-linen' : 'text-espresso hover:bg-sand'}`}
                  >
                    {active && <motion.span layoutId="cat-pill" className="absolute inset-0 rounded-full bg-espresso" transition={{ duration: 0.4, ease }} />}
                    <span className="relative">{c.label}</span>
                  </button>
                )
              })}
            </div>
          </LayoutGroup>

          <div className="flex flex-col gap-3 border-y border-sand-line py-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <span id="filtro-tamanho" className="mr-1 text-sm font-semibold text-taupe">
                Tamanho
              </span>
              <div role="group" aria-labelledby="filtro-tamanho" className="flex flex-wrap gap-1.5">
                {(['todos', ...SIZES] as (Size | 'todos')[]).map((s) => {
                  const active = s === sizeFilter
                  return (
                    <button
                      key={s}
                      type="button"
                      aria-pressed={active}
                      onClick={() => setSizeFilter(s)}
                      className={`num h-10 min-w-11 rounded-[10px] px-3 text-sm font-semibold ring-1 ring-inset transition-colors ${
                        active ? 'bg-terracotta-deep text-white ring-terracotta-deep' : 'bg-linen text-espresso ring-sand-line hover:ring-espresso'
                      }`}
                    >
                      {s === 'todos' ? 'Todos' : s}
                    </button>
                  )
                })}
              </div>
            </div>
            <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2 sm:flex sm:items-center">
              <label className="relative block min-w-0 sm:w-64">
                <span className="sr-only">Buscar peça</span>
                <MagnifyingGlass size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-taupe" aria-hidden="true" />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Buscar: linho, blazer, sálvia..."
                  className="h-11 w-full rounded-[10px] bg-linen pl-10 pr-3 text-sm ring-1 ring-inset ring-sand-line placeholder:text-taupe/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-terracotta-deep"
                />
              </label>
              <label className="flex items-center gap-2">
                <span className="sr-only sm:not-sr-only sm:text-sm sm:font-semibold sm:text-taupe">Ordenar</span>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as SortKey)}
                  className="h-11 rounded-[10px] bg-linen px-3 text-sm font-semibold ring-1 ring-inset ring-sand-line focus:outline-none focus-visible:ring-2 focus-visible:ring-terracotta-deep"
                  aria-label="Ordenar peças"
                >
                  {sortOptions.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>
          <p className="num text-sm text-taupe" aria-live="polite" data-testid="result-count">
            {list.length} {list.length === 1 ? 'peça encontrada' : 'peças encontradas'}
          </p>
        </div>

        {list.length === 0 ? (
          <div className="mt-8 rounded-[18px] border border-dashed border-sand-line bg-linen px-6 py-16 text-center">
            <p className="font-display text-3xl">Nenhuma peça com esses filtros</p>
            <p className="mx-auto mt-2 max-w-md text-taupe">Tente outro tamanho ou categoria. Peças sob medida podem ser feitas no seu tamanho.</p>
            <Button variant="secondary" className="mt-6" onClick={clear} icon={<X size={16} aria-hidden="true" />}>
              Limpar filtros
            </Button>
          </div>
        ) : (
          <motion.ul layout className="mt-6 grid grid-cols-2 gap-x-3 gap-y-9 sm:gap-x-5 md:grid-cols-3 lg:grid-cols-4">
            <AnimatePresence initial={false} mode="popLayout">
              {list.map((p, i) => (
                <motion.li
                  key={p.slug}
                  layout
                  initial={{ opacity: 0, transform: 'translateY(14px)' }}
                  animate={{ opacity: 1, transform: 'translateY(0px)', transition: { duration: 0.45, ease } }}
                  exit={{ opacity: 0, transition: { duration: 0.15 } }}
                  className="min-w-0"
                >
                  {/* Cada card entra quando a sua linha chega; cascata curta por coluna */}
                  <Reveal at={0.08} delay={(i % 4) * 0.07}>
                    <ProductCard product={p} priority={i < 2} />
                  </Reveal>
                </motion.li>
              ))}
            </AnimatePresence>
          </motion.ul>
        )}
      </div>
    </section>
  )
}

import { ArrowUpRight } from '@phosphor-icons/react'
import { categories, type CategoryId } from '../../data/categories'
import { products } from '../../data/products'
import { inCategory } from '../../lib/catalog'
import { scrollToId, useShopActions } from '../../lib/shop'
import { MaskTitle, RevealGroup, RevealItem } from '../ui/Reveal'
import { SmartImage } from '../ui/SmartImage'

/** Cards visuais: filtram a vitrine e rolam até ela. Layout em mosaico (1 grande + 4). */
export function Categories() {
  const { setCategory } = useShopActions()
  const list = categories.filter((c) => c.id !== 'todos')

  const choose = (id: CategoryId) => {
    setCategory(id)
    requestAnimationFrame(() => scrollToId('colecao'))
  }

  return (
    <section id="categorias" aria-labelledby="categorias-titulo" className="py-20 md:py-28">
      <div className="container-x">
        <RevealGroup at={0.2} className="flex flex-wrap items-end justify-between gap-6">
          <MaskTitle id="categorias-titulo" className="h2 max-w-2xl">
            Comece pelo que <em>falta</em> no armário
          </MaskTitle>
          <RevealItem as="p" variant="fade" className="max-w-sm text-taupe">
            Cada categoria abre a vitrine já filtrada. Todas as peças têm tabela de medidas em centímetros.
          </RevealItem>
        </RevealGroup>

        {/* Mosaico abre peça por peça, começando pela grande */}
        <RevealGroup as="ul" at={0.18} stagger={0.12} className="mt-12 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 lg:grid-rows-2">
          {list.map((c, i) => {
            const count = products.filter((p) => inCategory(p, c.id)).length
            const big = i === 0
            return (
              <RevealItem as="li" variant="curtain" key={c.id} className={`rounded-[18px] ${big ? 'col-span-2 lg:col-span-2 lg:row-span-2' : ''}`}>
                <button
                  type="button"
                  onClick={() => choose(c.id)}
                  className={`group/cat relative block w-full overflow-hidden rounded-[18px] bg-sand text-left ${
                    big ? 'aspect-[4/3] lg:aspect-auto lg:h-full' : 'aspect-[4/5]'
                  }`}
                  aria-label={`${c.label}: ${count} peças. Ver na vitrine`}
                >
                  {c.image && (
                    <SmartImage
                      asset={c.image}
                      alt=""
                      sizes={big ? '(min-width: 1024px) 50vw, 100vw' : '(min-width: 1024px) 25vw, 50vw'}
                      className="absolute inset-0 size-full transition-transform duration-[900ms] ease-[var(--ease-out)] group-hover/cat:scale-[1.04]"
                      pictureClassName="contents"
                    />
                  )}
                  <span className="absolute inset-0 bg-gradient-to-t from-espresso/70 via-espresso/10 to-transparent" />
                  <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4 text-linen sm:p-5">
                    <span>
                      <span className={`block font-display leading-none ${big ? 'text-[2.2rem] sm:text-5xl' : 'text-[1.5rem] sm:text-3xl'}`}>{c.short}</span>
                      <span className="num mt-1.5 block text-[0.8rem] text-linen/85">
                        <span className={big ? '' : 'hidden sm:inline'}>{c.note} · </span>
                        {count} peças
                      </span>
                    </span>
                    <span className="grid size-10 shrink-0 place-items-center rounded-full bg-ivory text-espresso transition-transform duration-300 group-hover/cat:-translate-y-0.5 group-hover/cat:translate-x-0.5">
                      <ArrowUpRight size={18} weight="bold" aria-hidden="true" />
                    </span>
                  </span>
                </button>
              </RevealItem>
            )
          })}
        </RevealGroup>
      </div>
    </section>
  )
}

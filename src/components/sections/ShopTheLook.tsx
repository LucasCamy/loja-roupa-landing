import { useState } from 'react'
import { Tote } from '@phosphor-icons/react'
import { seasonLook } from '../../data/look'
import { getProduct, SIZES, sizeStock, type Product, type Size } from '../../data/products'
import { formatPrice } from '../../lib/format'
import { useShopActions } from '../../lib/shop'
import { Button } from '../ui/Button'
import { SizeSelector } from '../ui/SizeSelector'
import { MaskTitle, Reveal, RevealGroup, RevealItem } from '../ui/Reveal'
import { SmartImage } from '../ui/SmartImage'

const pieces = seasonLook.pieces.map((p) => ({ ...p, product: getProduct(p.slug) as Product }))
const available = (product: Product, size: Size) => !!sizeStock(product, size)?.inStock

/** Editorial interativo: 3 pontos focais + tamanho por peça + combo com 10% OFF. */
export function ShopTheLook() {
  const { addLook, setBagOpen } = useShopActions()
  const [sizes, setSizes] = useState<Record<string, Size>>(() => Object.fromEntries(pieces.map((p) => [p.slug, seasonLook.defaultSize])))
  const [active, setActive] = useState(pieces[0].slug)
  const [notice, setNotice] = useState('')

  const full = pieces.reduce((s, p) => s + p.product.price, 0)
  const combo = Math.round(full * 0.9 * 100) / 100

  const setAll = (size: Size) => {
    const missing = pieces.filter((p) => !available(p.product, size))
    setSizes((cur) => Object.fromEntries(pieces.map((p) => [p.slug, available(p.product, size) ? size : cur[p.slug]])))
    setNotice(
      missing.length
        ? `${missing.map((m) => m.label).join(' e ')} sem ${size} no estoque: mantivemos o tamanho anterior.`
        : `Tamanho ${size} aplicado às 3 peças.`,
    )
  }

  const addAll = () => {
    addLook(pieces.map((p) => ({ slug: p.slug, size: sizes[p.slug], color: p.color, quantity: 1 })))
    setBagOpen(true)
  }

  return (
    <section id="look" aria-labelledby="look-titulo" className="overflow-hidden bg-sage-soft py-20 md:py-28">
      <div className="container-x grid items-start gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-16">
        {/* Foto com pontos focais */}
        {/* Etapas: a foto abre da esquerda para a direita, depois os pontos aparecem um a um */}
        <RevealGroup at={0.25} stagger={0.22} className="relative mx-auto w-full max-w-[560px] lg:sticky lg:top-28">
          <div className="relative">
            <RevealItem variant="wipe" cover="bg-sage-soft" className="aspect-[4/5] rounded-[28px] bg-sand shadow-lift">
              <SmartImage asset={seasonLook.image} sizes="(min-width: 1024px) 560px, 100vw" className="absolute inset-0 size-full" pictureClassName="contents" />
            </RevealItem>
            {pieces.map((p, i) => {
              const on = p.slug === active
              return (
                <span key={p.slug} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${p.hotspot.x}%`, top: `${p.hotspot.y}%` }}>
                  <RevealItem as="span" variant="pop" className="block">
                    <button
                      type="button"
                      onClick={() => {
                        setActive(p.slug)
                        document.getElementById(`look-peca-${p.slug}`)?.focus({ preventScroll: false })
                      }}
                      className="group/hs block"
                      aria-label={`Ponto ${i + 1}: ${p.product.name}`}
                      aria-pressed={on}
                    >
                      <span
                        className={`relative grid size-11 place-items-center rounded-full font-semibold shadow-soft transition-colors ${on ? 'bg-terracotta-deep text-white' : 'bg-ivory/95 text-espresso'}`}
                      >
                        <span className="num text-sm">{i + 1}</span>
                        <span
                          className={`absolute -inset-1.5 rounded-full ring-2 transition-opacity ${on ? 'opacity-100 ring-ivory/90' : 'opacity-0 ring-transparent'}`}
                          aria-hidden="true"
                        />
                      </span>
                    </button>
                  </RevealItem>
                </span>
              )
            })}
          </div>
          <RevealItem as="p" variant="fade" className="mt-3 text-center text-sm text-taupe">
            Toque nos pontos para ver cada peça do look.
          </RevealItem>
        </RevealGroup>

        <div>
          <RevealGroup at={0.2} stagger={0.12}>
            <RevealItem as="p" variant="fade" className="eyebrow mb-3">
              Compre o look da estação
            </RevealItem>
            <MaskTitle id="look-titulo" className="h2">
              Três peças, <em>um</em> só lote de linho
            </MaskTitle>
            <RevealItem as="p" className="mt-4 max-w-xl text-taupe">
              Blazer oversized, top de tricô e pantalona combinam entre si e com o resto do armário. Levando as três, o combo sai com 10% OFF.
            </RevealItem>
          </RevealGroup>

          <Reveal at={0.15} className="mt-8 rounded-[18px] bg-ivory p-4 ring-1 ring-sand-line sm:p-5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold">Mesmo tamanho para o look:</span>
              {SIZES.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setAll(s)}
                  className="num h-10 min-w-11 rounded-[10px] px-2 text-sm font-semibold ring-1 ring-inset ring-sand-line hover:ring-espresso"
                >
                  {s}
                </button>
              ))}
            </div>
            <p className="mt-2 min-h-5 text-xs text-taupe" aria-live="polite">
              {notice}
            </p>
          </Reveal>

          {/* As três peças entram uma a uma, na ordem dos pontos da foto */}
          <RevealGroup as="ol" at={0.15} stagger={0.12} className="mt-4 space-y-3">
            {pieces.map((p, i) => {
              const on = p.slug === active
              return (
                <RevealItem as="li" variant="slide" key={p.slug}>
                  <div
                    id={`look-peca-${p.slug}`}
                    tabIndex={-1}
                    onFocus={() => setActive(p.slug)}
                    onPointerEnter={() => setActive(p.slug)}
                    className={`grid grid-cols-[72px_minmax(0,1fr)] gap-4 rounded-[18px] bg-ivory p-3 outline-none transition-[box-shadow] duration-300 sm:grid-cols-[88px_minmax(0,1fr)] sm:p-4 ${
                      on ? 'ring-2 ring-inset ring-terracotta-deep' : 'ring-1 ring-inset ring-sand-line'
                    }`}
                  >
                    <SmartImage asset={p.product.image} alt="" sizes="88px" className="aspect-[4/5] w-full rounded-[10px]" />
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                        <p className="font-display text-[1.3rem] leading-tight">
                          <span className="num mr-1.5 font-sans text-sm font-bold text-terracotta-deep">{i + 1}.</span>
                          {p.product.name}
                        </p>
                        <p className="num text-sm font-semibold">{formatPrice(p.product.price)}</p>
                      </div>
                      <p className="sku mt-0.5">
                        Ref. {p.product.sku} · Cor {p.color}
                      </p>
                      <div className="mt-2.5 max-w-[300px]">
                        <SizeSelector
                          product={p.product}
                          value={sizes[p.slug]}
                          onChange={(s) => setSizes((cur) => ({ ...cur, [p.slug]: s }))}
                          compact
                          label={`Tamanho de ${p.product.name}`}
                        />
                      </div>
                    </div>
                  </div>
                </RevealItem>
              )
            })}
          </RevealGroup>

          <Reveal at={0.1} className="mt-6 flex flex-col gap-4 rounded-[18px] bg-espresso p-5 text-linen sm:flex-row sm:items-center sm:justify-between">
            <div className="num">
              <p className="text-sm text-linen/75">
                Peças separadas <s>{formatPrice(full)}</s>
              </p>
              <p className="text-2xl font-bold">
                {formatPrice(combo)} <span className="text-sm font-semibold text-butter">combo 10% OFF</span>
              </p>
            </div>
            <Button
              variant="light"
              size="lg"
              onClick={addAll}
              icon={<Tote size={20} weight="duotone" aria-hidden="true" />}
              className="h-auto! min-h-14 w-full whitespace-normal! py-3 text-center leading-snug sm:w-auto sm:max-w-[300px]"
              data-testid="add-look"
            >
              Adicionar Look Completo à Sacola (10% OFF no combo)
            </Button>
          </Reveal>
        </div>
      </div>
    </section>
  )
}

import { useState } from 'react'
import { BellRinging, Plus, Ruler, X } from '@phosphor-icons/react'
import { pixPrice, type Product, type Size } from '../../data/products'
import { formatPrice } from '../../lib/format'
import { useShopActions } from '../../lib/shop'
import { soldOutMessage, whatsappLink } from '../../lib/whatsapp'
import { Badge, badgeTone } from '../ui/Badge'
import { ColorSwatches } from '../ui/ColorSwatches'
import { SizeSelector } from '../ui/SizeSelector'
import { SmartImage } from '../ui/SmartImage'

/** Largura do card na grade (2 / 3 / 4 colunas) */
const CARD_SIZES = '(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw'

/**
 * Card 4:5 com 2ª foto no hover, cores no card e adição rápida por tamanho.
 * Clicar num tamanho disponível adiciona direto à sacola (com a cor escolhida).
 */
export function ProductCard({ product, priority = false }: { product: Product; priority?: boolean }) {
  const { addToBag, openProduct } = useShopActions()
  const [color, setColor] = useState(product.colors[0].name)
  const [quickOpen, setQuickOpen] = useState(false)
  const soldOut = product.availability === 'esgotado'
  const onDemand = product.availability === 'sob-medida'
  const hover = product.gallery[1]

  const quickAdd = (size: Size) => {
    addToBag(product.slug, size, color, 1)
    setQuickOpen(false)
  }

  return (
    <article className="group/card flex min-w-0 flex-col" aria-labelledby={`card-${product.slug}`} data-testid="product-card" data-slug={product.slug}>
      <div className="relative overflow-hidden rounded-[18px] bg-sand">
        <button
          type="button"
          onClick={() => openProduct(product.slug)}
          className="relative block aspect-[4/5] w-full overflow-hidden rounded-[18px]"
          aria-label={`Ver detalhes: ${product.name}`}
          tabIndex={-1}
        >
          <SmartImage
            asset={product.image}
            priority={priority}
            sizes={CARD_SIZES}
            className="absolute inset-0 size-full transition-transform duration-[900ms] ease-[var(--ease-out)] [@media(hover:hover)]:group-hover/card:scale-[1.035]"
            pictureClassName="contents"
          />
          {hover && (
            <SmartImage
              asset={hover}
              alt=""
              sizes={CARD_SIZES}
              className="absolute inset-0 size-full opacity-0 transition-[opacity,transform] duration-[560ms] ease-[var(--ease-out)] [@media(hover:hover)]:group-hover/card:scale-[1.035] [@media(hover:hover)]:group-hover/card:opacity-100"
              pictureClassName="contents"
            />
          )}
          {soldOut && <span className="absolute inset-0 bg-linen/35" aria-hidden="true" />}
        </button>

        <div className="pointer-events-none absolute left-2.5 top-2.5 flex flex-col items-start gap-1.5 sm:left-3 sm:top-3">
          {soldOut ? <Badge tone="muted">Esgotado</Badge> : product.badge && <Badge tone={badgeTone[product.badge]}>{product.badge}</Badge>}
          {product.compareAtPrice && !soldOut && (
            <Badge tone="sage" className="num">
              -{Math.round((1 - product.price / product.compareAtPrice) * 100)}%
            </Badge>
          )}
        </div>

        {/* Ação principal sobre a foto */}
        {soldOut ? (
          <a
            href={whatsappLink(soldOutMessage(product.name, product.sku))}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute inset-x-2.5 bottom-2.5 flex min-h-11 items-center justify-center gap-2 rounded-full bg-ivory/95 px-3 text-center text-[0.8rem] font-semibold leading-tight text-espresso shadow-soft hover:bg-white"
          >
            <BellRinging size={16} aria-hidden="true" className="shrink-0" />
            Avise-me / Encomendar
            <span className="sr-only"> {product.name} no WhatsApp (abre em nova aba)</span>
          </a>
        ) : onDemand ? (
          <button
            type="button"
            onClick={() => openProduct(product.slug)}
            className="absolute inset-x-2.5 bottom-2.5 flex min-h-11 items-center justify-center gap-2 rounded-full bg-ivory/95 px-3 text-[0.8rem] font-semibold text-espresso shadow-soft hover:bg-white"
          >
            <Ruler size={16} aria-hidden="true" />
            Escolher medidas
          </button>
        ) : (
          <>
            <div
              className={`absolute inset-x-2 bottom-2 rounded-[14px] bg-ivory p-2 shadow-lift transition-[opacity,transform] duration-[280ms] ease-[var(--ease-out)] sm:inset-x-2.5 sm:bottom-2.5 sm:p-2.5 ${
                quickOpen
                  ? 'translate-y-0 opacity-100'
                  : 'pointer-events-none translate-y-3 opacity-0 group-focus-within/card:pointer-events-auto group-focus-within/card:translate-y-0 group-focus-within/card:opacity-100 [@media(hover:hover)]:group-hover/card:pointer-events-auto [@media(hover:hover)]:group-hover/card:translate-y-0 [@media(hover:hover)]:group-hover/card:opacity-100'
              }`}
              data-testid="quick-add"
            >
              <div className="mb-1.5 flex items-center justify-between gap-2 px-0.5">
                <p className="text-[0.72rem] font-semibold text-taupe">Adicionar tamanho</p>
                {quickOpen && (
                  <button type="button" onClick={() => setQuickOpen(false)} className="-m-1.5 grid size-8 place-items-center rounded-full hover:bg-sand" aria-label="Fechar tamanhos">
                    <X size={14} aria-hidden="true" />
                  </button>
                )}
              </div>
              <SizeSelector product={product} value={null} onChange={quickAdd} compact label={`Adicionar ${product.name} no tamanho`} />
            </div>
            {!quickOpen && (
              <button
                type="button"
                onClick={() => setQuickOpen(true)}
                className="absolute bottom-2.5 right-2.5 flex h-11 items-center gap-1.5 rounded-full bg-ivory/95 pl-3 pr-3.5 text-[0.82rem] font-semibold text-espresso shadow-soft transition-opacity duration-200 hover:bg-white [@media(hover:hover)]:group-hover/card:opacity-0"
                aria-label={`Adicionar ${product.name} à sacola`}
                aria-expanded={quickOpen}
              >
                <Plus size={16} weight="bold" aria-hidden="true" />
                <span className="hidden xs:inline">Adicionar</span>
              </button>
            )}
          </>
        )}
      </div>

      <div className="flex flex-1 flex-col pt-3">
        <div className="flex items-center justify-between gap-2">
          <ColorSwatches colors={product.colors} value={color} onChange={setColor} size="sm" label={`Cor de ${product.name}`} />
          <span className="sku hidden sm:inline">Ref. {product.sku}</span>
        </div>
        <h3 id={`card-${product.slug}`} className="mt-1 text-[1.2rem] leading-tight sm:text-[1.38rem]">
          <button type="button" onClick={() => openProduct(product.slug)} className="text-left hover:text-terracotta-deep">
            {product.name}
          </button>
        </h3>
        <div className="num mt-1.5">
          <p className="flex flex-wrap items-baseline gap-x-2">
            <span className="font-bold">{formatPrice(product.price)}</span>
            {product.compareAtPrice && (
              <s className="text-xs text-taupe">
                <span className="sr-only">de </span>
                {formatPrice(product.compareAtPrice)}
              </s>
            )}
          </p>
          <p className="text-[0.74rem] leading-snug text-taupe">
            {formatPrice(pixPrice(product.price))} no Pix · até {product.installments}x sem juros
          </p>
        </div>
      </div>
    </article>
  )
}

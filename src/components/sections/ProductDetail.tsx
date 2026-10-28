import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { CaretLeft, CaretRight, Minus, Plus, Ruler, Tote, WarningCircle, WhatsappLogo, X } from '@phosphor-icons/react'
import { categoryLabel } from '../../data/categories'
import { availabilityLabel, getProduct, SIZES, sizeStock, type Product, type Size } from '../../data/products'
import { MAX_QTY } from '../../lib/bag'
import { scrollToId, useShopActions, useShopUI } from '../../lib/shop'
import { productMessage, soldOutMessage, whatsappLink } from '../../lib/whatsapp'
import { Accordion } from '../ui/Accordion'
import { Badge, badgeTone } from '../ui/Badge'
import { Button, ButtonLink } from '../ui/Button'
import { ColorSwatches } from '../ui/ColorSwatches'
import { Price } from '../ui/Price'
import { Sheet } from '../ui/Sheet'
import { SizeSelector } from '../ui/SizeSelector'
import { SmartImage } from '../ui/SmartImage'
import { ease } from '../ui/motion'

/** Diálogo de detalhe do produto, controlado por `openSlug` da loja. */
export function ProductDetail() {
  const { openSlug } = useShopUI()
  const { openProduct } = useShopActions()
  const product = openSlug ? getProduct(openSlug) : undefined
  return (
    <Sheet open={!!product} onClose={() => openProduct(null)} labelledBy="detalhe-titulo">
      {product && <DetailBody key={product.slug} product={product} onClose={() => openProduct(null)} />}
    </Sheet>
  )
}

const cm = (n: number) => (n > 0 ? `${n}` : '—')

export function MeasurementTable({ product, highlight }: { product: Product; highlight?: Size | null }) {
  return (
    <div className="overflow-x-auto rounded-[14px] ring-1 ring-sand-line">
      <table className="num w-full min-w-[320px] text-left text-sm">
        <caption className="sr-only">Medidas da peça {product.name} em centímetros</caption>
        <thead className="bg-sand/70 font-mono text-[0.72rem] uppercase tracking-[0.06em] text-taupe">
          <tr>
            <th scope="col" className="px-3 py-2.5">Tam.</th>
            <th scope="col" className="px-3 py-2.5">Busto</th>
            <th scope="col" className="px-3 py-2.5">Cintura</th>
            <th scope="col" className="px-3 py-2.5">Quadril</th>
            <th scope="col" className="px-3 py-2.5">Compr.</th>
          </tr>
        </thead>
        <tbody>
          {SIZES.map((s) => {
            const m = product.measurements[s]
            if (!m) return null
            const on = s === highlight
            return (
              <tr key={s} className={`border-t border-sand-line ${on ? 'bg-butter/40 font-semibold' : ''}`}>
                <th scope="row" className="px-3 py-2.5 font-semibold">
                  {s}
                </th>
                <td className="px-3 py-2.5">{cm(m.busto)}</td>
                <td className="px-3 py-2.5">{cm(m.cintura)}</td>
                <td className="px-3 py-2.5">{cm(m.quadril)}</td>
                <td className="px-3 py-2.5">{cm(m.comprimento)}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function DetailBody({ product, onClose }: { product: Product; onClose: () => void }) {
  const { addToBag, setBagOpen, requestStyling } = useShopActions()
  const [imageIndex, setImageIndex] = useState(0)
  const [color, setColor] = useState(product.colors[0].name)
  const [size, setSize] = useState<Size | null>(null)
  const [qty, setQty] = useState(1)
  const [guideOpen, setGuideOpen] = useState(false)
  const [sizeError, setSizeError] = useState(false)
  const soldOut = product.availability === 'esgotado'
  const onDemand = product.availability === 'sob-medida'
  const image = product.gallery[imageIndex] ?? product.image
  const stock = size ? sizeStock(product, size) : undefined
  const total = product.gallery.length

  const add = () => {
    if (!size) {
      setSizeError(true)
      return
    }
    addToBag(product.slug, size, color, qty)
    onClose()
    setBagOpen(true)
  }

  const custom = () => {
    onClose()
    requestStyling({ occasion: 'Ajuste de Comprimento / Sob Medida', size: size ?? undefined, notes: `Peça: ${product.name} (Ref. ${product.sku}), cor ${color}.` })
    requestAnimationFrame(() => scrollToId('consultoria'))
  }

  return (
    <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)] overflow-y-auto md:grid-cols-[1fr_1fr] md:overflow-hidden">
      {/* Galeria */}
      <div className="relative bg-sand md:min-h-0">
        <div className="relative aspect-[4/5] max-h-[62dvh] w-full overflow-hidden md:aspect-auto md:h-full md:max-h-none">
          <AnimatePresence initial={false} mode="popLayout">
            <motion.div key={image.name} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }} className="absolute inset-0">
              <SmartImage asset={image} sizes="(min-width: 768px) 50vw, 100vw" className="size-full" pictureClassName="contents" />
            </motion.div>
          </AnimatePresence>
          {total > 1 && (
            <>
              <button
                type="button"
                onClick={() => setImageIndex((i) => (i - 1 + total) % total)}
                className="absolute left-3 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-ivory/90 shadow-soft hover:bg-white"
                aria-label="Foto anterior"
              >
                <CaretLeft size={18} aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => setImageIndex((i) => (i + 1) % total)}
                className="absolute right-3 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-ivory/90 shadow-soft hover:bg-white"
                aria-label="Próxima foto"
              >
                <CaretRight size={18} aria-hidden="true" />
              </button>
              <p className="num absolute right-3 top-3 rounded-full bg-espresso/80 px-2.5 py-1 text-xs font-semibold text-linen" aria-live="polite">
                {imageIndex + 1} / {total}
              </p>
            </>
          )}
        </div>
        {total > 1 && (
          <div className="absolute bottom-3 left-3 flex gap-2" role="group" aria-label="Miniaturas">
            {product.gallery.map((g, i) => (
              <button
                key={g.name}
                type="button"
                onClick={() => setImageIndex(i)}
                aria-pressed={i === imageIndex}
                aria-label={`Foto ${i + 1} de ${total}`}
                className={`size-14 overflow-hidden rounded-[10px] ring-2 transition-[box-shadow,opacity] ${i === imageIndex ? 'ring-ivory' : 'opacity-70 ring-transparent hover:opacity-100'}`}
              >
                <SmartImage asset={g} alt="" sizes="56px" className="size-full" pictureClassName="contents" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Informações */}
      <div className="flex min-h-0 flex-col md:overflow-y-auto">
        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 bg-ivory px-5 pb-2 pt-4 sm:px-8">
          <p className="sku">
            {categoryLabel(product.category)} · Ref. {product.sku}
          </p>
          <button type="button" onClick={onClose} className="grid size-11 place-items-center rounded-full hover:bg-sand" aria-label="Fechar detalhes do produto">
            <X size={22} aria-hidden="true" />
          </button>
        </div>

        <div className="px-5 pb-8 sm:px-8">
          <div className="flex flex-wrap gap-1.5">
            {soldOut ? <Badge tone="muted">Esgotado</Badge> : product.badge && <Badge tone={badgeTone[product.badge]}>{product.badge}</Badge>}
            <Badge tone={onDemand ? 'butter' : soldOut ? 'muted' : 'sage'}>{availabilityLabel[product.availability]}</Badge>
          </div>
          <h2 id="detalhe-titulo" className="mt-3 text-[2.1rem] sm:text-[2.6rem]">
            {product.name}
          </h2>
          <div className="mt-3">
            <Price product={product} size="lg" />
          </div>
          <p className="mt-4 leading-relaxed text-espresso/90">{product.description}</p>

          <div className="mt-6">
            <ColorSwatches colors={product.colors} value={color} onChange={setColor} label="Cor" showName />
          </div>

          <div className="mt-5">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <p id="tamanho-label" className="text-sm font-semibold">
                Tamanho{size && <span className="font-normal text-taupe">: {size}</span>}
              </p>
              <button
                type="button"
                onClick={() => setGuideOpen((o) => !o)}
                aria-expanded={guideOpen}
                aria-controls="guia-medidas"
                className="inline-flex min-h-10 items-center gap-1.5 rounded-full px-2 text-sm font-semibold text-terracotta-deep underline decoration-terracotta/50 underline-offset-4 hover:decoration-terracotta-deep"
              >
                <Ruler size={18} aria-hidden="true" />
                Guia de Medidas (Tabela cm)
              </button>
            </div>
            <SizeSelector
              product={product}
              value={size}
              onChange={(s) => {
                setSize(s)
                setSizeError(false)
              }}
            />
            <div className="mt-2 min-h-5 text-sm" aria-live="polite">
              {sizeError ? (
                <p role="alert" className="flex items-center gap-1.5 text-error">
                  <WarningCircle size={16} aria-hidden="true" /> Escolha um tamanho para adicionar à sacola.
                </p>
              ) : stock?.lastUnits ? (
                <p className="flex items-center gap-1.5 font-semibold text-terracotta-deep">
                  <span aria-hidden="true" className="size-2 rotate-45 bg-terracotta" /> Últimas unidades no tamanho {size}
                </p>
              ) : size && stock?.inStock ? (
                <p className="flex items-center gap-1.5 text-sage-deep">
                  <span aria-hidden="true" className="size-2 rounded-full bg-sage-deep" /> Em estoque, pronta para envio
                </p>
              ) : onDemand && size ? (
                <p className="text-taupe">Produzida no tamanho {size} e ajustada ao seu comprimento.</p>
              ) : null}
            </div>
            <AnimatePresence initial={false}>
              {guideOpen && (
                <motion.div
                  id="guia-medidas"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1, transition: { duration: 0.35, ease } }}
                  exit={{ height: 0, opacity: 0, transition: { duration: 0.2 } }}
                  className="overflow-hidden"
                >
                  <div className="pt-3">
                    <MeasurementTable product={product} highlight={size} />
                    <p className="mt-2 text-sm text-taupe">{product.modelNote} Medidas da peça pronta, podendo variar 1 cm.</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {soldOut ? (
            <ButtonLink
              href={whatsappLink(soldOutMessage(product.name, product.sku, size ?? undefined))}
              variant="whatsapp"
              size="lg"
              className="mt-6 w-full"
              icon={<WhatsappLogo size={20} weight="fill" aria-hidden="true" />}
            >
              Avise-me / Encomendar no WhatsApp
            </ButtonLink>
          ) : (
            <div className="mt-5 flex gap-3">
              <div className="flex items-center rounded-full ring-1 ring-inset ring-sand-line" role="group" aria-label="Quantidade">
                <button type="button" className="grid size-12 place-items-center rounded-full hover:bg-sand disabled:opacity-40" aria-label="Diminuir quantidade" disabled={qty <= 1} onClick={() => setQty((q) => q - 1)}>
                  <Minus size={16} weight="bold" aria-hidden="true" />
                </button>
                <span className="num w-6 text-center font-semibold" aria-live="polite">
                  {qty}
                </span>
                <button type="button" className="grid size-12 place-items-center rounded-full hover:bg-sand disabled:opacity-40" aria-label="Aumentar quantidade" disabled={qty >= MAX_QTY} onClick={() => setQty((q) => q + 1)}>
                  <Plus size={16} weight="bold" aria-hidden="true" />
                </button>
              </div>
              <Button size="lg" className="flex-1" onClick={add} icon={<Tote size={20} weight="duotone" aria-hidden="true" />}>
                Adicionar à Sacola
              </Button>
            </div>
          )}

          <ButtonLink
            href={whatsappLink(productMessage(product.name, product.sku, color, size ?? undefined))}
            variant="secondary"
            className="mt-3 w-full"
            icon={<WhatsappLogo size={20} aria-hidden="true" />}
          >
            Tirar dúvida desta peça no WhatsApp
          </ButtonLink>
          {onDemand && (
            <Button variant="ghost" size="sm" className="mt-2 w-full" onClick={custom}>
              Pedir ajuste sob medida com a stylist
            </Button>
          )}

          <Accordion
            className="mt-8"
            titleClassName="font-sans text-[0.95rem] font-semibold"
            items={[
              {
                id: 'tecido',
                title: 'Composição & Tecido',
                content: (
                  <>
                    <p>{product.fabric}</p>
                    <p className="mt-2">{product.care}</p>
                  </>
                ),
              },
              { id: 'medidas', title: 'Medidas da Peça', content: <><MeasurementTable product={product} highlight={size} /><p className="mt-2 text-sm">{product.modelNote}</p></> },
              {
                id: 'trocas',
                title: 'Trocas & Envio (1ª troca grátis)',
                content: (
                  <p>
                    Envio para todo o Brasil, frete grátis acima de R$ 399. A primeira troca é por nossa conta em até 30 dias, com a peça sem uso e com etiqueta. Arrependimento em até 7 dias após o recebimento.
                  </p>
                ),
              },
            ]}
          />
        </div>
      </div>
    </div>
  )
}

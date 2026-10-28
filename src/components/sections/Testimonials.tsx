import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowLeft, ArrowRight, Star } from '@phosphor-icons/react'
import { site } from '../../config/site'
import { testimonials } from '../../data/content'
import { getProduct } from '../../data/products'
import { useShopActions } from '../../lib/shop'
import { MaskTitle, Reveal, RevealGroup, RevealItem } from '../ui/Reveal'
import { SmartImage } from '../ui/SmartImage'
import { ease } from '../ui/motion'

/** Editorial de citações: uma em destaque + seletor; cada depoimento traz altura e tamanho comprado. */
export function Testimonials() {
  const [index, setIndex] = useState(0)
  const { openProduct } = useShopActions()
  const t = testimonials[index]
  const product = getProduct(t.slug)
  const go = (d: number) => setIndex((i) => (i + d + testimonials.length) % testimonials.length)

  return (
    <section aria-labelledby="depo-titulo" className="py-20 md:py-28">
      <div className="container-x">
        <RevealGroup at={0.2} stagger={0.15} className="flex flex-wrap items-end justify-between gap-4">
          <MaskTitle id="depo-titulo" className="h2 max-w-2xl">
            O tamanho certo, <em>contado</em> por quem comprou
          </MaskTitle>
          <RevealItem variant="fade" className="flex gap-2">
            <button
              type="button"
              onClick={() => go(-1)}
              className="grid size-12 place-items-center rounded-full ring-1 ring-inset ring-sand-line hover:bg-sand"
              aria-label="Depoimento anterior"
            >
              <ArrowLeft size={18} aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              className="grid size-12 place-items-center rounded-full ring-1 ring-inset ring-sand-line hover:bg-sand"
              aria-label="Próximo depoimento"
            >
              <ArrowRight size={18} aria-hidden="true" />
            </button>
          </RevealItem>
        </RevealGroup>

        {/* Etapas: o cartão da citação sobe e a lista de compras entra item a item */}
        <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:gap-14">
          <Reveal at={0.15} className="relative min-h-[300px] rounded-[28px] bg-terracotta-deep p-7 text-linen sm:p-10">
            <div aria-live="polite">
              <AnimatePresence mode="wait" initial={false}>
                <motion.figure
                  key={index}
                  initial={{ opacity: 0, transform: 'translateY(12px)' }}
                  animate={{ opacity: 1, transform: 'translateY(0px)', transition: { duration: 0.45, ease } }}
                  exit={{ opacity: 0, transform: 'translateY(-8px)', transition: { duration: 0.18 } }}
                >
                  <div className="flex gap-0.5 text-butter" aria-label="5 de 5 estrelas" role="img">
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star key={i} size={18} weight="fill" aria-hidden="true" />
                    ))}
                  </div>
                  <blockquote className="mt-5 font-display text-[1.7rem] leading-[1.2] sm:text-[2.2rem]">“{t.quote}”</blockquote>
                  <figcaption className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                    <span className="font-semibold">
                      {t.name} · {t.city}
                    </span>
                    <span className="num rounded-full bg-linen/15 px-3 py-1">
                      {t.height} · comprou {t.size}
                    </span>
                  </figcaption>
                </motion.figure>
              </AnimatePresence>
            </div>
          </Reveal>

          <RevealGroup as="ul" at={0.15} delay={0.2} stagger={0.1} className="grid gap-2" ariaLabel="Escolher depoimento">
            {testimonials.map((item, i) => {
              const p = getProduct(item.slug)
              const on = i === index
              return (
                <RevealItem as="li" variant="slide" key={item.name}>
                  <button
                    type="button"
                    onClick={() => setIndex(i)}
                    aria-pressed={on}
                    className={`grid w-full grid-cols-[52px_minmax(0,1fr)_auto] items-center gap-3 rounded-[18px] p-2.5 text-left ring-1 ring-inset transition-colors ${
                      on ? 'bg-ivory ring-espresso' : 'ring-sand-line hover:bg-ivory'
                    }`}
                  >
                    {p && <SmartImage asset={p.image} alt="" sizes="52px" className="aspect-[4/5] w-full rounded-[8px]" />}
                    <span className="min-w-0">
                      <span className="block truncate font-semibold">{item.product}</span>
                      <span className="block text-sm text-taupe">{item.name}</span>
                    </span>
                    <span className="num rounded-[4px] bg-sand px-2 py-1 text-xs font-bold">{item.size}</span>
                  </button>
                </RevealItem>
              )
            })}
            {product && (
              <RevealItem as="li" variant="fade">
                <button
                  type="button"
                  onClick={() => openProduct(product.slug)}
                  className="mt-2 text-sm font-semibold text-terracotta-deep underline underline-offset-4"
                >
                  Ver medidas de {product.name}
                </button>
              </RevealItem>
            )}
          </RevealGroup>
        </div>
        {site.isDemo && <p className="mt-6 text-xs text-taupe">Depoimentos fictícios para demonstração. Substitua por avaliações reais e autorizadas.</p>}
      </div>
    </section>
  )
}

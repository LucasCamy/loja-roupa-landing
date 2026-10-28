import { useEffect, useId, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Check, Minus, Plus, Tote, Trash, Truck, WhatsappLogo, X } from '@phosphor-icons/react'
import { site } from '../../config/site'
import { getProduct } from '../../data/products'
import { MAX_QTY, type PaymentPreference } from '../../lib/bag'
import { formatPrice } from '../../lib/format'
import { formatDays, maskCep } from '../../lib/shipping'
import { useBag, useShopActions, useShopUI } from '../../lib/shop'
import { bagMessage, whatsappLink } from '../../lib/whatsapp'
import { Button, ButtonLink } from '../ui/Button'
import { Sheet } from '../ui/Sheet'
import { SmartImage } from '../ui/SmartImage'
import { ease } from '../ui/motion'

const paymentOptions: { value: PaymentPreference; label: string; hint: string }[] = [
  { value: 'pix', label: 'Pix com 5% OFF', hint: 'desconto aplicado no total' },
  { value: 'cartao', label: 'Cartão até 6x', hint: 'sem juros, por link seguro' },
  { value: 'combinar', label: 'Combinar no atendimento', hint: 'decidimos juntas no WhatsApp' },
]

/**
 * Sacola lateral. Sem checkout: o pedido vai estruturado para o WhatsApp.
 * Ponto de integração futura com um e-commerce real.
 */
export function BagDrawer() {
  const { bagOpen } = useShopUI()
  const { bag, totals, prefs } = useBag()
  const { setBagOpen, setPrefs, dispatchBag } = useShopActions()
  const close = () => setBagOpen(false)
  const uid = useId()
  const [cepTouched, setCepTouched] = useState(false)
  const cepDigits = prefs.cep.replace(/\D/g, '').length
  const quote = totals.shippingQuote
  const cepError =
    cepDigits === 8 && !quote
      ? 'CEP não encontrado. Confira os números.'
      : cepTouched && cepDigits > 0 && cepDigits < 8
        ? 'O CEP tem 8 números, ex.: 79000-000.'
        : ''

  return (
    <Sheet open={bagOpen} onClose={close} side="right" labelledBy="sacola-titulo">
      <div className="flex items-center justify-between border-b border-sand-line px-5 py-4">
        <h2 id="sacola-titulo" className="flex items-center gap-2 text-[1.9rem]">
          <Tote size={26} weight="duotone" className="text-terracotta-deep" aria-hidden="true" />
          Sua sacola
          {totals.count > 0 && <span className="num font-sans text-base font-semibold text-taupe">({totals.count})</span>}
        </h2>
        <button type="button" onClick={close} className="grid size-11 place-items-center rounded-full hover:bg-sand" aria-label="Fechar sacola">
          <X size={22} aria-hidden="true" />
        </button>
      </div>

      {totals.lines.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
          <div className="linen-texture grid size-28 place-items-center rounded-full bg-sand">
            <Tote size={44} weight="duotone" className="text-terracotta-deep" aria-hidden="true" />
          </div>
          <p className="mt-5 font-display text-3xl">Sua sacola está vazia</p>
          <p className="mt-2 text-taupe">Escolha um tamanho no card da peça e ela aparece aqui. Depois é só finalizar pelo WhatsApp.</p>
          <ButtonLink href="#colecao" className="mt-6" onClick={close}>
            Explorar a coleção
          </ButtonLink>
        </div>
      ) : (
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
          {/* Frete grátis */}
          <div className="border-b border-sand-line bg-linen px-5 py-3.5" aria-live="polite">
            <p className="flex items-center gap-2 text-sm">
              <Truck size={18} weight="duotone" className={totals.freeShipping ? 'text-sage-deep' : 'text-terracotta-deep'} aria-hidden="true" />
              {totals.freeShipping ? (
                <strong className="font-semibold text-sage-deep">Seu pedido ganhou Frete Grátis!</strong>
              ) : (
                <span className="num">
                  Faltam <strong className="font-semibold">{formatPrice(totals.remainingForFreeShipping)}</strong> para o frete grátis
                </span>
              )}
            </p>
            <div
              className="mt-2 h-1.5 overflow-hidden rounded-full bg-sand"
              role="progressbar"
              aria-label="Progresso até o frete grátis"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(totals.shippingProgress * 100)}
            >
              <div
                className={`h-full origin-left rounded-full transition-transform duration-500 ease-[var(--ease-out)] ${totals.freeShipping ? 'bg-sage-deep' : 'bg-terracotta'}`}
                style={{ transform: `scaleX(${totals.shippingProgress})` }}
              />
            </div>
          </div>

          <ul className="divide-y divide-sand-line px-5" data-testid="bag-lines">
            <AnimatePresence initial={false}>
              {totals.lines.map((line) => (
                // Sem `layout`: medir todas as linhas na montagem travava o 1º quadro da gaveta.
                // A remoção recolhe a altura, o que já reacomoda a lista sem projeção.
                <motion.li
                  key={line.key}
                  initial={{ opacity: 0, transform: 'translateX(16px)' }}
                  animate={{ opacity: 1, transform: 'translateX(0px)', transition: { duration: 0.4, ease } }}
                  exit={{ opacity: 0, height: 0, paddingTop: 0, paddingBottom: 0, transition: { duration: 0.24, ease } }}
                  className="flex gap-3.5 overflow-hidden py-4"
                  data-testid="bag-line"
                >
                  <SmartImage asset={line.product.image} alt="" sizes="80px" className="aspect-[4/5] w-20 shrink-0 rounded-[10px]" />
                  <div className="flex min-w-0 flex-1 flex-col">
                    <p className="font-display text-[1.2rem] font-semibold leading-tight">{line.product.name}</p>
                    <p className="sku mt-0.5">Ref. {line.product.sku}</p>
                    <div className="mt-1.5 flex flex-wrap gap-1.5 text-xs font-semibold">
                      <span className="rounded-[4px] bg-sand px-1.5 py-0.5">Tam: {line.size}</span>
                      <span className="rounded-[4px] bg-sand px-1.5 py-0.5">Cor: {line.color}</span>
                    </div>
                    <div className="mt-auto flex items-center justify-between gap-2 pt-2.5">
                      <div className="flex items-center rounded-full ring-1 ring-inset ring-sand-line" role="group" aria-label={`Quantidade de ${line.product.name}, tamanho ${line.size}`}>
                        <button
                          type="button"
                          className="grid size-10 place-items-center rounded-full hover:bg-sand disabled:opacity-40"
                          aria-label="Diminuir"
                          disabled={line.quantity <= 1}
                          onClick={() => dispatchBag({ type: 'setQty', key: line.key, quantity: line.quantity - 1 })}
                        >
                          <Minus size={14} weight="bold" aria-hidden="true" />
                        </button>
                        <span className="num w-5 text-center text-sm font-semibold" data-testid="line-qty">
                          {line.quantity}
                        </span>
                        <button
                          type="button"
                          className="grid size-10 place-items-center rounded-full hover:bg-sand disabled:opacity-40"
                          aria-label="Aumentar"
                          disabled={line.quantity >= MAX_QTY}
                          onClick={() => dispatchBag({ type: 'setQty', key: line.key, quantity: line.quantity + 1 })}
                        >
                          <Plus size={14} weight="bold" aria-hidden="true" />
                        </button>
                      </div>
                      <span className="num font-semibold">{formatPrice(line.lineTotal)}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="grid size-10 shrink-0 place-items-center self-start rounded-full text-taupe hover:bg-sand hover:text-error"
                    aria-label={`Remover ${line.product.name} (${line.size}, ${line.color})`}
                    onClick={() => dispatchBag({ type: 'remove', key: line.key })}
                  >
                    <Trash size={18} aria-hidden="true" />
                  </button>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>

          {/* Preferências do pedido */}
          <div className="mt-auto border-t border-sand-line bg-linen px-5 pb-6 pt-4">
            {/* Frete e prazo pelo CEP (estimativa local por região) */}
            <div>
              <div className="flex items-end justify-between gap-3">
                <label htmlFor={`${uid}-cep`} className="text-sm font-semibold">
                  Calcular frete e prazo
                </label>
                <a
                  href="https://buscacepinter.correios.com.br/app/endereco/index.php"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold text-terracotta-deep underline underline-offset-2"
                >
                  Não sei meu CEP<span className="sr-only"> (site dos Correios, abre em nova aba)</span>
                </a>
              </div>
              <input
                id={`${uid}-cep`}
                value={prefs.cep}
                onChange={(e) => setPrefs({ cep: maskCep(e.target.value) })}
                onBlur={() => setCepTouched(true)}
                inputMode="numeric"
                autoComplete="postal-code"
                placeholder="00000-000"
                maxLength={9}
                aria-invalid={!!cepError}
                aria-describedby={cepError ? `${uid}-cep-erro` : `${uid}-cep-ajuda`}
                data-testid="cep-input"
                className="num mt-1.5 h-11 w-full rounded-[10px] bg-ivory px-3 text-sm ring-1 ring-inset ring-sand-line focus:outline-none focus-visible:ring-2 focus-visible:ring-terracotta-deep aria-invalid:ring-2 aria-invalid:ring-error"
              />
              {cepError ? (
                <p id={`${uid}-cep-erro`} role="alert" className="mt-1 text-xs text-error">
                  {cepError}
                </p>
              ) : !quote ? (
                <p id={`${uid}-cep-ajuda`} className="mt-1 text-xs text-taupe">
                  Digite o CEP para ver valores e prazos de entrega.
                </p>
              ) : null}

              <AnimatePresence initial={false}>
                {quote && (
                  <motion.fieldset
                    key="frete"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto', transition: { duration: 0.3, ease } }}
                    exit={{ opacity: 0, height: 0, transition: { duration: 0.18 } }}
                    className="overflow-hidden"
                    data-testid="shipping-options"
                  >
                    <legend className="sr-only">Opção de entrega</legend>
                    <p id={`${uid}-cep-ajuda`} className="mt-2 text-xs text-taupe">
                      Entrega para <strong className="font-semibold text-espresso">{quote.uf}</strong> · estimativa, confirmada na separação
                    </p>
                    <div className="mt-1.5 grid gap-1.5">
                      {quote.options.map((o) => (
                        <label
                          key={o.method}
                          className={`flex min-h-11 cursor-pointer items-center gap-3 rounded-[10px] px-3 py-2 ring-1 ring-inset transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-terracotta-deep ${
                            prefs.shipping === o.method ? 'bg-ivory ring-espresso' : 'ring-sand-line hover:bg-ivory'
                          }`}
                        >
                          <input
                            type="radio"
                            name={`${uid}-ship`}
                            value={o.method}
                            checked={prefs.shipping === o.method}
                            onChange={() => setPrefs({ shipping: o.method })}
                            className="size-4 accent-terracotta-deep"
                          />
                          <span className="flex flex-1 flex-wrap items-baseline justify-between gap-x-3 text-sm">
                            <span>
                              <span className="font-semibold">{o.label}</span> <span className="text-taupe">· {formatDays(o.days)}</span>
                            </span>
                            <span className="num font-semibold">
                              {o.free ? (
                                <>
                                  <s className="mr-1.5 font-normal text-taupe">{formatPrice(o.basePrice)}</s>
                                  <span className="text-sage-deep">Grátis</span>
                                </>
                              ) : (
                                formatPrice(o.price)
                              )}
                            </span>
                          </span>
                        </label>
                      ))}
                    </div>
                  </motion.fieldset>
                )}
              </AnimatePresence>
            </div>

            <fieldset className="mt-4">
              <legend className="text-sm font-semibold">Forma de pagamento preferida</legend>
              <div className="mt-2 grid gap-1.5">
                {paymentOptions.map((o) => (
                  <label
                    key={o.value}
                    className={`flex min-h-11 cursor-pointer items-center gap-3 rounded-[10px] px-3 py-2 ring-1 ring-inset transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-terracotta-deep ${
                      prefs.payment === o.value ? 'bg-ivory ring-espresso' : 'ring-sand-line hover:bg-ivory'
                    }`}
                  >
                    <input type="radio" name={`${uid}-pay`} value={o.value} checked={prefs.payment === o.value} onChange={() => setPrefs({ payment: o.value })} className="size-4 accent-terracotta-deep" />
                    <span className="text-sm">
                      <span className="font-semibold">{o.label}</span> <span className="text-taupe">· {o.hint}</span>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>

            <label className="mt-3 block">
              <span className="text-xs font-semibold text-taupe">Seu nome (opcional)</span>
              <input
                value={prefs.name}
                onChange={(e) => setPrefs({ name: e.target.value.slice(0, 60) })}
                autoComplete="given-name"
                className="mt-1 h-11 w-full rounded-[10px] bg-ivory px-3 text-sm ring-1 ring-inset ring-sand-line focus:outline-none focus-visible:ring-2 focus-visible:ring-terracotta-deep"
              />
            </label>

            <dl className="num mt-4 space-y-1 text-sm">
              <div className="flex justify-between">
                <dt className="text-taupe">Subtotal</dt>
                <dd>{formatPrice(totals.subtotal)}</dd>
              </div>
              {totals.comboDiscount > 0 && (
                <div className="flex justify-between text-sage-deep">
                  <dt>Combo Look Completo (10%)</dt>
                  <dd>-{formatPrice(totals.comboDiscount)}</dd>
                </div>
              )}
              {totals.pixDiscount > 0 && (
                <div className="flex justify-between text-sage-deep">
                  <dt>Desconto Pix (5%)</dt>
                  <dd>-{formatPrice(totals.pixDiscount)}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-taupe">Frete</dt>
                <dd>
                  {totals.shippingOption
                    ? totals.shippingOption.free
                      ? 'Grátis'
                      : formatPrice(totals.shippingOption.price)
                    : totals.freeShipping
                      ? 'Grátis (Econômico)'
                      : 'informe o CEP'}
                </dd>
              </div>
              <div className="flex items-baseline justify-between border-t border-sand-line pt-2">
                <dt className="font-semibold">{totals.shippingOption ? 'Total com frete' : 'Total estimado'}</dt>
                <dd className="text-2xl font-bold" data-testid="bag-total">
                  {formatPrice(totals.grandTotal)}
                </dd>
              </div>
              {prefs.payment === 'cartao' && (
                <p className="text-right text-xs text-taupe">
                  ou {site.payment.maxInstallments}x de {formatPrice(totals.installmentValue)} sem juros
                </p>
              )}
            </dl>

            <ButtonLink
              href={whatsappLink(bagMessage(bag, prefs))}
              variant="whatsapp"
              size="lg"
              className="mt-4 w-full"
              icon={<WhatsappLogo size={22} weight="fill" aria-hidden="true" />}
              data-testid="checkout-whatsapp"
            >
              Finalizar Pedido pelo WhatsApp
            </ButtonLink>
            <p className="mt-2.5 text-center text-xs text-taupe">A stylist confirma estoque, frete e envia o pagamento. Nada é cobrado no site.</p>
            <div className="mt-1 text-center">
              <Button variant="ghost" size="sm" onClick={() => dispatchBag({ type: 'clear' })} icon={<Trash size={16} aria-hidden="true" />}>
                Esvaziar sacola
              </Button>
            </div>
          </div>
        </div>
      )}
    </Sheet>
  )
}

/** Aviso no topo quando um item (ou o look) entra na sacola. */
export function BagToast() {
  const { lastAdded } = useBag()
  const { setBagOpen } = useShopActions()
  const [dismissedTick, setDismissedTick] = useState(0)
  const visible = !!lastAdded && lastAdded.tick !== dismissedTick

  useEffect(() => {
    if (!lastAdded) return
    const t = setTimeout(() => setDismissedTick(lastAdded.tick), 4200)
    return () => clearTimeout(t)
  }, [lastAdded])

  const first = lastAdded?.lines[0]
  const product = first ? getProduct(first.slug) : undefined
  const text =
    lastAdded && lastAdded.lines.length > 1
      ? `Look completo (${lastAdded.lines.length} peças) adicionado à sacola`
      : product && first
        ? `${product.name} (Tam. ${first.size} · ${first.color}) adicionado à sacola`
        : ''

  return (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-0 top-[116px] z-[65] flex justify-center px-3">
      <AnimatePresence>
        {visible && text && (
          <motion.div
            key={lastAdded?.tick}
            initial={{ opacity: 0, transform: 'translateY(-14px)' }}
            animate={{ opacity: 1, transform: 'translateY(0px)' }}
            exit={{ opacity: 0, transform: 'translateY(-8px)', transition: { duration: 0.16 } }}
            transition={{ duration: 0.36, ease }}
            className="pointer-events-auto flex max-w-[560px] items-center gap-3 rounded-[18px] bg-espresso py-2 pl-2 pr-2 text-linen shadow-lift"
            role="status"
            data-testid="bag-toast"
          >
            <span className="grid size-8 shrink-0 place-items-center rounded-full bg-whatsapp-green">
              <Check size={16} weight="bold" aria-hidden="true" />
            </span>
            <span className="text-sm leading-snug">{text}</span>
            <button
              type="button"
              onClick={() => {
                if (lastAdded) setDismissedTick(lastAdded.tick)
                setBagOpen(true)
              }}
              className="h-10 shrink-0 rounded-full bg-butter px-3.5 text-sm font-semibold text-espresso hover:bg-[#f6dd92]"
            >
              Abrir sacola
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

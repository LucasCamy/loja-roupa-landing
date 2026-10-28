import { site } from '../config/site'
import { computeTotals, formatCep, type BagLine, type CheckoutPrefs } from './bag'
import { formatPrice } from './format'
import { formatDays } from './shipping'

/** Link wa.me com mensagem pré-preenchida. */
export function whatsappLink(message: string = site.whatsappMessages.general, phone: string = site.contact.whatsapp) {
  const digits = phone.replace(/\D/g, '')
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`
}

const paymentText = (prefs: CheckoutPrefs, t: ReturnType<typeof computeTotals>) => {
  switch (prefs.payment) {
    case 'pix':
      return `Pix com 5% OFF (${formatPrice(t.total)})`
    case 'cartao':
      return `Cartão de Crédito em até ${site.payment.maxInstallments}x sem juros (${site.payment.maxInstallments}x de ${formatPrice(t.installmentValue)})`
    case 'combinar':
      return 'Combinar no atendimento'
  }
}

/** Mensagem completa do pedido a partir da sacola. */
export function bagMessage(bag: BagLine[], prefs: CheckoutPrefs) {
  const t = computeTotals(bag, prefs.payment, prefs.cep, prefs.shipping)
  const items = t.lines
    .map(
      (l) =>
        `• ${l.quantity}x ${l.product.name} (Ref. ${l.product.sku})\n  Tam: ${l.size} | Cor: ${l.color} — ${formatPrice(l.lineTotal)}`,
    )
    .join('\n')

  const summary = [`Subtotal: ${formatPrice(t.subtotal)}`]
  if (t.comboDiscount > 0) summary.push(`Combo Look Completo (10% OFF): -${formatPrice(t.comboDiscount)}`)
  summary.push(`Pagamento preferido: ${paymentText(prefs, t)}`)
  const ship = t.shippingOption
  if (ship && t.shippingQuote) {
    const where = `${ship.label} para ${t.shippingQuote.uf}, ${formatDays(ship.days)}`
    summary.push(
      ship.free
        ? `Frete: GRÁTIS · ${where} (pedido acima de ${formatPrice(site.shipping.freeShippingFrom)})`
        : `Frete: ${formatPrice(ship.price)} · ${where} (estimativa)`,
    )
    summary.push(`Total estimado com frete: ${formatPrice(t.grandTotal)}`)
  } else {
    summary.push(
      t.freeShipping
        ? `Frete: GRÁTIS (pedido acima de ${formatPrice(site.shipping.freeShippingFrom)})`
        : `Frete: a calcular pelo CEP (faltam ${formatPrice(t.remainingForFreeShipping)} para o frete grátis)`,
    )
  }
  const name = prefs.name.trim()
  const cep = formatCep(prefs.cep)
  if (name || cep) summary.push([name && `Cliente: ${name}`, cep && `CEP: ${cep}`].filter(Boolean).join(' | '))

  // Sem emoji: caracteres fora do plano básico (pares substitutos) chegam como "�"
  // em alguns clientes do WhatsApp após o redirecionamento do wa.me.
  return [
    `Olá! Gostaria de finalizar meu pedido pelo site da ${site.name}:`,
    '',
    '*ITENS DA SACOLA:*',
    items,
    '',
    '──────────────────────',
    ...summary,
    '',
    'Pode confirmar a disponibilidade para separação?',
  ].join('\n')
}

export function productMessage(name: string, sku: string, color?: string, size?: string) {
  const details = [size && `tamanho ${size}`, color && `cor ${color}`].filter(Boolean).join(', ')
  return `Olá! Tenho uma dúvida sobre a peça "${name}" (Ref. ${sku})${details ? `, ${details}` : ''}. Pode me ajudar?`
}

export function soldOutMessage(name: string, sku: string, size?: string) {
  return `Olá! A peça "${name}" (Ref. ${sku}) está esgotada no site. Quero ser avisada quando voltar${size ? ` no tamanho ${size}` : ''} ou encomendar uma.`
}

export interface StylingBrief {
  name: string
  occasion: string
  size: string
  tones: string[]
  date?: string
  notes?: string
}

export function stylingMessage(b: StylingBrief) {
  return [
    `Olá! Quero uma consultoria de styling da ${site.name}.`,
    '',
    `Nome: ${b.name.trim()}`,
    `Ocasião: ${b.occasion}`,
    `Tamanho habitual: ${b.size}`,
    `Tons preferidos: ${b.tones.length ? b.tones.join(', ') : 'sem preferência'}`,
    b.date ? `Data do evento/viagem: ${b.date}` : '',
    b.notes?.trim() ? `Observações: ${b.notes.trim()}` : '',
  ]
    .filter((line, i) => line !== '' || i === 1)
    .join('\n')
}

/**
 * Regras puras da sacola: linhas, reducer e totais (testados em src/test/bag.test.ts).
 * Não há checkout: os totais alimentam a mensagem de WhatsApp.
 */
import { site } from '../config/site'
import { lookSlugs } from '../data/look'
import { getProduct, type Product, type Size } from '../data/products'
import type { ShippingMethod } from '../data/shipping'
import { round2 } from './format'
import { quoteShipping, type ShippingOption, type ShippingQuote } from './shipping'

export interface BagLine {
  slug: string
  size: Size
  color: string
  quantity: number
}

export type PaymentPreference = 'pix' | 'cartao' | 'combinar'

export interface CheckoutPrefs {
  payment: PaymentPreference
  shipping: ShippingMethod
  name: string
  cep: string
}

export const MAX_QTY = 10

/** Chave única da linha: mesmo slug em outro tamanho ou cor é outra linha. */
export const lineKey = (l: Pick<BagLine, 'slug' | 'size' | 'color'>) => `${l.slug}|${l.size}|${l.color}`

export type BagAction =
  | { type: 'add'; line: BagLine }
  | { type: 'addMany'; lines: BagLine[] }
  | { type: 'setQty'; key: string; quantity: number }
  | { type: 'remove'; key: string }
  | { type: 'clear' }

const clampQty = (n: number) => Math.max(1, Math.min(MAX_QTY, Math.floor(n)))

function addLine(bag: BagLine[], line: BagLine): BagLine[] {
  const key = lineKey(line)
  const existing = bag.find((l) => lineKey(l) === key)
  if (existing) return bag.map((l) => (l === existing ? { ...l, quantity: clampQty(l.quantity + line.quantity) } : l))
  return [...bag, { ...line, quantity: clampQty(line.quantity) }]
}

export function bagReducer(bag: BagLine[], action: BagAction): BagLine[] {
  switch (action.type) {
    case 'add':
      return addLine(bag, action.line)
    case 'addMany':
      return action.lines.reduce(addLine, bag)
    case 'setQty':
      return bag.map((l) => (lineKey(l) === action.key ? { ...l, quantity: clampQty(action.quantity) } : l))
    case 'remove':
      return bag.filter((l) => lineKey(l) !== action.key)
    case 'clear':
      return []
  }
}

export interface PricedLine extends BagLine {
  key: string
  product: Product
  lineTotal: number
}

export interface BagTotals {
  lines: PricedLine[]
  count: number
  subtotal: number
  /** 10% nas peças do look quando as 3 estão na sacola */
  comboDiscount: number
  pixDiscount: number
  /** Peças com descontos, sem frete */
  total: number
  /** Cotação pelo CEP (null sem CEP válido) e opção escolhida */
  shippingQuote: ShippingQuote | null
  shippingOption: ShippingOption | null
  /** total + frete escolhido (igual a total enquanto não houver cotação) */
  grandTotal: number
  /** Pedido atingiu o valor do frete grátis (Econômico) */
  freeShipping: boolean
  remainingForFreeShipping: number
  /** 0–1 para a barra de progresso */
  shippingProgress: number
  installmentValue: number
}

export const hasFullLook = (lines: Pick<BagLine, 'slug'>[]) => lookSlugs.every((slug) => lines.some((l) => l.slug === slug))

export function computeTotals(bag: BagLine[], payment: PaymentPreference = 'pix', cep = '', shipping: ShippingMethod = 'economico'): BagTotals {
  const lines: PricedLine[] = bag.flatMap((l) => {
    const product = getProduct(l.slug)
    return product ? [{ ...l, key: lineKey(l), product, lineTotal: round2(product.price * l.quantity) }] : []
  })
  const subtotal = round2(lines.reduce((sum, l) => sum + l.lineTotal, 0))
  const comboBase = hasFullLook(lines) ? lines.filter((l) => lookSlugs.includes(l.slug)).reduce((s, l) => s + l.lineTotal, 0) : 0
  const comboDiscount = round2(comboBase * site.payment.lookComboDiscount)
  const afterCombo = round2(subtotal - comboDiscount)
  const pixDiscount = payment === 'pix' ? round2(afterCombo * site.payment.pixDiscount) : 0
  const total = round2(afterCombo - pixDiscount)
  const goal = site.shipping.freeShippingFrom
  const shippingQuote = lines.length ? quoteShipping(cep, afterCombo) : null
  const shippingOption = shippingQuote?.options.find((o) => o.method === shipping) ?? null
  return {
    lines,
    count: lines.reduce((n, l) => n + l.quantity, 0),
    subtotal,
    comboDiscount,
    pixDiscount,
    total,
    shippingQuote,
    shippingOption,
    grandTotal: round2(total + (shippingOption?.price ?? 0)),
    freeShipping: afterCombo >= goal,
    remainingForFreeShipping: round2(Math.max(0, goal - afterCombo)),
    shippingProgress: Math.min(1, afterCombo / goal),
    installmentValue: round2((afterCombo + (shippingOption?.price ?? 0)) / site.payment.maxInstallments),
  }
}

/** Aceita 79000000 ou 79000-000; devolve 79000-000 ou '' se inválido. */
export function formatCep(raw: string) {
  const d = raw.replace(/\D/g, '')
  return d.length === 8 ? `${d.slice(0, 5)}-${d.slice(5)}` : ''
}

/** Valida linhas lidas do localStorage (produto existe, tamanho válido, quantidade sã). */
export function sanitizeBag(value: unknown): BagLine[] {
  if (!Array.isArray(value)) return []
  return value.flatMap((raw) => {
    const l = raw as Partial<BagLine>
    const product = typeof l?.slug === 'string' ? getProduct(l.slug) : undefined
    if (!product || !product.sizes.some((s) => s.size === l.size) || typeof l.color !== 'string') return []
    return [{ slug: product.slug, size: l.size as Size, color: l.color, quantity: clampQty(Number(l.quantity) || 1) }]
  })
}

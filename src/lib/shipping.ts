import { site } from '../config/site'
import { cepRanges, methodLabel, shippingZones, type ShippingMethod, type UF } from '../data/shipping'

export interface ShippingOption {
  method: ShippingMethod
  label: string
  /** Valor cobrado (0 quando o frete grátis se aplica) */
  price: number
  /** Valor de tabela, antes do frete grátis */
  basePrice: number
  free: boolean
  days: [number, number]
}

export interface ShippingQuote {
  cep: string
  uf: UF
  options: ShippingOption[]
}

/** UF a partir do CEP (8 dígitos, com ou sem hífen). */
export function ufFromCep(cep: string): UF | null {
  const digits = cep.replace(/\D/g, '')
  if (digits.length !== 8) return null
  const prefix = Number(digits.slice(0, 5))
  return cepRanges.find(([from, to]) => prefix >= from && prefix <= to)?.[2] ?? null
}

/**
 * Estimativa de frete por região. O Econômico fica grátis quando o valor das
 * peças (após o combo) atinge `site.shipping.freeShippingFrom`.
 */
export function quoteShipping(cep: string, goodsTotal: number): ShippingQuote | null {
  const uf = ufFromCep(cep)
  const zone = uf && shippingZones.find((z) => z.ufs.includes(uf))
  if (!uf || !zone) return null
  const qualifies = goodsTotal >= site.shipping.freeShippingFrom
  const options = (['economico', 'expresso'] as const).map((method) => {
    const { price, days } = zone[method]
    const free = method === 'economico' && qualifies
    return { method, label: methodLabel[method], basePrice: price, price: free ? 0 : price, free, days }
  })
  const digits = cep.replace(/\D/g, '')
  return { cep: `${digits.slice(0, 5)}-${digits.slice(5)}`, uf, options }
}

export const formatDays = ([min, max]: [number, number]) => (min === max ? `${min} ${min > 1 ? 'dias úteis' : 'dia útil'}` :`${min} a ${max} dias úteis`)

/** Máscara progressiva 00000-000 enquanto a pessoa digita. */
export function maskCep(raw: string) {
  const d = raw.replace(/\D/g, '').slice(0, 8)
  return d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d
}

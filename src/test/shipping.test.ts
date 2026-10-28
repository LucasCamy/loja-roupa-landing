import { describe, expect, it } from 'vitest'
import { computeTotals, type BagLine } from '../lib/bag'
import { maskCep, quoteShipping, ufFromCep } from '../lib/shipping'

describe('ufFromCep', () => {
  it.each([
    ['01310-100', 'SP'],
    ['20040-020', 'RJ'],
    ['30130-010', 'MG'],
    ['40020-000', 'BA'],
    ['69005-000', 'AM'],
    ['69301-000', 'RR'],
    ['70040-010', 'DF'],
    ['74000-000', 'GO'],
    ['79000000', 'MS'],
    ['88010-000', 'SC'],
    ['90010-000', 'RS'],
  ])('%s → %s', (cep, uf) => expect(ufFromCep(cep)).toBe(uf))

  it('rejeita CEP incompleto ou fora das faixas', () => {
    expect(ufFromCep('7900')).toBeNull()
    expect(ufFromCep('00000-000')).toBeNull()
  })
})

describe('quoteShipping', () => {
  it('cota Econômico e Expresso pela região', () => {
    const q = quoteShipping('01310-100', 200)!
    expect(q.uf).toBe('SP')
    expect(q.cep).toBe('01310-100')
    expect(q.options.map((o) => [o.method, o.price, o.days])).toEqual([
      ['economico', 22.9, [4, 7]],
      ['expresso', 39.9, [2, 3]],
    ])
  })

  it('zera o Econômico a partir de R$ 399, mas não o Expresso', () => {
    const q = quoteShipping('69005-000', 399)!
    expect(q.options[0]).toMatchObject({ method: 'economico', free: true, price: 0, basePrice: 42.9 })
    expect(q.options[1]).toMatchObject({ method: 'expresso', free: false, price: 79.9 })
  })
})

describe('computeTotals com frete', () => {
  const vestido: BagLine = { slug: 'vestido-midi-brisa', size: 'M', color: 'Terracota', quantity: 1 }

  it('soma o frete escolhido ao total e às parcelas', () => {
    const t = computeTotals([vestido], 'cartao', '20040-020', 'expresso')
    expect(t.shippingOption?.price).toBe(49.9)
    expect(t.grandTotal).toBe(438.9)
    expect(t.installmentValue).toBeCloseTo(73.15, 2)
  })

  it('sem CEP válido não há cotação e o total fica só com as peças', () => {
    const t = computeTotals([vestido], 'pix', '7900')
    expect(t.shippingQuote).toBeNull()
    expect(t.grandTotal).toBe(t.total)
  })

  it('sacola vazia não cota frete', () => {
    expect(computeTotals([], 'pix', '79000-000').shippingQuote).toBeNull()
  })
})

describe('maskCep', () => {
  it('aplica a máscara enquanto digita', () => {
    expect(maskCep('790')).toBe('790')
    expect(maskCep('790001')).toBe('79000-1')
    expect(maskCep('79000-000123')).toBe('79000-000')
  })
})

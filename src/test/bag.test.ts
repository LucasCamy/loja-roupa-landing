import { describe, expect, it } from 'vitest'
import { bagReducer, computeTotals, formatCep, hasFullLook, lineKey, MAX_QTY, sanitizeBag, type BagLine } from '../lib/bag'

const vestidoM: BagLine = { slug: 'vestido-midi-brisa', size: 'M', color: 'Terracota', quantity: 1 }

describe('bagReducer', () => {
  it('cria linhas distintas para o mesmo slug em tamanhos diferentes', () => {
    let bag = bagReducer([], { type: 'add', line: vestidoM })
    bag = bagReducer(bag, { type: 'add', line: { ...vestidoM, size: 'P' } })
    expect(bag).toHaveLength(2)
    expect(bag.map((l) => l.size)).toEqual(['M', 'P'])
  })

  it('cria linhas distintas para o mesmo slug e tamanho em cores diferentes', () => {
    let bag = bagReducer([], { type: 'add', line: vestidoM })
    bag = bagReducer(bag, { type: 'add', line: { ...vestidoM, color: 'Areia' } })
    expect(bag).toHaveLength(2)
  })

  it('incrementa a quantidade quando slug + tamanho + cor coincidem', () => {
    let bag = bagReducer([], { type: 'add', line: vestidoM })
    bag = bagReducer(bag, { type: 'add', line: { ...vestidoM, quantity: 2 } })
    expect(bag).toEqual([{ ...vestidoM, quantity: 3 }])
  })

  it('limita a quantidade entre 1 e o máximo', () => {
    const bag = bagReducer([], { type: 'add', line: { ...vestidoM, quantity: 99 } })
    expect(bag[0].quantity).toBe(MAX_QTY)
    expect(bagReducer(bag, { type: 'setQty', key: lineKey(vestidoM), quantity: 0 })[0].quantity).toBe(1)
  })

  it('altera quantidade e remove pela chave, sem afetar outras linhas', () => {
    let bag = bagReducer([], { type: 'addMany', lines: [vestidoM, { ...vestidoM, size: 'G' }] })
    bag = bagReducer(bag, { type: 'setQty', key: lineKey(vestidoM), quantity: 4 })
    expect(bag[0].quantity).toBe(4)
    bag = bagReducer(bag, { type: 'remove', key: lineKey(vestidoM) })
    expect(bag).toEqual([{ ...vestidoM, size: 'G' }])
    expect(bagReducer(bag, { type: 'clear' })).toEqual([])
  })
})

describe('computeTotals', () => {
  it('soma subtotal, aplica 5% de Pix e indica quanto falta para o frete grátis', () => {
    const t = computeTotals([vestidoM], 'pix') // 389
    expect(t.subtotal).toBe(389)
    expect(t.pixDiscount).toBe(19.45)
    expect(t.total).toBe(369.55)
    expect(t.freeShipping).toBe(false)
    expect(t.remainingForFreeShipping).toBe(10)
    expect(t.count).toBe(1)
  })

  it('libera frete grátis a partir de R$ 399 e não desconta no cartão', () => {
    const t = computeTotals([vestidoM, { slug: 'blazer-oversized-atelier', size: 'P', color: 'Areia', quantity: 1 }], 'cartao')
    expect(t.subtotal).toBe(848)
    expect(t.pixDiscount).toBe(0)
    expect(t.total).toBe(848)
    expect(t.freeShipping).toBe(true)
    expect(t.remainingForFreeShipping).toBe(0)
    expect(t.installmentValue).toBeCloseTo(141.33, 2)
  })

  it('aplica 10% no combo quando as 3 peças do look estão na sacola, antes do Pix', () => {
    const look: BagLine[] = [
      { slug: 'blazer-oversized-atelier', size: 'P', color: 'Areia', quantity: 1 },
      { slug: 'top-cropped-trico-mel', size: 'P', color: 'Off-white', quantity: 1 },
      { slug: 'calca-pantalona-duna', size: 'P', color: 'Areia', quantity: 1 },
    ]
    expect(hasFullLook(look)).toBe(true)
    const t = computeTotals([...look, vestidoM], 'pix')
    expect(t.subtotal).toBe(977 + 389)
    expect(t.comboDiscount).toBe(97.7)
    expect(t.pixDiscount).toBe(63.42) // 5% de 1268,30
    expect(t.total).toBe(1204.88)
    expect(computeTotals(look.slice(0, 2)).comboDiscount).toBe(0)
  })
})

describe('utilitários', () => {
  it('formata CEP válido e rejeita inválido', () => {
    expect(formatCep('79000000')).toBe('79000-000')
    expect(formatCep('79000-000')).toBe('79000-000')
    expect(formatCep('7900')).toBe('')
  })

  it('descarta linhas inválidas vindas do localStorage', () => {
    const clean = sanitizeBag([vestidoM, { slug: 'nao-existe', size: 'M', color: 'X', quantity: 1 }, { ...vestidoM, size: 'XG' }, { ...vestidoM, quantity: 'a' }, null])
    expect(clean).toEqual([vestidoM, vestidoM])
    expect(sanitizeBag('lixo')).toEqual([])
  })
})

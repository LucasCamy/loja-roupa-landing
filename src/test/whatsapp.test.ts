import { describe, expect, it } from 'vitest'
import type { BagLine, CheckoutPrefs } from '../lib/bag'
import { bagMessage, productMessage, stylingMessage, whatsappLink } from '../lib/whatsapp'

const bag: BagLine[] = [
  { slug: 'vestido-midi-brisa', size: 'M', color: 'Terracota', quantity: 1 },
  { slug: 'blazer-oversized-atelier', size: 'P', color: 'Areia', quantity: 1 },
]
const prefs: CheckoutPrefs = { payment: 'pix', shipping: 'economico', name: 'Maria', cep: '79000000' }

describe('bagMessage', () => {
  it('reproduz o pedido com nome, SKU, tamanho, cor, quantidade, subtotal, Pix e frete grátis', () => {
    const msg = bagMessage(bag, prefs)
    expect(msg).toBe(
      [
        'Olá! Gostaria de finalizar meu pedido pelo site da Aura Atelier:',
        '',
        '*ITENS DA SACOLA:*',
        '• 1x Vestido Midi Brisa em Linho (Ref. AU-101)',
        '  Tam: M | Cor: Terracota — R$ 389,00',
        '• 1x Blazer Oversized Atelier (Ref. AU-102)',
        '  Tam: P | Cor: Areia — R$ 459,00',
        '',
        '──────────────────────',
        'Subtotal: R$ 848,00',
        'Pagamento preferido: Pix com 5% OFF (R$ 805,60)',
        'Frete: GRÁTIS · Econômico para MS, 2 a 4 dias úteis (pedido acima de R$ 399,00)',
        'Total estimado com frete: R$ 805,60',
        'Cliente: Maria | CEP: 79000-000',
        '',
        'Pode confirmar a disponibilidade para separação?',
      ].join('\n'),
    )
  })

  it('mostra quantidade multiplicada, frete a calcular e omite cliente vazio', () => {
    const msg = bagMessage([{ slug: 'regata-linho-off-white', size: 'G', color: 'Areia', quantity: 2 }], { payment: 'cartao', shipping: 'economico', name: '', cep: '' })
    expect(msg).toContain('• 2x Regata Linho Off-White (Ref. AU-109)\n  Tam: G | Cor: Areia — R$ 318,00')
    expect(msg).toContain('Subtotal: R$ 318,00')
    expect(msg).toContain('Cartão de Crédito em até 6x sem juros (6x de R$ 53,00)')
    expect(msg).toContain('Frete: a calcular pelo CEP (faltam R$ 81,00 para o frete grátis)')
    expect(msg).not.toContain('Cliente:')
  })

  it('inclui o desconto do combo do look', () => {
    const look: BagLine[] = [
      { slug: 'blazer-oversized-atelier', size: 'M', color: 'Areia', quantity: 1 },
      { slug: 'top-cropped-trico-mel', size: 'M', color: 'Off-white', quantity: 1 },
      { slug: 'calca-pantalona-duna', size: 'M', color: 'Areia', quantity: 1 },
    ]
    expect(bagMessage(look, { payment: 'combinar', shipping: 'economico', name: '', cep: '' })).toContain('Combo Look Completo (10% OFF): -R$ 97,70')
  })

  it('gera link wa.me só com dígitos e texto codificado que volta idêntico', () => {
    const msg = bagMessage(bag, prefs)
    const link = whatsappLink(msg, '+55 (67) 90000-0000')
    expect(link.startsWith('https://wa.me/5567900000000?text=')).toBe(true)
    const text = new URL(link).searchParams.get('text') ?? ''
    expect(text).toBe(msg)
    for (const piece of ['AU-101', 'AU-102', 'Tam: M', 'Cor: Terracota', '1x', 'R$ 848,00', 'GRÁTIS']) expect(text).toContain(piece)
  })
})

describe('frete na mensagem e codificação', () => {
  it('frete pago (Expresso ou abaixo do mínimo) entra com valor, prazo e total com frete', () => {
    const one: BagLine[] = [{ slug: 'calca-reta-linho-cru', size: 'M', color: 'Cru', quantity: 1 }]
    const msg = bagMessage(one, { payment: 'pix', shipping: 'economico', name: '', cep: '01310-100' })
    expect(msg).toContain('Frete: R$ 22,90 · Econômico para SP, 4 a 7 dias úteis (estimativa)')
    expect(msg).toContain('Total estimado com frete: R$ 306,95') // 284,05 + 22,90
    const expresso = bagMessage(bag, { ...prefs, shipping: 'expresso' })
    expect(expresso).toContain('Frete: R$ 24,90 · Expresso para MS, 1 a 2 dias úteis (estimativa)')
    expect(expresso).toContain('Total estimado com frete: R$ 830,50')
  })

  it('só usa caracteres do plano básico (nada de pares substitutos que viram "�")', () => {
    const msg = bagMessage(bag, prefs)
    expect(/[\uD800-\uDFFF]/.test(msg)).toBe(false)
    expect(msg).not.toContain('�')
  })
})

describe('outras mensagens', () => {
  it('pergunta sobre peça com tamanho e cor', () => {
    expect(productMessage('Vestido Midi Brisa em Linho', 'AU-101', 'Areia', 'P')).toContain('(Ref. AU-101), tamanho P, cor Areia')
  })
  it('monta o briefing de styling', () => {
    const msg = stylingMessage({ name: 'Ana', occasion: 'Viagem / Mala Cápsula', size: 'M', tones: ['Sálvia'], notes: '' })
    expect(msg).toContain('Ocasião: Viagem / Mala Cápsula')
    expect(msg).toContain('Tons preferidos: Sálvia')
    expect(msg).not.toContain('Observações')
  })
})

import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../App'
import { BAG_KEY } from '../lib/shop'

beforeEach(() => localStorage.clear())

describe('fluxo da vitrine', () => {
  it('quick-add do card adiciona tamanho + cor à sacola e mostra o aviso', async () => {
    const user = userEvent.setup()
    render(<App />)
    const card = screen.getAllByTestId('product-card').find((c) => c.dataset.slug === 'vestido-midi-brisa')!
    await user.click(within(card).getByRole('radio', { name: 'Areia' }))
    await user.click(within(card).getByRole('button', { name: /Adicionar Vestido Midi Brisa em Linho à sacola/ }))
    await user.click(within(within(card).getByTestId('quick-add')).getByRole('radio', { name: 'M' }))

    expect(await screen.findByTestId('bag-toast')).toHaveTextContent('Vestido Midi Brisa em Linho (Tam. M · Areia) adicionado à sacola')
    expect(JSON.parse(localStorage.getItem(BAG_KEY)!)).toEqual([{ slug: 'vestido-midi-brisa', size: 'M', color: 'Areia', quantity: 1 }])
  })

  it('filtro de categoria e tamanho reduz a vitrine e "Limpar filtros" restaura', async () => {
    const user = userEvent.setup()
    render(<App />)
    const vitrine = screen.getByRole('region', { name: /A vitrine/ })
    await user.click(within(vitrine).getByRole('button', { name: 'Blusas & Tricôs' }))
    await user.click(within(vitrine).getByRole('button', { name: 'GG', pressed: false }))
    expect(within(vitrine).getByTestId('result-count')).toHaveTextContent('1 peça encontrada')
    await user.type(within(vitrine).getByRole('searchbox', { name: 'Buscar peça' }), 'zzz')
    await user.click(within(vitrine).getByRole('button', { name: 'Limpar filtros' }))
    expect(within(vitrine).getByTestId('result-count')).toHaveTextContent('12 peças encontradas')
  })

  it('detalhe exige tamanho, abre guia de medidas e adiciona abrindo a sacola com link do WhatsApp', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: 'Blazer Oversized Atelier' }))
    const dialog = await screen.findByRole('dialog', { name: 'Blazer Oversized Atelier' })
    await user.click(within(dialog).getByRole('button', { name: 'Adicionar à Sacola' }))
    expect(within(dialog).getByRole('alert')).toHaveTextContent('Escolha um tamanho')
    await user.click(within(dialog).getByRole('button', { name: /Guia de Medidas/ }))
    expect(within(dialog).getAllByRole('table')[0]).toHaveTextContent('Busto')
    expect(within(dialog).getByRole('radio', { name: 'PP, esgotado' })).toBeDisabled()
    await user.click(within(dialog).getByRole('radio', { name: 'Off-white' }))
    await user.click(within(dialog).getByRole('radio', { name: 'G' }))
    await user.click(within(dialog).getByRole('button', { name: 'Aumentar quantidade' }))
    await user.click(within(dialog).getByRole('button', { name: 'Adicionar à Sacola' }))

    const bag = await screen.findByRole('dialog', { name: /Sua sacola/ })
    expect(within(bag).getAllByTestId('bag-line')).toHaveLength(1)
    expect(within(bag).getByText('Tam: G')).toBeInTheDocument()
    const href = within(bag).getByTestId('checkout-whatsapp').getAttribute('href')!
    const text = new URL(href).searchParams.get('text')!
    expect(text).toContain('• 2x Blazer Oversized Atelier (Ref. AU-102)\n  Tam: G | Cor: Off-white — R$ 918,00')
    expect(text).toContain('Frete: GRÁTIS')
  })

  it('look completo entra com 3 linhas e desconto do combo', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByTestId('add-look'))
    const bag = await screen.findByRole('dialog', { name: /Sua sacola/ })
    expect(within(bag).getAllByTestId('bag-line')).toHaveLength(3)
    expect(within(bag).getByText('Combo Look Completo (10%)')).toBeInTheDocument()
  })

  it('briefing de styling valida campos obrigatórios com alertas acessíveis', async () => {
    const user = userEvent.setup()
    render(<App />)
    const form = screen.getByRole('button', { name: 'Enviar briefing para a stylist' }).closest('form')!
    await user.click(within(form).getByRole('button', { name: 'Enviar briefing para a stylist' }))
    expect(within(form).getAllByRole('alert')).toHaveLength(3)
    expect(within(form).getByLabelText('Seu nome')).toHaveAttribute('aria-invalid', 'true')
  })
})

const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

/** R$ 1.234,56 (o espaço não separável do Intl vira espaço comum para mensagens e testes) */
export const formatPrice = (value: number) => brl.format(Math.round(value * 100) / 100).replace(/\u00a0/g, ' ')

export const round2 = (value: number) => Math.round(value * 100) / 100

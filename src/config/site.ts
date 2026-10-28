/**
 * CONFIGURAÇÃO CENTRAL DA LOJA
 * ------------------------------------------------------------------
 * Nome, contatos, frete, Instagram e textos-chave. Troque antes de publicar.
 *
 * ATENÇÃO: contatos e dados abaixo são FICTÍCIOS (marca demonstrativa).
 * `isDemo: true` mantém avisos de conteúdo demonstrativo na página.
 * Mude para `false` só quando todos os dados forem reais.
 */
export const site = {
  isDemo: true,

  name: 'Aura Atelier',
  descriptor: 'Moda Feminina & Linho Autoral',
  tagline: 'Linho que veste o tempo.',
  description:
    'Vestidos, alfaiataria, tricôs e conjuntos em linho e fibras naturais, com modelagem autoral, tiragem limitada e numeração do PP ao GG.',
  founder: {
    name: 'Helena Marçal', // FICTÍCIO
    role: 'diretora criativa e modelista',
  },

  contact: {
    // FICTÍCIO: formato internacional, só dígitos (55 + DDD + número)
    whatsapp: '5567900000000',
    whatsappDisplay: '(67) 90000-0000',
    email: 'atendimento@auraatelier.example', // FICTÍCIO (domínio reservado .example)
    instagramHandle: '@aura.atelier.demo', // FICTÍCIO
    instagramUrl: 'https://instagram.com/aura.atelier.demo', // FICTÍCIO
    hours: 'Seg a sex, 9h às 18h · Sáb, 9h às 13h',
    city: 'Campo Grande, MS', // FICTÍCIO
  },

  shipping: {
    freeShippingFrom: 399, // em reais
    summary: 'Envio para todo o Brasil. Separação em até 2 dias úteis para peças de pronta-entrega.',
  },

  payment: {
    pixDiscount: 0.05,
    maxInstallments: 6,
    lookComboDiscount: 0.1,
  },

  topbar: ['Frete grátis acima de R$ 399', '5% OFF no Pix', '1ª troca por nossa conta'],

  nav: [
    { label: 'Coleção', href: '#colecao' },
    { label: 'Categorias', href: '#categorias' },
    { label: 'Compre o Look', href: '#look' },
    { label: 'Nosso Linho', href: '#linho' },
    { label: 'Consultoria', href: '#consultoria' },
    { label: 'Dúvidas', href: '#duvidas' },
  ],

  whatsappMessages: {
    general: 'Olá! Vim pelo site da Aura Atelier e gostaria de ajuda para escolher uma peça.',
    look: 'Olá! Quero ajuda para montar um look completo da coleção Outono/Inverno da Aura Atelier.',
  },

  legal: {
    // Dados do fornecedor (Decreto 7.962/2013): PENDENTES, preencher antes de publicar.
    companyName: '',
    cnpj: '',
    address: '',
  },
} as const

export type Site = typeof site

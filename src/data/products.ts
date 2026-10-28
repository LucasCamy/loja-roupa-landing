/**
 * CATÁLOGO DEMONSTRATIVO (FICTÍCIO)
 * ------------------------------------------------------------------
 * Preços, estoques, medidas e SKUs são exemplos. Fotos: public/media
 * (geradas por IA, modelos fictícias; ver MEDIA_MANIFEST.json).
 * Produtos 9–12 usam recortes das mesmas sessões de foto (AU-109 a AU-112).
 */
import { asset, type MediaAsset } from '../lib/media'
import type { CategoryId } from './categories'

export type Size = 'PP' | 'P' | 'M' | 'G' | 'GG'
export const SIZES: Size[] = ['PP', 'P', 'M', 'G', 'GG']

export type Availability = 'pronta-entrega' | 'sob-medida' | 'esgotado'
export type BadgeLabel = 'Novo Drop' | 'Mais Vendido' | 'Edição Limitada' | 'Últimas Peças'

export interface ColorOption {
  name: string
  hex: string
}

export interface SizeStock {
  size: Size
  inStock: boolean
  lastUnits?: boolean
}

export interface Measurement {
  busto: number
  cintura: number
  quadril: number
  comprimento: number
}

export interface Product {
  id: string
  sku: string
  name: string
  slug: string
  category: Exclude<CategoryId, 'todos'>
  alsoIn: Exclude<CategoryId, 'todos'>[]
  price: number
  compareAtPrice?: number
  /** Máximo de parcelas sem juros */
  installments: number
  image: MediaAsset
  gallery: MediaAsset[]
  colors: ColorOption[]
  sizes: SizeStock[]
  measurements: Partial<Record<Size, Measurement>>
  modelNote: string
  fabric: string
  care: string
  availability: Availability
  badge?: BadgeLabel
  description: string
}

export const palette = {
  terracota: { name: 'Terracota', hex: '#C4684E' },
  areia: { name: 'Areia', hex: '#D8C6AA' },
  offWhite: { name: 'Off-white', hex: '#F4EEE3' },
  cru: { name: 'Cru', hex: '#E9DFCC' },
  manteiga: { name: 'Manteiga', hex: '#F2D479' },
  salvia: { name: 'Sálvia', hex: '#7F9179' },
  cacau: { name: 'Cacau', hex: '#5A3426' },
  oliva: { name: 'Oliva', hex: '#6B6A45' },
} satisfies Record<string, ColorOption>

/** Gera a tabela de medidas a partir do tamanho P (incrementos de 4 cm por tamanho em busto/cintura/quadril). */
function measure(base: Measurement, lengthStep = 1): Partial<Record<Size, Measurement>> {
  const table: Partial<Record<Size, Measurement>> = {}
  SIZES.forEach((size, i) => {
    const d = i - 1
    table[size] = {
      busto: base.busto + d * 4,
      cintura: base.cintura + d * 4,
      quadril: base.quadril + d * 4,
      comprimento: base.comprimento + d * lengthStep,
    }
  })
  return table
}

const all = (overrides: Partial<Record<Size, Omit<SizeStock, 'size'>>> = {}): SizeStock[] =>
  SIZES.map((size) => ({ size, inStock: true, ...overrides[size] }))

const pair = (n: string, name: string, front: string, detail: string, w = 1000, h = 1250) => ({
  image: asset(`prod-${n}-a`, front, w, h),
  gallery: [asset(`prod-${n}-a`, front, w, h), asset(`prod-${n}-b`, detail, w, h)],
  name,
})

const linenCare = 'Lavar à mão ou ciclo delicado em água fria, secar à sombra, passar a vapor do avesso. O linho amacia a cada lavagem.'
const knitCare = 'Lavar à mão em água fria com sabão neutro, secar na horizontal à sombra. Não torcer nem pendurar.'

export const products: Product[] = [
  {
    id: 'p01',
    sku: 'AU-101',
    slug: 'vestido-midi-brisa',
    category: 'vestidos',
    alsoIn: [],
    price: 389,
    installments: 6,
    ...pair('01', 'Vestido Midi Brisa em Linho', 'Vista frontal de vestido midi de linho terracota com alças largas e botões naturais.', 'Detalhe de textura e acabamento do vestido midi de linho terracota com botões naturais.'),
    gallery: [
      asset('prod-01-a', 'Vista frontal de vestido midi de linho terracota com alças largas e botões naturais.'),
      asset('prod-01-b', 'Detalhe de textura e acabamento do vestido midi de linho terracota com botões naturais.'),
      asset('hero-main', 'Modelo com vestido midi de linho terracota em ateliê iluminado pelo sol.', 1920, 1200, '54% 48%'),
    ],
    colors: [palette.terracota, palette.areia],
    sizes: all({ GG: { inStock: true, lastUnits: true } }),
    measurements: measure({ busto: 86, cintura: 70, quadril: 100, comprimento: 118 }),
    modelNote: 'A modelo mede 1,72 m e veste tamanho P.',
    fabric: '70% Linho Puro, 30% Viscose Eco · Forro 100% Algodão',
    care: linenCare,
    availability: 'pronta-entrega',
    badge: 'Mais Vendido',
    description: 'Alças largas, botões de coco na frente toda e saia rodada que acompanha o passo. O midi que vai do almoço de domingo ao jantar sem trocar.',
  },
  {
    id: 'p02',
    sku: 'AU-102',
    slug: 'blazer-oversized-atelier',
    category: 'alfaiataria',
    alsoIn: ['conjuntos'],
    price: 459,
    installments: 6,
    ...pair('02', 'Blazer Oversized Atelier', 'Vista frontal de blazer oversized de linho areia com lapelas e bolsos.', 'Detalhe da lapela e textura do blazer oversized de linho areia.'),
    colors: [palette.areia, palette.offWhite],
    sizes: all({ PP: { inStock: false } }),
    measurements: measure({ busto: 104, cintura: 100, quadril: 106, comprimento: 72 }),
    modelNote: 'A modelo mede 1,72 m e veste tamanho P. Modelagem ampla: se preferir ajustado, escolha um tamanho abaixo.',
    fabric: '100% Linho Puro · Forro 100% Viscose',
    care: linenCare,
    availability: 'pronta-entrega',
    badge: 'Novo Drop',
    description: 'Ombro levemente caído, lapela clássica e bolsos chapados. Estrutura de alfaiataria com o frescor do linho.',
  },
  {
    id: 'p03',
    sku: 'AU-103',
    slug: 'calca-pantalona-duna',
    category: 'calcas-saias',
    alsoIn: ['alfaiataria'],
    price: 329,
    installments: 6,
    ...pair('03', 'Calça Pantalona Duna', 'Vista frontal de calça pantalona areia com cintura alta e pregas de alfaiataria.', 'Detalhe das pregas e do caimento da calça pantalona areia.'),
    colors: [palette.areia, palette.cru],
    sizes: all(),
    measurements: measure({ busto: 0, cintura: 68, quadril: 102, comprimento: 108 }),
    modelNote: 'A modelo mede 1,72 m e veste tamanho P. Barra pensada para salto baixo.',
    fabric: '55% Linho, 45% Viscose Eco',
    care: linenCare,
    availability: 'pronta-entrega',
    description: 'Cintura alta com pregas profundas e perna ampla que alonga. Passantes discretos e bolsos faca.',
  },
  {
    id: 'p04',
    sku: 'AU-104',
    slug: 'top-cropped-trico-mel',
    category: 'blusas',
    alsoIn: [],
    price: 189,
    installments: 6,
    ...pair('04', 'Top Cropped Tricô Mel', 'Vista frontal de top cropped de tricô artesanal amarelo manteiga com ponto texturizado.', 'Detalhe do ponto texturizado do top cropped de tricô amarelo manteiga.'),
    colors: [palette.manteiga, palette.offWhite],
    sizes: all({ P: { inStock: true, lastUnits: true }, GG: { inStock: false } }),
    measurements: measure({ busto: 82, cintura: 76, quadril: 0, comprimento: 44 }, 0.5),
    modelNote: 'A modelo mede 1,72 m e veste tamanho P. Malha com elasticidade moderada.',
    fabric: '60% Algodão Orgânico, 40% Linho · Tricô feito em pequenos lotes',
    care: knitCare,
    availability: 'pronta-entrega',
    badge: 'Edição Limitada',
    description: 'Ponto aberto feito em pequenos lotes, cava americana e barra na cintura alta. Combina com pantalona e saia midi.',
  },
  {
    id: 'p05',
    sku: 'AU-105',
    slug: 'conjunto-resort-salvia',
    category: 'conjuntos',
    alsoIn: [],
    price: 429,
    compareAtPrice: 489,
    installments: 6,
    ...pair('05', 'Conjunto Resort Sálvia', 'Vista frontal de conjunto de camisa e short de linho verde sálvia.', 'Detalhe da camisa e do short de linho verde sálvia.'),
    colors: [palette.salvia, palette.areia],
    sizes: all({ M: { inStock: true, lastUnits: true } }),
    measurements: measure({ busto: 96, cintura: 70, quadril: 104, comprimento: 64 }),
    modelNote: 'A modelo mede 1,72 m e veste tamanho P.',
    fabric: '100% Linho Lavado',
    care: linenCare,
    availability: 'pronta-entrega',
    description: 'Camisa de gola esporte e short de cintura alta com pregas. Funciona junto ou separado na mala de viagem.',
  },
  {
    id: 'p06',
    sku: 'AU-106',
    slug: 'saia-midi-madreperola',
    category: 'calcas-saias',
    alsoIn: [],
    price: 279,
    installments: 6,
    ...pair('06', 'Saia Midi Evasê Madrepérola', 'Vista frontal de saia midi evasê off-white com botões de madrepérola.', 'Detalhe dos botões de madrepérola na saia midi off-white.'),
    colors: [palette.offWhite, palette.areia],
    sizes: all(),
    measurements: measure({ busto: 0, cintura: 68, quadril: 100, comprimento: 82 }),
    modelNote: 'A modelo mede 1,72 m e veste tamanho P.',
    fabric: '70% Linho Puro, 30% Algodão · Forro 100% Algodão',
    care: linenCare,
    availability: 'pronta-entrega',
    description: 'Evasê na medida, abotoamento frontal com madrepérola e forro de algodão que não marca.',
  },
  {
    id: 'p07',
    sku: 'AU-107',
    slug: 'vestido-longo-sol',
    category: 'vestidos',
    alsoIn: [],
    price: 449,
    installments: 6,
    ...pair('07', 'Vestido Longo Frente Única Sol', 'Vista frontal de vestido longo frente única amarelo manteiga.', 'Detalhe da gola frente única e do drapeado do vestido longo amarelo.'),
    colors: [palette.manteiga, palette.terracota],
    sizes: all(),
    measurements: measure({ busto: 84, cintura: 68, quadril: 100, comprimento: 140 }, 2),
    modelNote: 'A modelo mede 1,72 m e veste tamanho P. Comprimento ajustado sob medida para a sua altura.',
    fabric: '100% Viscose de Linho · Forro 100% Algodão',
    care: 'Lavar à mão em água fria, secar à sombra em cabide. Passar em temperatura baixa.',
    availability: 'sob-medida',
    badge: 'Edição Limitada',
    description: 'Frente única com amarração na nuca, cintura marcada e saia fluida até o tornozelo. Comprimento ajustado para a sua altura em 10 dias úteis.',
  },
  {
    id: 'p08',
    sku: 'AU-108',
    slug: 'cardigan-trico-cacau',
    category: 'blusas',
    alsoIn: [],
    price: 299,
    installments: 6,
    ...pair('08', 'Cardigan Tricô Cacau', 'Vista frontal de cardigan de tricô cacau com botões tartaruga.', 'Detalhe dos botões tartaruga e do ponto do cardigan cacau.'),
    colors: [palette.cacau, palette.areia],
    sizes: all({ PP: { inStock: false }, P: { inStock: true, lastUnits: true }, GG: { inStock: false } }),
    measurements: measure({ busto: 100, cintura: 96, quadril: 0, comprimento: 58 }, 1),
    modelNote: 'A modelo mede 1,72 m e veste tamanho P.',
    fabric: '50% Algodão, 30% Linho, 20% Lã Merino',
    care: knitCare,
    availability: 'pronta-entrega',
    badge: 'Últimas Peças',
    description: 'Decote V, punhos canelados e botões tartaruga. O tricô de meia-estação que vai por cima de tudo.',
  },
  {
    id: 'p09',
    sku: 'AU-109',
    slug: 'regata-linho-off-white',
    category: 'blusas',
    alsoIn: [],
    price: 159,
    installments: 6,
    ...pair('09', 'Regata Linho Off-White', 'Regata de linho off-white de alças largas e decote reto.', 'Regata de linho off-white usada com calça pantalona areia.', 800, 1000),
    colors: [palette.offWhite, palette.areia, palette.terracota],
    sizes: all(),
    measurements: measure({ busto: 86, cintura: 82, quadril: 0, comprimento: 56 }, 0.5),
    modelNote: 'A modelo mede 1,72 m e veste tamanho P.',
    fabric: '100% Linho Puro',
    care: linenCare,
    availability: 'pronta-entrega',
    badge: 'Novo Drop',
    description: 'Decote reto, alças largas que escondem a alça do sutiã e barra reta para usar por dentro ou por fora.',
  },
  {
    id: 'p10',
    sku: 'AU-110',
    slug: 'regata-gola-alta-areia',
    category: 'blusas',
    alsoIn: [],
    price: 169,
    installments: 6,
    ...pair('10', 'Regata Gola Alta Areia', 'Regata de malha de linho areia com gola alta e cava americana.', 'Regata gola alta areia usada com saia midi off-white.', 800, 1000),
    colors: [palette.areia, palette.cacau],
    sizes: SIZES.map((size) => ({ size, inStock: false })),
    measurements: measure({ busto: 84, cintura: 80, quadril: 0, comprimento: 54 }, 0.5),
    modelNote: 'A modelo mede 1,72 m e veste tamanho P.',
    fabric: '65% Linho, 35% Algodão · malha canelada',
    care: knitCare,
    availability: 'esgotado',
    description: 'Gola alta canelada e cava americana. Esgotada nesta tiragem: encomende pelo WhatsApp e avisamos quando voltar.',
  },
  {
    id: 'p11',
    sku: 'AU-111',
    slug: 'calca-reta-linho-cru',
    category: 'calcas-saias',
    alsoIn: ['alfaiataria'],
    price: 299,
    compareAtPrice: 349,
    installments: 6,
    ...pair('11', 'Calça Reta Linho Cru', 'Calça reta de linho cru com cintura alta e vinco frontal.', 'Detalhe do bolso e do vinco da calça reta de linho cru.', 800, 1000),
    colors: [palette.cru, palette.oliva],
    sizes: all({ G: { inStock: true, lastUnits: true } }),
    measurements: measure({ busto: 0, cintura: 68, quadril: 98, comprimento: 104 }),
    modelNote: 'A modelo mede 1,72 m e veste tamanho P.',
    fabric: '100% Linho Lavado',
    care: linenCare,
    availability: 'pronta-entrega',
    description: 'Perna reta com vinco frontal, cós com elástico só nas costas e bolsos fundos. A calça do dia a dia.',
  },
  {
    id: 'p12',
    sku: 'AU-112',
    slug: 'conjunto-atelier-blazer-pantalona',
    category: 'conjuntos',
    alsoIn: ['alfaiataria'],
    price: 749,
    compareAtPrice: 788,
    installments: 6,
    ...pair('12', 'Conjunto Atelier Blazer + Pantalona', 'Conjunto de blazer de linho areia e calça pantalona com top de tricô off-white.', 'Detalhe do blazer de linho areia usado aberto sobre top de tricô.', 800, 1000),
    colors: [palette.areia],
    sizes: all({ GG: { inStock: true, lastUnits: true } }),
    measurements: measure({ busto: 104, cintura: 68, quadril: 102, comprimento: 108 }),
    modelNote: 'A modelo mede 1,72 m e veste tamanho P no blazer e na calça.',
    fabric: '100% Linho Puro no blazer · 55% Linho, 45% Viscose Eco na calça',
    care: linenCare,
    availability: 'pronta-entrega',
    badge: 'Novo Drop',
    description: 'Blazer oversized e pantalona do mesmo lote de linho, para usar como terno ou separar em outras combinações.',
  },
]

export const availabilityLabel: Record<Availability, string> = {
  'pronta-entrega': 'Pronta-entrega',
  'sob-medida': 'Sob medida · 10 dias úteis',
  esgotado: 'Esgotado',
}

export const getProduct = (slug: string) => products.find((p) => p.slug === slug)

export const sizeStock = (product: Product, size: Size) => product.sizes.find((s) => s.size === size)

export const pixPrice = (price: number) => Math.round(price * 95) / 100

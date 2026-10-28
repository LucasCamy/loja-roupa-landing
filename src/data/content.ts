/**
 * Textos das seções. Depoimentos, nomes e números são FICTÍCIOS
 * (demonstração): substitua por conteúdo real e verificável antes de publicar.
 */
import { site } from '../config/site'
import type { Size } from './products'

export const benefits = [
  { icon: 'leaf', title: 'Linho & fibras naturais', text: 'Linho puro, algodão orgânico e viscose eco. Nada de poliéster escondido na etiqueta.' },
  { icon: 'ruler', title: 'Numeração real PP ao GG', text: 'Tabela em centímetros em cada peça, com a altura e o tamanho da modelo.' },
  { icon: 'chat', title: 'Atendimento no WhatsApp', text: 'Uma stylist responde dúvidas de tamanho e monta looks com você.' },
  { icon: 'swap', title: '1ª troca fácil em 30 dias', text: 'A primeira troca é por nossa conta: enviamos o código de postagem.' },
] as const

export const craftSteps = [
  { title: 'Escolha da fibra', text: 'Linho europeu lavado e algodão orgânico, testados em lavagem e encolhimento antes do corte.', frame: 18 },
  { title: 'Corte em pequenos lotes', text: 'Cada modelo é cortado em lotes de 40 a 80 peças, com molde graduado do PP ao GG.', frame: 60 },
  { title: 'Acabamento manual', text: 'Botões de coco e madrepérola costurados à mão, barras conferidas peça por peça.', frame: 110 },
] as const

export const occasions = ['Casamento / Convidada', 'Trabalho / Alfaiataria', 'Viagem / Mala Cápsula', 'Ajuste de Comprimento / Sob Medida'] as const
export const tones = ['Terracota', 'Areia & Cru', 'Sálvia', 'Manteiga', 'Cacau', 'Off-white'] as const

export interface Testimonial {
  quote: string
  name: string
  city: string
  height: string
  size: Size
  product: string
  slug: string
}

export const testimonials: Testimonial[] = [
  {
    quote: 'Tenho 1,64 m, comprei o tamanho M e o caimento na cintura ficou impecável. O linho não amassa tanto quanto eu esperava.',
    name: 'Mariana T.',
    city: 'Campo Grande, MS',
    height: '1,64 m',
    size: 'M',
    product: 'Vestido Midi Brisa em Linho',
    slug: 'vestido-midi-brisa',
  },
  {
    quote: 'Uso G em blazer de outras marcas e aqui fiquei no M, como a stylist sugeriu pelo WhatsApp. Acertou em cheio.',
    name: 'Renata A.',
    city: 'Curitiba, PR',
    height: '1,70 m',
    size: 'M',
    product: 'Blazer Oversized Atelier',
    slug: 'blazer-oversized-atelier',
  },
  {
    quote: 'Sou baixinha, 1,55 m, e a pantalona P ficou certinha com sandália de salto baixo. Não precisei fazer barra.',
    name: 'Júlia F.',
    city: 'Goiânia, GO',
    height: '1,55 m',
    size: 'P',
    product: 'Calça Pantalona Duna',
    slug: 'calca-pantalona-duna',
  },
  {
    quote: 'Pedi o longo sob medida para um casamento na praia. Mandei minha altura e chegou no comprimento exato.',
    name: 'Carla M.',
    city: 'Florianópolis, SC',
    height: '1,78 m',
    size: 'G',
    product: 'Vestido Longo Frente Única Sol',
    slug: 'vestido-longo-sol',
  },
]

export const editions = [
  { piece: 'Vestido Midi Brisa', lot: 80, fabric: 'Linho + viscose eco' },
  { piece: 'Blazer Oversized Atelier', lot: 60, fabric: 'Linho puro' },
  { piece: 'Top Cropped Tricô Mel', lot: 40, fabric: 'Algodão orgânico + linho' },
  { piece: 'Vestido Longo Sol', lot: 30, fabric: 'Viscose de linho' },
] as const

export const faq = [
  {
    id: 'compra',
    q: 'Como funciona a compra pelo WhatsApp?',
    a: 'Você monta a sacola no site escolhendo cor e tamanho. Ao tocar em "Finalizar Pedido pelo WhatsApp", a conversa abre com todos os itens, tamanhos, cores e o total. Nossa equipe confirma o estoque, calcula o frete pelo CEP e envia o Pix ou o link de pagamento.',
  },
  {
    id: 'tamanhos',
    q: 'Como escolher o tamanho certo? E se não servir?',
    a: 'Cada peça tem a tabela em centímetros (busto, cintura, quadril e comprimento) e a altura da modelo. Na dúvida, mande suas medidas no WhatsApp. A primeira troca é grátis em até 30 dias após o recebimento, com a peça sem uso e com etiqueta. O direito de arrependimento de 7 dias vale para toda compra a distância.',
  },
  {
    id: 'prazos',
    q: 'Quais são os prazos de envio?',
    a: `Peças de pronta-entrega são separadas em até 2 dias úteis após o pagamento. Peças sob medida levam 10 dias úteis de produção. O prazo dos Correios ou da transportadora é informado com o frete. Frete grátis em pedidos acima de R$ ${site.shipping.freeShippingFrom}.`,
  },
  {
    id: 'pagamento',
    q: 'Quais as formas de pagamento?',
    a: 'Pix com 5% de desconto ou cartão de crédito em até 6x sem juros por link de pagamento seguro enviado no atendimento. Não pedimos dados de cartão pelo WhatsApp.',
  },
  {
    id: 'linho',
    q: 'Como cuidar do linho?',
    a: 'Lave à mão ou em ciclo delicado com água fria e sabão neutro, seque à sombra e passe a vapor do avesso. O linho amassa de forma natural e fica mais macio a cada lavagem. Tricôs secam na horizontal.',
  },
] as const

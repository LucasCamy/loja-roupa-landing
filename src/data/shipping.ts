/**
 * TABELA DE FRETE DEMONSTRATIVA (valores e prazos FICTÍCIOS)
 * ------------------------------------------------------------------
 * Estimativa por região a partir do CEP, calculada no navegador (o CEP não
 * é enviado a nenhum serviço). Origem: Campo Grande, MS.
 * Para cotação real (Correios, Melhor Envio, transportadora), troque
 * `quoteShipping` em src/lib/shipping.ts por uma chamada ao seu back-end.
 */

export type UF =
  | 'AC' | 'AL' | 'AM' | 'AP' | 'BA' | 'CE' | 'DF' | 'ES' | 'GO' | 'MA' | 'MG' | 'MS' | 'MT' | 'PA'
  | 'PB' | 'PE' | 'PI' | 'PR' | 'RJ' | 'RN' | 'RO' | 'RR' | 'RS' | 'SC' | 'SE' | 'SP' | 'TO'

/** Faixas de CEP por UF (5 primeiros dígitos, inclusivas). */
export const cepRanges: [number, number, UF][] = [
  [1000, 19999, 'SP'],
  [20000, 28999, 'RJ'],
  [29000, 29999, 'ES'],
  [30000, 39999, 'MG'],
  [40000, 48999, 'BA'],
  [49000, 49999, 'SE'],
  [50000, 56999, 'PE'],
  [57000, 57999, 'AL'],
  [58000, 58999, 'PB'],
  [59000, 59999, 'RN'],
  [60000, 63999, 'CE'],
  [64000, 64999, 'PI'],
  [65000, 65999, 'MA'],
  [66000, 68899, 'PA'],
  [68900, 68999, 'AP'],
  [69000, 69299, 'AM'],
  [69300, 69399, 'RR'],
  [69400, 69899, 'AM'],
  [69900, 69999, 'AC'],
  [70000, 72799, 'DF'],
  [72800, 72999, 'GO'],
  [73000, 73699, 'DF'],
  [73700, 76799, 'GO'],
  [76800, 76999, 'RO'],
  [77000, 77999, 'TO'],
  [78000, 78899, 'MT'],
  [79000, 79999, 'MS'],
  [80000, 87999, 'PR'],
  [88000, 89999, 'SC'],
  [90000, 99999, 'RS'],
]

export type ShippingMethod = 'economico' | 'expresso'

export interface ShippingZone {
  id: string
  ufs: UF[]
  economico: { price: number; days: [number, number] }
  expresso: { price: number; days: [number, number] }
}

export const shippingZones: ShippingZone[] = [
  { id: 'local', ufs: ['MS'], economico: { price: 14.9, days: [2, 4] }, expresso: { price: 24.9, days: [1, 2] } },
  { id: 'vizinha', ufs: ['SP', 'PR', 'MT', 'GO', 'DF'], economico: { price: 22.9, days: [4, 7] }, expresso: { price: 39.9, days: [2, 3] } },
  { id: 'sudeste-sul', ufs: ['RJ', 'ES', 'MG', 'SC', 'RS', 'TO', 'RO'], economico: { price: 27.9, days: [5, 9] }, expresso: { price: 49.9, days: [2, 4] } },
  { id: 'nordeste', ufs: ['BA', 'SE', 'PE', 'AL', 'PB', 'RN', 'CE', 'PI', 'MA'], economico: { price: 34.9, days: [7, 12] }, expresso: { price: 64.9, days: [3, 5] } },
  { id: 'norte', ufs: ['PA', 'AP', 'AM', 'RR', 'AC'], economico: { price: 42.9, days: [9, 15] }, expresso: { price: 79.9, days: [4, 7] } },
]

export const methodLabel: Record<ShippingMethod, string> = {
  economico: 'Econômico',
  expresso: 'Expresso',
}

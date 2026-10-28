import { asset, type MediaAsset } from '../lib/media'

export type CategoryId = 'todos' | 'vestidos' | 'alfaiataria' | 'blusas' | 'calcas-saias' | 'conjuntos'

export interface Category {
  id: CategoryId
  label: string
  short: string
  note: string
  image?: MediaAsset
}

export const categories: Category[] = [
  { id: 'todos', label: 'Todas as peças', short: 'Todas', note: '' },
  { id: 'vestidos', label: 'Vestidos & Macacões', short: 'Vestidos', note: 'Midi, longos e frente única', image: asset('prod-07-a', 'Vestido longo frente única amarelo manteiga.', 1000, 1250, '50% 40%') },
  { id: 'alfaiataria', label: 'Alfaiataria & Blazers', short: 'Alfaiataria', note: 'Blazers e calças de vinco', image: asset('prod-02-a', 'Blazer oversized de linho areia.', 1000, 1250, '50% 35%') },
  { id: 'blusas', label: 'Blusas & Tricôs', short: 'Blusas & Tricôs', note: 'Regatas, tops e cardigans', image: asset('prod-08-b', 'Cardigan de tricô cacau com botões tartaruga.', 1000, 1250, '50% 40%') },
  { id: 'calcas-saias', label: 'Calças & Saias', short: 'Calças & Saias', note: 'Pantalonas, retas e evasês', image: asset('prod-06-a', 'Saia midi evasê off-white.', 1000, 1250, '50% 55%') },
  { id: 'conjuntos', label: 'Conjuntos & Resort', short: 'Conjuntos', note: 'Do mesmo lote de linho', image: asset('prod-05-a', 'Conjunto de camisa e short de linho sálvia.', 1000, 1250, '50% 40%') },
]

export const categoryLabel = (id: CategoryId) => categories.find((c) => c.id === id)?.label ?? id

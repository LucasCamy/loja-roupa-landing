import type { CategoryId } from '../data/categories'
import type { Product, Size } from '../data/products'

export type SortKey = 'destaque' | 'menor-preco' | 'maior-preco' | 'novidades'

export interface CatalogFilter {
  category: CategoryId
  size: Size | 'todos'
  query: string
  sort: SortKey
}

const normalize = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')

export const inCategory = (p: Product, category: CategoryId) =>
  category === 'todos' || p.category === category || p.alsoIn.includes(category)

/** Tamanho disponível: em estoque, ou peça sob medida (feita para o tamanho escolhido). */
export const hasSize = (p: Product, size: Size | 'todos') =>
  size === 'todos' || p.sizes.some((s) => s.size === size && (s.inStock || p.availability === 'sob-medida'))

export function filterProducts(list: Product[], f: CatalogFilter): Product[] {
  const q = normalize(f.query.trim())
  const filtered = list.filter(
    (p) =>
      inCategory(p, f.category) &&
      hasSize(p, f.size) &&
      (!q || normalize(`${p.name} ${p.sku} ${p.fabric} ${p.colors.map((c) => c.name).join(' ')}`).includes(q)),
  )
  const order = (p: Product) => list.indexOf(p)
  switch (f.sort) {
    case 'menor-preco':
      return [...filtered].sort((a, b) => a.price - b.price)
    case 'maior-preco':
      return [...filtered].sort((a, b) => b.price - a.price)
    case 'novidades':
      return [...filtered].sort((a, b) => Number(b.badge === 'Novo Drop') - Number(a.badge === 'Novo Drop') || order(a) - order(b))
    default:
      return filtered
  }
}

import { describe, expect, it } from 'vitest'
import { products, SIZES } from '../data/products'
import { filterProducts, type CatalogFilter } from '../lib/catalog'

const base: CatalogFilter = { category: 'todos', size: 'todos', query: '', sort: 'destaque' }
const slugs = (f: Partial<CatalogFilter>) => filterProducts(products, { ...base, ...f }).map((p) => p.slug)

describe('dados do catálogo', () => {
  it('tem 12 produtos completos com SKU único e 2+ fotos', () => {
    expect(products).toHaveLength(12)
    expect(new Set(products.map((p) => p.sku)).size).toBe(12)
    for (const p of products) {
      expect(p.gallery.length).toBeGreaterThanOrEqual(2)
      expect(p.sizes.map((s) => s.size)).toEqual(SIZES)
      expect(Object.keys(p.measurements)).toHaveLength(5)
      expect(p.colors.length).toBeGreaterThan(0)
    }
  })
})

describe('filterProducts', () => {
  it('filtra por categoria, incluindo alsoIn', () => {
    const alfaiataria = slugs({ category: 'alfaiataria' })
    expect(alfaiataria).toContain('blazer-oversized-atelier')
    expect(alfaiataria).toContain('calca-pantalona-duna') // alsoIn
    expect(alfaiataria).not.toContain('vestido-midi-brisa')
    expect(slugs({ category: 'vestidos' })).toEqual(['vestido-midi-brisa', 'vestido-longo-sol'])
  })

  it('filtra por tamanho em estoque (sob medida conta como disponível, esgotado não)', () => {
    const pp = slugs({ size: 'PP' })
    expect(pp).not.toContain('blazer-oversized-atelier') // PP esgotado
    expect(pp).not.toContain('cardigan-trico-cacau')
    expect(pp).not.toContain('regata-gola-alta-areia') // esgotado
    expect(pp).toContain('vestido-longo-sol') // sob medida
    expect(slugs({ size: 'GG' })).not.toContain('top-cropped-trico-mel')
  })

  it('combina categoria + tamanho', () => {
    expect(slugs({ category: 'blusas', size: 'GG' })).toEqual(['regata-linho-off-white'])
  })

  it('busca sem acento e por SKU/cor', () => {
    expect(slugs({ query: 'salvia' })).toEqual(['conjunto-resort-salvia'])
    expect(slugs({ query: 'au-108' })).toEqual(['cardigan-trico-cacau'])
    expect(slugs({ query: 'xyz' })).toEqual([])
  })

  it('ordena por preço', () => {
    const asc = filterProducts(products, { ...base, sort: 'menor-preco' }).map((p) => p.price)
    expect(asc).toEqual([...asc].sort((a, b) => a - b))
    expect(filterProducts(products, { ...base, sort: 'maior-preco' })[0].slug).toBe('conjunto-atelier-blazer-pantalona')
  })
})

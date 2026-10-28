import { SIZES, type Product, type Size } from '../../data/products'

/**
 * Chips de tamanho PP–GG. Esgotado fica riscado e desabilitado (exceto peças sob medida,
 * produzidas no tamanho escolhido). Losango no canto = últimas unidades.
 */
export function SizeSelector({
  product,
  value,
  onChange,
  compact = false,
  label = 'Tamanho',
}: {
  product: Product
  value: Size | null
  onChange: (size: Size) => void
  compact?: boolean
  label?: string
}) {
  const onDemand = product.availability === 'sob-medida'
  return (
    <div role="radiogroup" aria-label={label} className={`flex flex-wrap ${compact ? 'gap-1' : 'gap-2'}`}>
      {SIZES.map((size) => {
        const stock = product.sizes.find((s) => s.size === size)
        const available = !!stock && (stock.inStock || onDemand)
        const active = value === size
        return (
          <button
            key={size}
            type="button"
            role="radio"
            aria-checked={active}
            disabled={!available}
            aria-label={`${size}${!available ? ', esgotado' : stock?.lastUnits ? ', últimas unidades' : ''}`}
            onClick={() => available && onChange(size)}
            className={`num relative grid place-items-center rounded-[10px] font-semibold transition-[background-color,color,box-shadow] duration-150 ${
              compact ? 'h-10 min-w-0 flex-1 px-1 text-[0.8rem]' : 'h-11 min-w-12 px-2 text-sm'
            } ${
              active
                ? 'bg-espresso text-linen'
                : available
                  ? 'bg-ivory text-espresso ring-1 ring-inset ring-sand-line hover:ring-espresso'
                  : 'cursor-not-allowed bg-sand/70 text-taupe line-through'
            }`}
          >
            {size}
            {available && stock?.lastUnits && (
              <span aria-hidden="true" className={`absolute right-1 top-1 size-1.5 rotate-45 ${active ? 'bg-butter' : 'bg-terracotta'}`} />
            )}
          </button>
        )
      })}
    </div>
  )
}

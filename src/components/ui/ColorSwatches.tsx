import type { ColorOption } from '../../data/products'

/** Bolinhas de cor (radiogroup acessível). */
export function ColorSwatches({
  colors,
  value,
  onChange,
  size = 'md',
  label = 'Cor',
  showName = false,
}: {
  colors: ColorOption[]
  value: string
  onChange: (name: string) => void
  size?: 'sm' | 'md'
  label?: string
  showName?: boolean
}) {
  const dot = size === 'sm' ? 'size-[18px]' : 'size-7'
  const hit = size === 'sm' ? 'size-8' : 'size-11'
  return (
    <div className="flex items-center gap-2">
      <div role="radiogroup" aria-label={label} className="-ml-1.5 flex flex-wrap items-center">
        {colors.map((c) => {
          const active = c.name === value
          return (
            <button
              key={c.name}
              type="button"
              role="radio"
              aria-checked={active}
              aria-label={c.name}
              title={c.name}
              onClick={() => onChange(c.name)}
              className={`grid ${hit} place-items-center rounded-full`}
            >
              <span
                className={`${dot} rounded-full ring-1 ring-inset ring-espresso/15 transition-[box-shadow] duration-200 ${
                  active ? 'shadow-[0_0_0_2px_var(--ivory),0_0_0_3.5px_var(--espresso)]' : ''
                }`}
                style={{ backgroundColor: c.hex }}
              />
            </button>
          )
        })}
      </div>
      {showName && (
        <span className="text-sm text-taupe">
          Cor: <strong className="font-semibold text-espresso">{value}</strong>
        </span>
      )}
    </div>
  )
}

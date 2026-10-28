import { pixPrice, type Product } from '../../data/products'
import { formatPrice } from '../../lib/format'

export function Price({ product, size = 'md' }: { product: Product; size?: 'md' | 'lg' }) {
  const lg = size === 'lg'
  return (
    <div className="num">
      <p className="flex flex-wrap items-baseline gap-x-2">
        <span className={`font-bold text-espresso ${lg ? 'text-2xl' : 'text-[0.98rem]'}`}>{formatPrice(product.price)}</span>
        {product.compareAtPrice && (
          <s className={`text-taupe ${lg ? 'text-base' : 'text-xs'}`}>
            <span className="sr-only">de </span>
            {formatPrice(product.compareAtPrice)}
          </s>
        )}
      </p>
      <p className={`text-taupe ${lg ? 'mt-1 text-sm' : 'text-[0.75rem] leading-snug'}`}>
        {lg ? (
          <>
            <strong className="font-semibold text-sage-deep">{formatPrice(pixPrice(product.price))} no Pix</strong> (5% OFF) ou até{' '}
            {product.installments}x de {formatPrice(product.price / product.installments)} sem juros
          </>
        ) : (
          <>
            {formatPrice(pixPrice(product.price))} no Pix · até {product.installments}x
          </>
        )}
      </p>
    </div>
  )
}

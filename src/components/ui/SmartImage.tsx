import { useState, type ImgHTMLAttributes } from 'react'
import { mediaUrl, type MediaAsset } from '../../lib/media'

interface SmartImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'alt' | 'width' | 'height'> {
  asset: MediaAsset
  priority?: boolean
  /** Sobrescreve o alt do asset ('' para imagens decorativas) */
  alt?: string
  pictureClassName?: string
  /** Largura em que a imagem aparece (atributo `sizes`), para o navegador escolher a versão */
  sizes?: string
}

const hasSmallVariant = (a: MediaAsset) => a.width > 640 && !a.name.startsWith('frames/') && a.name !== 'sketch-before'

/**
 * <picture> com AVIF + fallback WebP e cache busting (?v=MEDIA_VERSION).
 * Dimensões declaradas evitam layout shift; se falhar, mostra uma textura de linho.
 */
export function SmartImage({ asset, priority = false, alt, className = '', pictureClassName = '', sizes = '(min-width: 1024px) 50vw, 100vw', style, ...rest }: SmartImageProps) {
  const [failed, setFailed] = useState(false)
  const label = alt ?? asset.alt

  if (failed) {
    return (
      <div
        role={label ? 'img' : undefined}
        aria-label={label || undefined}
        aria-hidden={label ? undefined : true}
        className={`linen-texture bg-sand ${className}`}
        style={style}
      />
    )
  }

  // Versão de 640 px (scripts/make_small_variants.sh): cards, miniaturas e celular
  // decodificam e rasterizam bem menos pixels do que a foto cheia.
  const small = hasSmallVariant(asset)
  const set = (ext: 'avif' | 'webp') =>
    small ? `${mediaUrl(`${asset.name}-640`, ext)} 640w, ${mediaUrl(asset.name, ext)} ${asset.width}w` : mediaUrl(asset.name, ext)

  return (
    <picture className={pictureClassName}>
      <source type="image/avif" srcSet={set('avif')} sizes={small ? sizes : undefined} />
      <img
        src={mediaUrl(asset.name, 'webp')}
        srcSet={small ? set('webp') : undefined}
        sizes={small ? sizes : undefined}
        width={asset.width}
        height={asset.height}
        alt={label}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        fetchPriority={priority ? 'high' : 'auto'}
        onError={() => setFailed(true)}
        className={`bg-sand object-cover ${className}`}
        style={{ objectPosition: asset.focus, ...style }}
        {...rest}
      />
    </picture>
  )
}

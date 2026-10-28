/** Versão das mídias (hash de public/media gerado no vite.config.ts) para cache busting. */
export const MEDIA_VERSION: string = typeof __MEDIA_VERSION__ === 'string' ? __MEDIA_VERSION__ : 'dev'

export interface MediaAsset {
  /** Nome base em /media, sem extensão (ex.: 'prod-01-a') */
  name: string
  alt: string
  width: number
  height: number
  /** object-position em % (ponto focal do MEDIA_MANIFEST.json) */
  focus?: string
}

export const mediaUrl = (name: string, ext: 'avif' | 'webp' | 'mp4') => `/media/${name}.${ext}?v=${MEDIA_VERSION}`

export function asset(name: string, alt: string, width = 1000, height = 1250, focus?: string): MediaAsset {
  return { name, alt, width, height, focus }
}

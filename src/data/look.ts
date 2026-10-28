import { asset } from '../lib/media'
import type { Size } from './products'

/** Look da estação: 3 peças com cor fixa e posição do ponto focal sobre a foto (em %). */
export const seasonLook = {
  id: 'look-outono-01',
  title: 'Look Atelier de Outono',
  image: asset('lookbook-full', 'Look completo com blazer de linho areia, top cropped de tricô off-white e calça pantalona de alfaiataria.', 1200, 1500, '50% 50%'),
  pieces: [
    { slug: 'blazer-oversized-atelier', color: 'Areia', hotspot: { x: 37, y: 38 }, label: 'Blazer' },
    { slug: 'top-cropped-trico-mel', color: 'Off-white', hotspot: { x: 55, y: 27 }, label: 'Top tricô' },
    { slug: 'calca-pantalona-duna', color: 'Areia', hotspot: { x: 53, y: 64 }, label: 'Pantalona' },
  ],
  defaultSize: 'P' as Size,
}

export const lookSlugs = seasonLook.pieces.map((p) => p.slug)

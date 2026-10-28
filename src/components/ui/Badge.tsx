import type { ReactNode } from 'react'
import type { BadgeLabel } from '../../data/products'

const tones = {
  butter: 'bg-butter text-espresso',
  espresso: 'bg-espresso text-linen',
  terracotta: 'bg-terracotta-deep text-white',
  sand: 'bg-sand text-terracotta-deep',
  muted: 'bg-ivory/90 text-taupe ring-1 ring-inset ring-sand-line',
  sage: 'bg-sage-soft text-sage-deep',
} as const

export type BadgeTone = keyof typeof tones

// eslint-disable-next-line react-refresh/only-export-components
export const badgeTone: Record<BadgeLabel, BadgeTone> = {
  'Novo Drop': 'butter',
  'Mais Vendido': 'espresso',
  'Edição Limitada': 'terracotta',
  'Últimas Peças': 'sand',
}

export function Badge({ tone = 'butter', children, className = '' }: { tone?: BadgeTone; children: ReactNode; className?: string }) {
  return (
    <span className={`inline-flex h-6 items-center gap-1 rounded-[4px] px-2 text-[0.7rem] font-bold uppercase tracking-[0.08em] ${tones[tone]} ${className}`}>
      {children}
    </span>
  )
}

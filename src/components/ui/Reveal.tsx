/**
 * Revelação por etapas ao rolar.
 * - O grupo só dispara quando o topo do bloco sobe até `at` (fração da altura
 *   da tela, contada de baixo), e não no primeiro pixel visível: a animação
 *   acontece quando a pessoa chega lá. Vale para blocos de qualquer altura
 *   (exigir uma fração do bloco visível nunca dispara se ele for maior que a tela).
 * - Os itens entram em sequência (`stagger`), cada um com um gesto próprio.
 * - Só opacity e transform (string): o Motion entrega ao WAAPI e a animação roda
 *   no compositor, sem disputar o thread principal com a rolagem. Fotos abrem com
 *   uma capa da cor do fundo que encolhe (clip-path animado repintaria a foto a cada quadro).
 * - Movimento reduzido: tudo já aparece no estado final (initial = false).
 */
import type { ReactNode } from 'react'
import { motion, type TargetAndTransition, type Variants } from 'motion/react'
import { useCanAnimate } from '../../lib/scroll'

const ease = [0.22, 1, 0.36, 1] as const
const inOut = [0.65, 0, 0.35, 1] as const

export type RevealVariant = 'rise' | 'fade' | 'curtain' | 'wipe' | 'mask' | 'pop' | 'slide'

const presets: Record<RevealVariant, Variants> = {
  // texto e blocos: sobe um pouco e aparece
  rise: {
    hidden: { opacity: 0, transform: 'translateY(28px)' },
    show: { opacity: 1, transform: 'translateY(0px)', transition: { duration: 0.7, ease } },
  },
  fade: {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { duration: 0.8, ease } },
  },
  // foto (curtain/wipe): a imagem aproxima de leve enquanto a capa recolhe (ver PhotoReveal)
  curtain: {
    hidden: { transform: 'scale(1.06)' },
    show: { transform: 'scale(1)', transition: { duration: 1.4, ease: inOut } },
  },
  wipe: {
    hidden: { transform: 'scale(1.04)' },
    show: { transform: 'scale(1)', transition: { duration: 1.3, ease: inOut } },
  },
  // título: linha sobe por trás de uma máscara (usar dentro de <MaskTitle>)
  mask: {
    hidden: { transform: 'translateY(105%)' },
    show: { transform: 'translateY(0%)', transition: { duration: 0.9, ease } },
  },
  // selos e etiquetas
  pop: {
    hidden: { opacity: 0, transform: 'scale(0.9)' },
    show: { opacity: 1, transform: 'scale(1)', transition: { duration: 0.5, ease } },
  },
  // itens de lista lateral
  slide: {
    hidden: { opacity: 0, transform: 'translateX(-20px)' },
    show: { opacity: 1, transform: 'translateX(0px)', transition: { duration: 0.6, ease } },
  },
}

type Tag = 'div' | 'section' | 'ul' | 'ol' | 'li' | 'p' | 'span' | 'figure' | 'tbody' | 'tr' | 'dl' | 'form'

interface GroupProps {
  children: ReactNode
  className?: string
  as?: Tag
  /** Dispara quando o topo do bloco passa desta fração da tela, de baixo para cima (0–1) */
  at?: number
  stagger?: number
  delay?: number
  id?: string
  ariaLabel?: string
}

/** Grupo que dispara uma vez ao entrar na tela e encadeia os filhos `RevealItem`. */
export function RevealGroup({ children, className, as = 'div', at = 0.22, stagger = 0.1, delay = 0, id, ariaLabel }: GroupProps) {
  const canAnimate = useCanAnimate()
  const Comp = motion[as] as typeof motion.div
  return (
    <Comp
      id={id}
      aria-label={ariaLabel}
      className={className}
      initial={canAnimate ? 'hidden' : false}
      whileInView="show"
      viewport={{ once: true, margin: `0px 0px -${Math.round(at * 100)}% 0px` }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: stagger, delayChildren: delay } } }}
    >
      {children}
    </Comp>
  )
}

// Capa da cor do fundo que recolhe (curtain: de cima para baixo; wipe: da esquerda para a direita).
// Animar transform numa capa roda no compositor; animar clip-path na foto obrigava a
// repintar a imagem a cada quadro (medido: ~15–30% de quadros parciais na rolagem).
const coverVariants: Record<'curtain' | 'wipe', Variants> = {
  curtain: {
    hidden: { transform: 'scaleY(1)' },
    show: { transform: 'scaleY(0)', transition: { duration: 1.05, ease: inOut } },
  },
  wipe: {
    hidden: { transform: 'scaleX(1)' },
    show: { transform: 'scaleX(0)', transition: { duration: 1, ease: inOut } },
  },
}

/** Item de um `RevealGroup` (herda o disparo do grupo). */
export function RevealItem({
  children,
  className,
  as = 'div',
  variant = 'rise',
  cover = 'bg-linen',
}: {
  children?: ReactNode
  className?: string
  as?: Tag
  variant?: RevealVariant
  /** Cor da capa nas revelações de foto (use a cor do fundo da seção) */
  cover?: string
}) {
  const Comp = motion[as] as typeof motion.div
  if (variant === 'curtain' || variant === 'wipe') {
    return (
      <Comp className={`relative overflow-hidden ${className ?? ''}`} variants={{ hidden: {}, show: {} }}>
        <motion.div className="h-full w-full" variants={presets[variant]}>
          {children}
        </motion.div>
        <motion.span
          aria-hidden="true"
          className={`pointer-events-none absolute -inset-px ${cover}`}
          style={{ transformOrigin: variant === 'curtain' ? '50% 100%' : '100% 50%' }}
          variants={coverVariants[variant]}
        />
      </Comp>
    )
  }
  return (
    <Comp className={className} variants={presets[variant]}>
      {children}
    </Comp>
  )
}

/** Bloco isolado com disparo próprio. */
export function Reveal({ variant = 'rise', at = 0.22, delay = 0, as = 'div', className, id, children }: Omit<GroupProps, 'stagger'> & { variant?: RevealVariant }) {
  const canAnimate = useCanAnimate()
  const Comp = motion[as] as typeof motion.div
  const { hidden, show } = presets[variant] as { hidden: TargetAndTransition; show: TargetAndTransition }
  return (
    <Comp
      id={id}
      className={className}
      initial={canAnimate ? 'hidden' : false}
      whileInView="show"
      viewport={{ once: true, margin: `0px 0px -${Math.round(at * 100)}% 0px` }}
      variants={{ hidden, show: { ...show, transition: { ...show.transition, delay } } }}
    >
      {children}
    </Comp>
  )
}

/** Título com a linha subindo por trás de uma máscara; segue a sequência do RevealGroup em que está. */
export function MaskTitle({
  as: Tag = 'h2',
  id,
  className,
  children,
}: {
  as?: 'h2' | 'h3' | 'p'
  id?: string
  className?: string
  children: ReactNode
}) {
  return (
    <Tag id={id} className={className}>
      <span className="block overflow-hidden pb-[0.08em]">
        <motion.span className="block" variants={presets.mask}>
          {children}
        </motion.span>
      </span>
    </Tag>
  )
}

import { ChatsCircle, Leaf, Ruler, ArrowsClockwise, type Icon } from '@phosphor-icons/react'
import { benefits } from '../../data/content'
import { RevealGroup, RevealItem } from '../ui/Reveal'

const icons: Record<(typeof benefits)[number]['icon'], Icon> = {
  leaf: Leaf,
  ruler: Ruler,
  chat: ChatsCircle,
  swap: ArrowsClockwise,
}

export function BenefitStrip() {
  return (
    <section aria-label="Nossas garantias" className="border-y border-sand-line bg-ivory">
      <RevealGroup as="ul" at={0.12} stagger={0.12} className="container-x grid grid-cols-1 divide-sand-line py-2 sm:grid-cols-2 lg:grid-cols-4 lg:divide-x"
      >
        {benefits.map((b) => {
          const IconCmp = icons[b.icon]
          return (
            <RevealItem as="li" key={b.title} className="flex gap-4 px-1 py-6 lg:px-6 lg:first:pl-0">
              <span className="grid size-12 shrink-0 place-items-center rounded-full bg-sage-soft text-sage-deep">
                <IconCmp size={26} weight="duotone" aria-hidden="true" />
              </span>
              <div>
                <h3 className="font-sans text-[0.98rem] font-bold leading-snug tracking-normal">{b.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-taupe">{b.text}</p>
              </div>
            </RevealItem>
          )
        })}
      </RevealGroup>
    </section>
  )
}

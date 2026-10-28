import { useId, useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Plus } from '@phosphor-icons/react'
import { ease } from './motion'

export interface AccordionItem {
  id: string
  title: ReactNode
  content: ReactNode
}

/** Acordeão WAI-ARIA (botão com aria-expanded + região rotulada). */
export function Accordion({
  items,
  defaultOpen = [],
  single = false,
  titleClassName = 'font-display text-xl sm:text-2xl',
  className = '',
}: {
  items: AccordionItem[]
  defaultOpen?: string[]
  single?: boolean
  titleClassName?: string
  className?: string
}) {
  const [open, setOpen] = useState<string[]>(defaultOpen)
  const uid = useId()
  const toggle = (id: string) =>
    setOpen((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : single ? [id] : [...cur, id]))

  return (
    <div className={`divide-y divide-sand-line border-y border-sand-line ${className}`}>
      {items.map((item) => {
        const isOpen = open.includes(item.id)
        const btnId = `${uid}-${item.id}-btn`
        const panelId = `${uid}-${item.id}-panel`
        return (
          <div key={item.id}>
            <h3 className="m-0">
              <button
                id={btnId}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => toggle(item.id)}
                className={`flex min-h-14 w-full items-center justify-between gap-4 py-3 text-left text-espresso ${titleClassName}`}
              >
                <span>{item.title}</span>
                <Plus
                  size={20}
                  aria-hidden="true"
                  className={`shrink-0 text-terracotta-deep transition-transform duration-300 ease-[var(--ease-out)] ${isOpen ? 'rotate-45' : ''}`}
                />
              </button>
            </h3>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  id={panelId}
                  role="region"
                  aria-labelledby={btnId}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1, transition: { duration: 0.32, ease } }}
                  exit={{ height: 0, opacity: 0, transition: { duration: 0.2 } }}
                  className="overflow-hidden"
                >
                  <div className="pb-5 pr-8 text-taupe">{item.content}</div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )
      })}
    </div>
  )
}

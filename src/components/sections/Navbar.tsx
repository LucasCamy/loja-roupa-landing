import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { List, Tote, WhatsappLogo, X } from '@phosphor-icons/react'
import { site } from '../../config/site'
import { formatPrice } from '../../lib/format'
import { useBag, useShopActions } from '../../lib/shop'
import { whatsappLink } from '../../lib/whatsapp'
import { ButtonLink } from '../ui/Button'
import { Logo } from '../ui/Logo'
import { Sheet } from '../ui/Sheet'

export function Navbar() {
  const { totals } = useBag()
  const { setBagOpen } = useShopActions()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <>
      <header className="sticky top-0 z-50">
        <div className="bg-espresso text-linen">
          <p className="container-x flex h-8 items-center justify-center gap-3 overflow-hidden text-center text-[0.72rem] font-medium tracking-[0.04em] sm:text-[0.78rem]">
            {site.topbar.map((t, i) => (
              <span key={t} className={`whitespace-nowrap ${i > 0 ? 'hidden sm:inline' : ''}`}>
                {i > 0 && (
                  <span aria-hidden="true" className="mr-3 text-butter">
                    ·
                  </span>
                )}
                {t}
              </span>
            ))}
          </p>
        </div>
        <div className="border-b border-sand-line/80 bg-linen">
          <nav aria-label="Principal" className="container-x flex h-[68px] items-center justify-between gap-4 lg:h-[76px]">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setMenuOpen(true)}
                className="-ml-2 grid size-11 place-items-center rounded-full hover:bg-sand lg:hidden"
                aria-label="Abrir menu"
                aria-expanded={menuOpen}
              >
                <List size={24} aria-hidden="true" />
              </button>
              <a href="#inicio" aria-label={`${site.name}, início`} className="rounded-md">
                <Logo />
              </a>
            </div>

            <ul className="hidden items-center gap-0.5 lg:flex">
              {site.nav.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className="rounded-full px-2.5 py-2 text-[0.85rem] font-medium text-espresso/85 transition-colors hover:bg-sand hover:text-espresso xl:px-3.5 xl:text-[0.92rem]"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>

            <button
              type="button"
              onClick={() => setBagOpen(true)}
              className="relative flex h-11 items-center gap-2.5 rounded-full bg-espresso pl-3.5 pr-4 text-linen transition-colors hover:bg-[#3d302a]"
              aria-label={`Abrir sacola, ${totals.count} ${totals.count === 1 ? 'item' : 'itens'}`}
            >
              <Tote size={20} weight="duotone" aria-hidden="true" />
              <span className="num hidden text-sm font-semibold xs:inline">{totals.count > 0 ? formatPrice(totals.subtotal) : 'Sacola'}</span>
              <span className="num relative grid h-6 min-w-6 place-items-center overflow-hidden rounded-full bg-butter px-1.5 text-xs font-bold text-espresso">
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.span
                    key={totals.count}
                    initial={{ transform: 'translateY(12px)', opacity: 0 }}
                    animate={{ transform: 'translateY(0px)', opacity: 1 }}
                    exit={{ transform: 'translateY(-12px)', opacity: 0 }}
                    transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                    data-testid="bag-count"
                  >
                    {totals.count}
                  </motion.span>
                </AnimatePresence>
              </span>
            </button>
          </nav>
        </div>
      </header>

      <Sheet open={menuOpen} onClose={() => setMenuOpen(false)} side="left" labelledBy="menu-titulo">
        <div className="flex items-center justify-between border-b border-sand-line px-5 py-4">
          <p id="menu-titulo" className="font-display text-2xl">
            Menu
          </p>
          <button type="button" onClick={() => setMenuOpen(false)} className="grid size-11 place-items-center rounded-full hover:bg-sand" aria-label="Fechar menu">
            <X size={22} aria-hidden="true" />
          </button>
        </div>
        <ul className="flex flex-col px-3 py-4">
          {site.nav.map((item) => (
            <li key={item.href}>
              <a href={item.href} onClick={() => setMenuOpen(false)} className="flex min-h-12 items-center rounded-xl px-3 font-display text-[1.6rem] hover:bg-sand">
                {item.label}
              </a>
            </li>
          ))}
        </ul>
        <div className="mt-auto border-t border-sand-line p-5">
          <ButtonLink href={whatsappLink()} variant="whatsapp" className="w-full" icon={<WhatsappLogo size={20} weight="fill" aria-hidden="true" />}>
            Falar com a stylist
          </ButtonLink>
          <p className="mt-3 text-center text-xs text-taupe">{site.contact.hours}</p>
        </div>
      </Sheet>
    </>
  )
}

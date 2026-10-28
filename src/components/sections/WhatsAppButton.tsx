import { WhatsappLogo } from '@phosphor-icons/react'
import { useShopUI } from '../../lib/shop'
import { whatsappLink } from '../../lib/whatsapp'

/** Botão flutuante. Some enquanto a sacola ou o detalhe estão abertos. */
export function WhatsAppButton() {
  const { bagOpen, openSlug } = useShopUI()
  if (bagOpen || openSlug) return null
  return (
    <a
      href={whatsappLink()}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-4 right-4 z-40 flex h-14 items-center gap-2 rounded-full bg-whatsapp-green pl-4 pr-5 font-semibold text-white shadow-lift transition-transform duration-200 hover:-translate-y-0.5 sm:bottom-6 sm:right-6"
      aria-label="Falar com a stylist no WhatsApp (abre em nova aba)"
    >
      <WhatsappLogo size={26} weight="fill" aria-hidden="true" />
      <span className="hidden sm:inline">Fale com a stylist</span>
    </a>
  )
}

import { WhatsappLogo } from '@phosphor-icons/react'
import { site } from '../../config/site'
import { faq } from '../../data/content'
import { whatsappLink } from '../../lib/whatsapp'
import { Accordion } from '../ui/Accordion'
import { ButtonLink } from '../ui/Button'
import { MaskTitle, Reveal, RevealGroup, RevealItem } from '../ui/Reveal'

export function FAQ() {
  return (
    <section id="duvidas" aria-labelledby="faq-titulo" className="bg-ivory py-20 md:py-28">
      <div className="container-x grid gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-16">
        <RevealGroup at={0.2} stagger={0.12}>
          <MaskTitle id="faq-titulo" className="h2">
            Dúvidas <em>frequentes</em>
          </MaskTitle>
          <RevealItem as="p" className="mt-4 max-w-sm text-taupe">
            Não achou o que procura? Atendemos no WhatsApp: {site.contact.hours}.
          </RevealItem>
          <RevealItem>
            <ButtonLink href={whatsappLink()} variant="whatsapp" className="mt-6" icon={<WhatsappLogo size={20} weight="fill" aria-hidden="true" />}>
              Perguntar no WhatsApp
            </ButtonLink>
          </RevealItem>
        </RevealGroup>
        <Reveal at={0.2} delay={0.2}>
          <Accordion single defaultOpen={['compra']} items={faq.map((f) => ({ id: f.id, title: f.q, content: <p>{f.a}</p> }))} />
        </Reveal>
      </div>
    </section>
  )
}

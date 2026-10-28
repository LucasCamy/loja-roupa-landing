import { InstagramLogo, WhatsappLogo } from '@phosphor-icons/react'
import { site } from '../../config/site'
import { whatsappLink } from '../../lib/whatsapp'
import { Logo } from '../ui/Logo'

const pending = (value: string, label: string) => value || `[${label}: pendente]`

export function Footer() {
  return (
    <footer className="border-t border-sand-line bg-linen pb-28 pt-16 text-sm sm:pb-16">
      <div className="container-x grid gap-10 md:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1.2fr]">
        <div>
          <Logo />
          <p className="mt-4 max-w-xs text-taupe">{site.description}</p>
          <div className="mt-5 flex gap-2">
            <a href={site.contact.instagramUrl} target="_blank" rel="noopener noreferrer" className="grid size-11 place-items-center rounded-full ring-1 ring-inset ring-sand-line hover:bg-sand" aria-label={`Instagram ${site.contact.instagramHandle} (abre em nova aba)`}>
              <InstagramLogo size={20} aria-hidden="true" />
            </a>
            <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className="grid size-11 place-items-center rounded-full ring-1 ring-inset ring-sand-line hover:bg-sand" aria-label="WhatsApp (abre em nova aba)">
              <WhatsappLogo size={20} aria-hidden="true" />
            </a>
          </div>
        </div>

        <nav aria-label="Rodapé">
          <p className="font-semibold">Loja</p>
          <ul className="mt-3 space-y-2 text-taupe">
            {site.nav.map((n) => (
              <li key={n.href}>
                <a href={n.href} className="hover:text-espresso">
                  {n.label}
                </a>
              </li>
            ))}
            <li>
              <a href="/styleguide.html" className="hover:text-espresso">
                Styleguide
              </a>
            </li>
          </ul>
        </nav>

        <div>
          <p className="font-semibold">Atendimento</p>
          <ul className="mt-3 space-y-2 text-taupe">
            <li>WhatsApp {site.contact.whatsappDisplay}</li>
            <li>{site.contact.email}</li>
            <li>{site.contact.hours}</li>
            <li>{site.contact.city}</li>
          </ul>
        </div>

        <div id="privacidade">
          <p className="font-semibold">Privacidade & trocas</p>
          <p className="mt-3 text-taupe">
            O site não usa cookies de rastreamento nem analytics. A sacola fica salva só no seu navegador. Nome e CEP que você digita vão apenas na mensagem que você mesma envia pelo WhatsApp. Para pedir acesso ou exclusão de dados, fale com {site.contact.email}.
          </p>
          <p className="mt-3 text-taupe">1ª troca grátis em até 30 dias. Arrependimento em até 7 dias após o recebimento (CDC, art. 49).</p>
        </div>
      </div>

      <div className="container-x mt-12 flex flex-col gap-2 border-t border-sand-line pt-6 text-xs text-taupe md:flex-row md:justify-between">
        <p>
          © {new Date().getFullYear()} {site.name} · {pending(site.legal.companyName, 'Razão social')} · {site.legal.cnpj ? `CNPJ ${site.legal.cnpj}` : pending('', 'CNPJ')} ·{' '}
          {pending(site.legal.address, 'Endereço')}
        </p>
        {site.isDemo && <p className="font-semibold text-terracotta-deep">Site demonstrativo: marca, contatos, preços, modelos e depoimentos são fictícios.</p>}
      </div>
    </footer>
  )
}

import { useCallback, useId, useState, type FormEvent } from 'react'
import { CheckCircle, WarningCircle, WhatsappLogo } from '@phosphor-icons/react'
import { site } from '../../config/site'
import { asset } from '../../lib/media'
import { whatsappLink } from '../../lib/whatsapp'
import { Button, ButtonLink } from '../ui/Button'
import { MaskTitle, RevealGroup, RevealItem } from '../ui/Reveal'
import { SmartImage } from '../ui/SmartImage'

const look = asset('prod-07-b', 'Detalhe do vestido longo frente única amarelo manteiga.', 1000, 1250, '50% 30%')

export function FinalCTA() {
  return (
    <section aria-labelledby="cta-titulo" className="py-20 md:py-28">
      <div className="container-x">
        {/* Etapas: título, texto e botões sobem; a foto abre de lado; por fim a newsletter */}
        <RevealGroup
          at={0.2}
          stagger={0.13}
          className="grid overflow-hidden rounded-[28px] bg-espresso text-linen lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]"
        >
          <div className="p-7 sm:p-12 lg:p-16">
            <MaskTitle id="cta-titulo" className="h2 text-linen [&_em]:text-butter">
              Sua próxima peça <em>favorita</em> está a uma conversa
            </MaskTitle>
            <RevealItem as="p" className="mt-4 max-w-lg text-linen/80">
              Monte a sacola, envie pelo WhatsApp e a nossa stylist confirma tamanho, estoque e frete com você.
            </RevealItem>
            <RevealItem className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="#colecao" variant="light" size="lg">
                Explorar a Coleção
              </ButtonLink>
              <ButtonLink href={whatsappLink()} variant="whatsapp" size="lg" icon={<WhatsappLogo size={20} weight="fill" aria-hidden="true" />}>
                Falar com a stylist
              </ButtonLink>
            </RevealItem>
            <RevealItem variant="fade">
              <Newsletter />
            </RevealItem>
          </div>
          <RevealItem variant="wipe" cover="bg-espresso" className="hidden lg:block">
            <SmartImage asset={look} alt="" sizes="35vw" className="absolute inset-0 size-full" pictureClassName="contents" />
          </RevealItem>
        </RevealGroup>
      </div>
    </section>
  )
}

/** Newsletter simulada localmente (sem backend). Consentimento desmarcado e específico. */
function Newsletter() {
  const uid = useId()
  const [email, setEmail] = useState('')
  const [consent, setConsent] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const [loading, setLoading] = useState(false)
  const focusDone = useCallback((el: HTMLParagraphElement | null) => el?.focus(), [])

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return setError('Digite um e-mail válido, ex.: nome@email.com')
    if (!consent) return setError('Marque a caixa para aceitar receber os e-mails.')
    setError('')
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setDone(true)
    }, 700)
  }

  if (done)
    return (
      <p ref={focusDone} tabIndex={-1} role="status" className="mt-10 flex items-center gap-2 rounded-[14px] bg-linen/10 p-4 text-sm outline-none">
        <CheckCircle size={20} weight="fill" className="text-butter" aria-hidden="true" />
        Inscrição registrada{site.isDemo ? ' (demonstração: nenhum dado foi enviado)' : ''}. Você recebe os próximos drops antes de todo mundo.
      </p>
    )

  return (
    <form noValidate onSubmit={submit} className="mt-10 border-t border-linen/15 pt-8">
      <label htmlFor={`${uid}-email`} className="text-sm font-semibold">
        Receba os novos drops por e-mail
      </label>
      <div className="mt-2 flex flex-col gap-2 sm:flex-row">
        <input
          id={`${uid}-email`}
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-invalid={!!error}
          aria-describedby={error ? `${uid}-erro` : `${uid}-ajuda`}
          placeholder="seu@email.com"
          className="h-12 min-w-0 rounded-full sm:flex-1 bg-linen px-5 text-espresso placeholder:text-taupe focus:outline-none focus-visible:ring-2 focus-visible:ring-butter aria-invalid:ring-2 aria-invalid:ring-[#f3a594]"
        />
        <Button type="submit" variant="light" className="w-full min-w-[150px] sm:w-auto" aria-disabled={loading}>
          {loading ? 'Enviando...' : 'Quero receber'}
        </Button>
      </div>
      <label className="mt-3 flex cursor-pointer items-start gap-2.5 text-sm text-linen/85">
        <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1 size-4 shrink-0 accent-butter" />
        <span>
          Aceito receber e-mails da {site.name} sobre lançamentos e ofertas. Posso cancelar a qualquer momento. Veja a{' '}
          <a href="#privacidade" className="underline underline-offset-2">
            política de privacidade
          </a>
          .
        </span>
      </label>
      {error ? (
        <p id={`${uid}-erro`} role="alert" className="mt-2 flex items-center gap-1.5 text-sm text-[#f6b8a8]">
          <WarningCircle size={16} aria-hidden="true" />
          {error}
        </p>
      ) : (
        <p id={`${uid}-ajuda`} className="mt-2 text-xs text-linen/65">
          Um e-mail por drop, sem spam.
        </p>
      )}
    </form>
  )
}

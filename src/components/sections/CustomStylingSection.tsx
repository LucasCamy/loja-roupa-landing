import { useCallback, useId, useState, type FormEvent } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { CheckCircle, WarningCircle, WhatsappLogo } from '@phosphor-icons/react'
import { occasions, tones } from '../../data/content'
import { SIZES, type Size } from '../../data/products'
import { asset } from '../../lib/media'
import { useStylingPrefill } from '../../lib/shop'
import { stylingMessage, whatsappLink } from '../../lib/whatsapp'
import { Button, ButtonLink } from '../ui/Button'
import { MaskTitle, Reveal, RevealGroup, RevealItem } from '../ui/Reveal'
import { SmartImage } from '../ui/SmartImage'
import { ease } from '../ui/motion'

type Errors = Partial<Record<'name' | 'occasion' | 'size', string>>

const atelier = asset(
  'atelier-process',
  'Mesa de modelagem com rolos de linho, fita métrica, tesoura dourada, amostras de tecidos e botões naturais.',
  1400,
  1050,
)

/** Briefing de styling / ajuste sob medida → mensagem pronta no WhatsApp (sem backend). */
export function CustomStylingSection() {
  const stylingPrefill = useStylingPrefill()
  const uid = useId()
  const [name, setName] = useState('')
  const [occasion, setOccasion] = useState('')
  const [size, setSize] = useState<Size | ''>('')
  const [picked, setPicked] = useState<string[]>([])
  const [date, setDate] = useState('')
  const [notes, setNotes] = useState('')
  const [errors, setErrors] = useState<Errors>({})
  const [sent, setSent] = useState<string | null>(null)
  const [prefillTick, setPrefillTick] = useState(0)

  // Prefill vindo do modal de produto (peça sob medida): ajusta o estado durante a renderização
  if (stylingPrefill && stylingPrefill.tick !== prefillTick) {
    setPrefillTick(stylingPrefill.tick)
    if (stylingPrefill.occasion) setOccasion(stylingPrefill.occasion)
    if (stylingPrefill.size) setSize(stylingPrefill.size)
    if (stylingPrefill.notes) setNotes(stylingPrefill.notes)
    setSent(null)
  }

  const brief = { name: name || '(seu nome)', occasion: occasion || '(ocasião)', size: size || '(tamanho)', tones: picked, date, notes }
  const message = stylingMessage(brief)

  const focusSuccess = useCallback((el: HTMLDivElement | null) => el?.focus(), [])

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const next: Errors = {}
    if (name.trim().length < 2) next.name = 'Conte como podemos te chamar.'
    if (!occasion) next.occasion = 'Escolha uma ocasião.'
    if (!size) next.size = 'Escolha seu tamanho habitual.'
    setErrors(next)
    if (Object.keys(next).length) {
      document.getElementById(`${uid}-${Object.keys(next)[0]}`)?.focus()
      return
    }
    const link = whatsappLink(stylingMessage({ name, occasion, size, tones: picked, date, notes }))
    setSent(link)
    window.open(link, '_blank', 'noopener,noreferrer')
  }

  const toggleTone = (t: string) => setPicked((cur) => (cur.includes(t) ? cur.filter((x) => x !== t) : [...cur, t]))
  const field =
    'mt-1.5 h-12 w-full rounded-[10px] bg-ivory px-3.5 ring-1 ring-inset ring-sand-line focus:outline-none focus-visible:ring-2 focus-visible:ring-terracotta-deep aria-invalid:ring-2 aria-invalid:ring-error'

  return (
    <section id="consultoria" aria-labelledby="consultoria-titulo" className="py-20 md:py-28">
      <div className="container-x grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:gap-16">
        {/* Etapas: texto, foto da mesa de modelagem (cortina) e a prévia da mensagem */}
        <RevealGroup at={0.2} stagger={0.14}>
          <RevealItem as="p" variant="fade" className="eyebrow mb-3">
            Consultoria & sob medida
          </RevealItem>
          <MaskTitle id="consultoria-titulo" className="h2">
            Uma stylist para o seu <em>próximo</em> compromisso
          </MaskTitle>
          <RevealItem as="p" className="mt-4 max-w-lg text-taupe">
            Conte a ocasião, seu tamanho e os tons de que gosta. Montamos sugestões com peças da coleção e, se precisar, ajustamos comprimento e barra em 10
            dias úteis.
          </RevealItem>
          <RevealItem variant="curtain" className="mt-8 rounded-[28px]">
            <SmartImage asset={atelier} sizes="(min-width: 1024px) 45vw, 100vw" className="aspect-[4/3] w-full rounded-[28px]" />
          </RevealItem>

          <RevealItem className="mt-6 rounded-[18px] bg-ivory p-5 ring-1 ring-sand-line">
            <p className="text-sm font-semibold">Prévia da mensagem</p>
            <pre
              className="mt-2 max-h-56 overflow-auto whitespace-pre-wrap font-sans text-sm leading-relaxed text-taupe"
              aria-live="polite"
              data-testid="styling-preview"
            >
              {message}
            </pre>
          </RevealItem>
        </RevealGroup>

        <Reveal at={0.15} delay={0.15} className="self-start">
          <form noValidate onSubmit={submit} className="rounded-[28px] bg-ivory p-5 shadow-soft ring-1 ring-sand-line sm:p-8" aria-describedby={`${uid}-aviso`}>
            <div>
              <label htmlFor={`${uid}-name`} className="text-sm font-semibold">
                Seu nome
              </label>
              <input
                id={`${uid}-name`}
                value={name}
                onChange={(e) => setName(e.target.value.slice(0, 60))}
                autoComplete="given-name"
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? `${uid}-name-erro` : undefined}
                className={field}
              />
              {errors.name && <ErrorText id={`${uid}-name-erro`}>{errors.name}</ErrorText>}
            </div>

            <fieldset className="mt-6" aria-describedby={errors.occasion ? `${uid}-occ-erro` : undefined}>
              <legend className="text-sm font-semibold">Ocasião</legend>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {occasions.map((o, i) => (
                  <label
                    key={o}
                    className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-[10px] px-3.5 py-2.5 text-sm ring-1 ring-inset transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-terracotta-deep ${
                      occasion === o ? 'bg-sage-soft font-semibold ring-sage-deep' : 'ring-sand-line hover:bg-linen'
                    }`}
                  >
                    <input
                      id={i === 0 ? `${uid}-occasion` : undefined}
                      type="radio"
                      name={`${uid}-occ`}
                      value={o}
                      checked={occasion === o}
                      onChange={() => setOccasion(o)}
                      className="size-4 accent-sage-deep"
                    />
                    {o}
                  </label>
                ))}
              </div>
              {errors.occasion && <ErrorText id={`${uid}-occ-erro`}>{errors.occasion}</ErrorText>}
            </fieldset>

            <fieldset className="mt-6" aria-describedby={errors.size ? `${uid}-size-erro` : undefined}>
              <legend className="text-sm font-semibold">Tamanho habitual</legend>
              <div className="mt-2 flex flex-wrap gap-2">
                {SIZES.map((s, i) => (
                  <label
                    key={s}
                    className={`num grid h-11 min-w-12 cursor-pointer place-items-center rounded-[10px] px-3 text-sm font-semibold ring-1 ring-inset has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-terracotta-deep ${
                      size === s ? 'bg-espresso text-linen ring-espresso' : 'ring-sand-line hover:ring-espresso'
                    }`}
                  >
                    <input
                      id={i === 0 ? `${uid}-size` : undefined}
                      type="radio"
                      name={`${uid}-size`}
                      value={s}
                      checked={size === s}
                      onChange={() => setSize(s)}
                      className="sr-only"
                    />
                    {s}
                  </label>
                ))}
              </div>
              {errors.size && <ErrorText id={`${uid}-size-erro`}>{errors.size}</ErrorText>}
            </fieldset>

            <fieldset className="mt-6">
              <legend className="text-sm font-semibold">
                Tons preferidos <span className="font-normal text-taupe">(opcional)</span>
              </legend>
              <div className="mt-2 flex flex-wrap gap-2">
                {tones.map((t) => (
                  <label
                    key={t}
                    className={`flex h-10 cursor-pointer items-center rounded-full px-3.5 text-sm ring-1 ring-inset has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-terracotta-deep ${
                      picked.includes(t) ? 'bg-terracotta-deep font-semibold text-white ring-terracotta-deep' : 'ring-sand-line hover:bg-linen'
                    }`}
                  >
                    <input type="checkbox" checked={picked.includes(t)} onChange={() => toggleTone(t)} className="sr-only" />
                    {t}
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor={`${uid}-date`} className="text-sm font-semibold">
                  Data do evento ou viagem <span className="font-normal text-taupe">(opcional)</span>
                </label>
                <input id={`${uid}-date`} type="date" value={date} onChange={(e) => setDate(e.target.value)} className={field} />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor={`${uid}-notes`} className="text-sm font-semibold">
                  Observações <span className="font-normal text-taupe">(opcional)</span>
                </label>
                <textarea
                  id={`${uid}-notes`}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value.slice(0, 400))}
                  rows={3}
                  placeholder="Ex.: tenho 1,62 m, prefiro saia abaixo do joelho"
                  className="mt-1.5 w-full rounded-[10px] bg-ivory px-3.5 py-3 ring-1 ring-inset ring-sand-line placeholder:text-taupe/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-terracotta-deep"
                />
                <p className="num mt-1 text-right text-xs text-taupe">{notes.length}/400</p>
              </div>
            </div>

            <Button type="submit" variant="whatsapp" size="lg" className="mt-4 w-full" icon={<WhatsappLogo size={20} weight="fill" aria-hidden="true" />}>
              Enviar briefing para a stylist
            </Button>
            <p id={`${uid}-aviso`} className="mt-3 text-xs text-taupe">
              Nada é salvo no site: o texto abre no seu WhatsApp e você decide se envia. Usamos esses dados só para responder ao seu pedido.{' '}
              <a href="#privacidade" className="underline underline-offset-2">
                Privacidade
              </a>
            </p>

            <AnimatePresence>
              {sent && (
                <motion.div
                  ref={focusSuccess}
                  tabIndex={-1}
                  initial={{ opacity: 0, transform: 'translateY(8px)' }}
                  animate={{ opacity: 1, transform: 'translateY(0px)', transition: { duration: 0.35, ease } }}
                  exit={{ opacity: 0 }}
                  className="mt-4 flex gap-3 rounded-[14px] bg-sage-soft p-4 text-sm outline-none"
                  role="status"
                >
                  <CheckCircle size={22} weight="fill" className="shrink-0 text-sage-deep" aria-hidden="true" />
                  <div>
                    <p className="font-semibold text-sage-deep">Briefing pronto! Abrimos o WhatsApp em uma nova aba.</p>
                    <ButtonLink href={sent} variant="ghost" size="sm" className="-ml-4 mt-1 underline">
                      Não abriu? Toque aqui
                    </ButtonLink>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </Reveal>
      </div>
    </section>
  )
}

function ErrorText({ id, children }: { id: string; children: string }) {
  return (
    <p id={id} role="alert" className="mt-1.5 flex items-center gap-1.5 text-sm text-error">
      <WarningCircle size={16} aria-hidden="true" />
      {children}
    </p>
  )
}

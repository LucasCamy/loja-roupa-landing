import { useEffect, useRef } from 'react'
import { motion } from 'motion/react'
import { ArrowDown, WhatsappLogo } from '@phosphor-icons/react'
import { site } from '../../config/site'
import { asset, mediaUrl } from '../../lib/media'
import { useCanAnimate } from '../../lib/scroll'
import { whatsappLink } from '../../lib/whatsapp'
import { ButtonLink } from '../ui/Button'
import { SmartImage } from '../ui/SmartImage'
import { ease } from '../ui/motion'

const heroImage = asset(
  'hero-main',
  'Modelo com vestido midi de linho terracota em ateliê iluminado pelo sol, com cortina de linho e arara de madeira clara.',
  1920,
  1200,
  '54% 48%',
)

const lines = [
  <>O linho que</>,
  <>
    <em>acompanha</em> o
  </>,
  <>seu passo.</>,
]

export function Hero() {
  const canAnimate = useCanAnimate()
  const videoRef = useRef<HTMLVideoElement>(null)

  // Vídeo só toca com movimento permitido e enquanto visível
  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    if (!canAnimate) {
      video.pause()
      return
    }
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) video.play().catch(() => {})
      else video.pause()
    })
    io.observe(video)
    return () => io.disconnect()
  }, [canAnimate])

  return (
    <section id="inicio" aria-labelledby="hero-titulo" className="relative overflow-hidden">
      <div className="container-x grid items-center gap-10 pb-16 pt-8 md:pt-12 lg:min-h-[calc(100dvh-108px)] lg:grid-cols-[1.05fr_0.95fr] lg:gap-14 lg:pb-20">
        <div className="relative z-10 max-w-[640px]">
          <motion.p
            initial={{ opacity: 0, transform: 'translateY(8px)' }}
            animate={{ opacity: 1, transform: 'translateY(0px)' }}
            transition={{ duration: 0.5, ease }}
            className="inline-flex items-center gap-2 rounded-full bg-ivory py-1.5 pl-2 pr-3.5 text-[0.78rem] font-semibold text-espresso shadow-soft ring-1 ring-sand-line"
          >
            <span className="rounded-full bg-butter px-2 py-0.5 text-[0.68rem] font-bold uppercase tracking-[0.08em]">Drop 01</span>
            Coleção Outono/Inverno · Tiragem Limitada
          </motion.p>

          <h1 id="hero-titulo" className="mt-6 text-[clamp(2.9rem,1.6rem+5.6vw,6.4rem)] leading-[0.96]">
            {lines.map((line, i) => (
              <span key={i} className="block overflow-hidden pb-[0.06em]">
                <motion.span
                  className="block"
                  initial={{ transform: 'translateY(105%)' }}
                  animate={{ transform: 'translateY(0%)' }}
                  transition={{ duration: 0.9, ease, delay: 0.12 + i * 0.1 }}
                >
                  {line}
                </motion.span>
              </span>
            ))}
          </h1>

          <motion.div initial={{ opacity: 0, transform: 'translateY(12px)' }} animate={{ opacity: 1, transform: 'translateY(0px)' }} transition={{ duration: 0.6, ease, delay: 0.5 }}>
            <p className="mt-6 max-w-[52ch] text-[1.08rem] text-taupe">
              Vestidos, alfaiataria e tricôs em fibras naturais, com modelagem autoral do PP ao GG. Monte a sua sacola e finalize com a nossa stylist pelo WhatsApp.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="#colecao" size="lg" iconRight={<ArrowDown size={18} weight="bold" aria-hidden="true" />}>
                Explorar a Coleção
              </ButtonLink>
              <ButtonLink href={whatsappLink(site.whatsappMessages.look)} size="lg" variant="secondary" icon={<WhatsappLogo size={20} aria-hidden="true" />}>
                Montar Look no WhatsApp
              </ButtonLink>
            </div>
            <dl className="mt-10 grid max-w-md grid-cols-3 gap-4 border-t border-sand-line pt-5 text-sm">
              <div>
                <dt className="text-taupe">Tamanhos</dt>
                <dd className="num mt-0.5 font-semibold">PP ao GG</dd>
              </div>
              <div>
                <dt className="text-taupe">Tiragem</dt>
                <dd className="num mt-0.5 font-semibold">30–80 peças</dd>
              </div>
              <div>
                <dt className="text-taupe">Pix</dt>
                <dd className="num mt-0.5 font-semibold">5% OFF</dd>
              </div>
            </dl>
          </motion.div>
        </div>

        {/* Moldura arqueada com vídeo ambiente */}
        <div className="relative mx-auto w-full max-w-[520px] lg:max-w-none">
          <motion.div
            initial={{ opacity: 0, clipPath: 'inset(10% 6% 0% 6%)' }}
            animate={{ opacity: 1, clipPath: 'inset(0% 0% 0% 0%)' }}
            transition={{ duration: 1.1, ease, delay: 0.15 }}
            className="relative aspect-[4/5] overflow-hidden rounded-t-full rounded-b-[28px] bg-sand shadow-lift lg:aspect-[4/5.2]"
          >
            <SmartImage asset={heroImage} priority sizes="(min-width: 1024px) 45vw, 100vw" className="absolute inset-0 size-full" pictureClassName="contents" />
            <video
              ref={videoRef}
              className="absolute inset-0 size-full object-cover"
              style={{ objectPosition: '62% 50%' }}
              muted
              loop
              playsInline
              preload="metadata"
              poster={mediaUrl('hero-main', 'webp')}
              aria-hidden="true"
              tabIndex={-1}
            >
              <source src={mediaUrl('hero-ambient', 'mp4')} type="video/mp4" />
            </video>
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-espresso/45 to-transparent" />
            <p className="absolute bottom-5 left-5 right-5 font-display text-xl italic text-linen sm:text-2xl">Vestido Midi Brisa em Linho · Terracota</p>
          </motion.div>

          <RotatingSeal canAnimate={canAnimate} />
        </div>
      </div>
    </section>
  )
}

function RotatingSeal({ canAnimate }: { canAnimate: boolean }) {
  const text = 'Modelagem Autoral · Tecidos Naturais · '
  return (
    <div className="absolute -left-3 top-[58%] grid size-28 place-items-center rounded-full bg-butter text-espresso shadow-soft sm:-left-8 sm:size-32">
      <svg viewBox="0 0 120 120" className={`absolute inset-0 size-full ${canAnimate ? 'animate-[spin_24s_linear_infinite]' : ''}`} aria-hidden="true">
        <defs>
          <path id="seal-circle" d="M60,60 m-44,0 a44,44 0 1,1 88,0 a44,44 0 1,1 -88,0" />
        </defs>
        <text fontSize="10.4" fontWeight="700" letterSpacing="1.6" fill="currentColor" style={{ textTransform: 'uppercase', fontFamily: 'var(--font-sans)' }}>
          <textPath href="#seal-circle">{text}</textPath>
        </text>
      </svg>
      <span className="font-display text-3xl italic leading-none">A</span>
      <span className="sr-only">Modelagem autoral, tecidos naturais</span>
    </div>
  )
}

/**
 * Cena de scroll (GSAP + ScrollTrigger): 120 quadros desenhados em <canvas>.
 * Desktop: seção fixada com scrub. Celular: scrub sem pin.
 * Carregado sob demanda (React.lazy) só quando há movimento permitido.
 */
import { useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { craftSteps } from '../../data/content'
import { mediaUrl } from '../../lib/media'
import { SmartImage } from '../ui/SmartImage'
import { sketch } from '../../data/craft'
import { CraftIntro } from './AtelierCraft'

gsap.registerPlugin(ScrollTrigger, useGSAP)

const FRAME_COUNT = 120
const frameName = (i: number) => `frames/frame_${String(i + 1).padStart(4, '0')}`
const actOf = (frame: number) => (frame < 35 ? 0 : frame < 85 ? 1 : 2)

function avifSupported() {
  return new Promise<boolean>((resolve) => {
    const img = new Image()
    img.onload = () => resolve(img.width > 0)
    img.onerror = () => resolve(false)
    img.src = mediaUrl(frameName(0), 'avif')
  })
}

export default function AtelierCraftScene() {
  const root = useRef<HTMLDivElement>(null)
  const pinRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)
  const [act, setAct] = useState(0)

  useGSAP(
    () => {
      const canvas = canvasRef.current
      const ctx = canvas?.getContext('2d')
      if (!canvas || !ctx) return
      const frames: (HTMLImageElement | null)[] = new Array(FRAME_COUNT).fill(null)
      const state = { frame: 0 }
      let wanted = 0
      let lastAct = 0
      let loading = false
      let disposed = false

      const nearest = (i: number) => {
        for (let d = 0; d < FRAME_COUNT; d++) {
          if (frames[i - d]) return frames[i - d]
          if (frames[i + d]) return frames[i + d]
        }
        return null
      }

      const draw = () => {
        const img = nearest(wanted)
        if (!img) return
        const { width: cw, height: ch } = canvas
        const scale = Math.max(cw / img.naturalWidth, ch / img.naturalHeight)
        const w = img.naturalWidth * scale
        const h = img.naturalHeight * scale
        ctx.drawImage(img, (cw - w) * 0.54, (ch - h) * 0.48, w, h)
      }

      const resize = () => {
        const r = canvas.getBoundingClientRect()
        const dpr = Math.min(2, window.devicePixelRatio || 1)
        canvas.width = Math.max(1, Math.round(r.width * dpr))
        canvas.height = Math.max(1, Math.round(r.height * dpr))
        draw()
      }
      const ro = new ResizeObserver(resize)
      ro.observe(canvas)

      const load = async () => {
        if (loading) return
        loading = true
        const ext = (await avifSupported()) ? 'avif' : 'webp'
        // Primeiro 1 a cada 8 quadros (cena navegável cedo), depois o restante
        const order = [...Array(FRAME_COUNT).keys()].sort((a, b) => Number(a % 8 !== 0) - Number(b % 8 !== 0) || a - b)
        const request = (i: number) => {
          const img = new Image()
          img.src = mediaUrl(frameName(i), ext)
          // decode() decodifica fora do thread principal; desenhar uma imagem só
          // "carregada" forçava a decodificação síncrona dentro do drawImage.
          img
            .decode()
            .then(() => {
              frames[i] = img
              if (Math.abs(i - wanted) <= 4) draw()
            })
            .catch(() => {})
        }
        // Lotes pequenos nos intervalos ociosos: criar as 120 imagens de uma vez
        // gerava um quadro longo bem no meio da rolagem.
        const idle = (cb: () => void) => ('requestIdleCallback' in window ? requestIdleCallback(cb, { timeout: 300 }) : setTimeout(cb, 16))
        const batch = () => {
          order.splice(0, 8).forEach(request)
          if (order.length && !disposed) idle(batch)
        }
        batch()
      }

      ScrollTrigger.create({ trigger: root.current, start: 'top 160%', once: true, onEnter: load })

      const mm = gsap.matchMedia()
      mm.add({ desktop: '(min-width: 768px)', mobile: '(max-width: 767px)' }, (c) => {
        const desktop = !!c.conditions?.desktop
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: desktop ? pinRef.current : canvas,
            start: desktop ? 'top top' : 'top 85%',
            end: desktop ? '+=220%' : 'bottom 15%',
            scrub: 0.6,
            pin: desktop ? pinRef.current : false,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        })
        tl.to(state, {
          frame: FRAME_COUNT - 1,
          ease: 'none',
          onUpdate: () => {
            wanted = Math.round(state.frame)
            draw()
            const a = actOf(wanted)
            if (a !== lastAct) {
              lastAct = a
              setAct(a)
            }
          },
        }).fromTo(progressRef.current, { scaleX: 0 }, { scaleX: 1, ease: 'none' }, 0)
      })

      // Lazy chunk monta depois de outros gatilhos: reordena e recalcula
      ScrollTrigger.sort()
      ScrollTrigger.refresh()

      return () => {
        disposed = true
        ro.disconnect()
        mm.revert()
      }
    },
    { scope: root },
  )

  return (
    <div ref={root}>
      <div ref={pinRef} className="flex flex-col justify-center py-16 md:min-h-[100dvh] md:py-12">
        <div className="container-x grid items-center gap-8 md:gap-12 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.4fr)]">
          <CraftIntro>
            <ol className="mt-8 hidden space-y-1 md:block lg:mt-10">
              {craftSteps.map((s, i) => (
                <li
                  key={s.title}
                  className={`grid grid-cols-[2.25rem_minmax(0,1fr)] gap-3 border-t border-linen/15 py-3.5 transition-opacity duration-500 ${i === act ? 'opacity-100' : 'opacity-40'}`}
                  aria-current={i === act ? 'step' : undefined}
                >
                  <span className="num font-display text-2xl italic text-butter">{i + 1}</span>
                  <div>
                    <h3 className="font-display text-[1.6rem] text-linen">{s.title}</h3>
                    <p className="mt-0.5 text-sm text-linen/75">{s.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </CraftIntro>

          <figure>
            <div className="relative aspect-[16/9] overflow-hidden rounded-[28px] bg-sand shadow-lift">
              <SmartImage asset={sketch} alt="" className="absolute inset-0 size-full" pictureClassName="contents" />
              <canvas ref={canvasRef} className="absolute inset-0 size-full" aria-hidden="true" data-testid="craft-canvas" />
              <span className="absolute left-3 top-3 rounded-[4px] bg-ivory/90 px-2 py-1 text-xs font-bold uppercase tracking-[0.08em] text-espresso">
                {['Croqui e modelagem', 'O linho aparece', 'Peça finalizada'][act]}
              </span>
            </div>
            <div className="mt-4 h-0.5 overflow-hidden rounded-full bg-linen/15" aria-hidden="true">
              <div ref={progressRef} className="h-full origin-left scale-x-0 bg-butter" />
            </div>
            <figcaption className="sr-only">
              Sequência do croqui ao vestido de linho pronto, em três atos: croqui e modelagem, revelação do linho e peça finalizada.
            </figcaption>
            {/* Legenda única no celular */}
            <div className="mt-5 md:hidden" aria-live="polite">
              <p className="num font-display text-xl italic text-butter">
                {act + 1}. {craftSteps[act].title}
              </p>
              <p className="mt-1 text-sm text-linen/75">{craftSteps[act].text}</p>
            </div>
          </figure>
        </div>
      </div>
    </div>
  )
}

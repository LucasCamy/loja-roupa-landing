import { lazy, Suspense, useId, useState, type ReactNode } from 'react'
import { craftSteps } from '../../data/content'
import { finished, sketch } from '../../data/craft'
import { useCanAnimate } from '../../lib/scroll'
import { SmartImage } from '../ui/SmartImage'

const AtelierCraftScene = lazy(() => import('./AtelierCraftScene'))


export function CraftIntro({ children }: { children?: ReactNode }) {
  return (
    <div className="max-w-xl">
      <p className="eyebrow mb-3 text-butter">Nosso linho</p>
      <h2 id="linho-titulo" className="h2 text-linen [&_em]:text-butter">
        Do croqui ao <em>caimento</em>
      </h2>
      <p className="mt-4 text-linen/80">
        Cada modelo nasce no papel, ganha molde graduado do PP ao GG e só então vai para o linho. Role para ver o Vestido Midi Brisa sair do traço.
      </p>
      {children}
    </div>
  )
}

/**
 * Elemento-assinatura. Com movimento permitido: sequência de 120 quadros em
 * <canvas> controlada pelo scroll (GSAP, chunk separado). Com movimento reduzido:
 * comparador Antes ↔ Depois acessível por teclado + etapas em lista.
 */
export function AtelierCraft() {
  const canAnimate = useCanAnimate()
  return (
    <section id="linho" aria-labelledby="linho-titulo" className="relative bg-espresso text-linen">
      {canAnimate ? (
        <Suspense fallback={<StaticCraft />}>
          <AtelierCraftScene />
        </Suspense>
      ) : (
        <StaticCraft />
      )}
    </section>
  )
}

function StaticCraft() {
  return (
    <div className="container-x py-20 md:py-28">
      <CraftIntro />
      <div className="mt-10 grid items-start gap-10 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <BeforeAfter />
        <ol className="space-y-6">
          {craftSteps.map((s, i) => (
            <li key={s.title} className="grid grid-cols-[2.5rem_minmax(0,1fr)] gap-3 border-t border-linen/15 pt-5">
              <span className="num font-display text-3xl italic text-butter">{i + 1}</span>
              <div>
                <h3 className="font-display text-[1.7rem] text-linen">{s.title}</h3>
                <p className="mt-1 text-linen/75">{s.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  )
}

export function BeforeAfter() {
  const [pos, setPos] = useState(50)
  const id = useId()
  return (
    <figure>
      <div className="relative aspect-[16/9] overflow-hidden rounded-[28px] bg-sand">
        <SmartImage asset={finished} className="absolute inset-0 size-full" pictureClassName="contents" />
        <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
          <SmartImage asset={sketch} className="absolute inset-0 size-full" pictureClassName="contents" />
        </div>
        <div className="pointer-events-none absolute inset-y-0 w-0.5 bg-ivory shadow-soft" style={{ left: `${pos}%` }} aria-hidden="true">
          <span className="absolute left-1/2 top-1/2 grid size-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-ivory text-sm font-bold text-espresso shadow-lift">
            ⇆
          </span>
        </div>
        <span className="absolute left-3 top-3 rounded-[4px] bg-ivory/90 px-2 py-1 text-xs font-bold uppercase tracking-[0.08em] text-espresso">Croqui</span>
        <span className="absolute right-3 top-3 rounded-[4px] bg-espresso/80 px-2 py-1 text-xs font-bold uppercase tracking-[0.08em] text-linen">Peça pronta</span>
      </div>
      <label htmlFor={id} className="mt-4 block text-sm text-linen/80">
        Arraste para comparar o croqui com a peça pronta
      </label>
      <input
        id={id}
        type="range"
        min={0}
        max={100}
        value={pos}
        onChange={(e) => setPos(Number(e.target.value))}
        aria-valuetext={`${pos}% croqui`}
        className="mt-2 w-full accent-butter"
      />
    </figure>
  )
}

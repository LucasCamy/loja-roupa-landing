import { site } from '../../config/site'
import { editions } from '../../data/content'
import { asset } from '../../lib/media'
import { MaskTitle, RevealGroup, RevealItem } from '../ui/Reveal'
import { SmartImage } from '../ui/SmartImage'

const portrait = asset('founder-portrait', 'Retrato editorial de diretora criativa fictícia ajustando uma peça em manequim de costura no ateliê.', 1200, 1500, '48% 38%')

/**
 * Etapas: o retrato abre como cortina quando metade dele está na tela e a
 * etiqueta com o nome aparece depois; em seguida título, parágrafos, as linhas
 * da tabela (uma a uma, com disparo próprio) e a assinatura.
 */
export function AboutBrand() {
  return (
    <section id="sobre" aria-labelledby="sobre-titulo" className="bg-ivory py-20 md:py-28">
      <div className="container-x grid grid-cols-[minmax(0,1fr)] items-center gap-12 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-20">
        <RevealGroup at={0.12} stagger={0.55} className="relative mx-auto w-full max-w-[480px]">
          <RevealItem variant="curtain" cover="bg-ivory" className="rounded-[28px]">
            <SmartImage asset={portrait} sizes="(min-width: 1024px) 480px, 100vw" className="aspect-[4/5] w-full rounded-[28px]" />
          </RevealItem>
          <RevealItem as="p" variant="pop" className="absolute -bottom-4 right-4 origin-bottom-right rounded-[10px] bg-butter px-3 py-2 text-sm font-semibold shadow-soft">
            {site.founder.name}, {site.founder.role}
          </RevealItem>
        </RevealGroup>

        <div>
          <RevealGroup at={0.25} stagger={0.14}>
            <MaskTitle id="sobre-titulo" className="h2">
              Poucas peças, feitas para <em>durar</em> muitos verões
            </MaskTitle>
            <div className="mt-6 max-w-xl space-y-4 text-[1.05rem] text-espresso/90">
              <RevealItem as="p">
                A Aura nasceu de uma mesa de modelagem e de uma teimosia: fazer roupa de linho que caia bem em corpos reais, do PP ao GG, sem trocar qualidade por volume.
              </RevealItem>
              <RevealItem as="p">
                Produzimos em lotes pequenos, com fornecedores que conhecemos pelo nome. Quando um modelo esgota, ele volta só se o tecido certo voltar. É mais lento, e é de propósito.
              </RevealItem>
            </div>
          </RevealGroup>

          <div className="mt-8 overflow-x-auto">
            <table className="num w-full min-w-[420px] text-left text-sm">
              <caption className="mb-2 text-left text-sm font-semibold">Tiragem desta coleção</caption>
              <thead className="font-mono text-[0.72rem] uppercase tracking-[0.06em] text-taupe">
                <tr className="border-b border-sand-line">
                  <th scope="col" className="py-2 pr-4 font-medium">Peça</th>
                  <th scope="col" className="py-2 pr-4 font-medium">Tecido</th>
                  <th scope="col" className="py-2 text-right font-medium">Peças no lote</th>
                </tr>
              </thead>
              <RevealGroup as="tbody" at={0.2} stagger={0.09}>
                {editions.map((e) => (
                  <RevealItem as="tr" variant="slide" key={e.piece} className="border-b border-sand-line">
                    <th scope="row" className="py-2.5 pr-4 font-semibold">
                      {e.piece}
                    </th>
                    <td className="py-2.5 pr-4 text-taupe">{e.fabric}</td>
                    <td className="py-2.5 text-right font-semibold">{e.lot}</td>
                  </RevealItem>
                ))}
              </RevealGroup>
            </table>
          </div>

          <RevealGroup at={0.12} delay={0.2}>
            <RevealItem as="p" variant="fade" className="mt-8 font-display text-3xl italic text-terracotta-deep">
              {site.founder.name}
            </RevealItem>
            {site.isDemo && (
              <RevealItem as="p" variant="fade" className="mt-1 text-xs text-taupe">
                Personagem e números ilustrativos (marca demonstrativa).
              </RevealItem>
            )}
          </RevealGroup>
        </div>
      </div>
    </section>
  )
}

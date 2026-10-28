/**
 * STYLEGUIDE · espelho navegável do sistema (Foundations, Components, States).
 * Usa os componentes reais do site, então não fica desatualizado.
 * Abra em /styleguide.html. Pode ser capturado para o Figma (ver FIGMA_GUIDE.md).
 */
import { useState, type ReactNode } from 'react'
import { WhatsappLogo, Tote } from '@phosphor-icons/react'
import { getProduct, type Size } from '../data/products'
import { ShopProvider } from '../lib/shop'
import { Badge, type BadgeTone } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { type ButtonVariant } from '../components/ui/buttonStyles'
import { ColorSwatches } from '../components/ui/ColorSwatches'
import { Logo } from '../components/ui/Logo'
import { Price } from '../components/ui/Price'
import { SizeSelector } from '../components/ui/SizeSelector'
import { Accordion } from '../components/ui/Accordion'
import { ProductCard } from '../components/sections/ProductCard'
import { MeasurementTable } from '../components/sections/ProductDetail'

const colors = [
  { token: 'linen', hex: '#FAF6F0', role: 'Fundo da página', ink: 'espresso', ratio: 'espresso 14.40' },
  { token: 'ivory', hex: '#FFFDF9', role: 'Cards, diálogos, sacola', ink: 'espresso', ratio: 'espresso 15.26' },
  { token: 'sand', hex: '#EFE7DA', role: 'Placeholders, chips, hovers', ink: 'espresso', ratio: 'taupe 5.48' },
  { token: 'sand-line', hex: '#E2D5C1', role: 'Divisórias (decorativo)', ink: 'espresso', ratio: 'decorativo' },
  { token: 'espresso', hex: '#2C221E', role: 'Texto principal, seção escura', ink: 'linen', ratio: 'linen 14.40' },
  { token: 'taupe', hex: '#6B584C', role: 'Texto secundário', ink: 'linen', ratio: 'em linen 6.24' },
  { token: 'terracotta', hex: '#C4684E', role: 'Marca decorativa, progresso', ink: 'espresso', ratio: 'texto ≥ 24px' },
  { token: 'terracotta-deep', hex: '#9E4730', role: 'CTA primário, eyebrows, links', ink: 'white', ratio: 'branco 6.18' },
  { token: 'sage', hex: '#6E8268', role: 'Decorativo', ink: 'white', ratio: 'não usar em texto' },
  { token: 'sage-deep', hex: '#4F6249', role: 'Texto de sucesso / estoque', ink: 'white', ratio: 'em linen 6.14' },
  { token: 'sage-soft', hex: '#E6ECE3', role: 'Fundo do look, sucesso', ink: 'espresso', ratio: 'espresso 12.90' },
  { token: 'butter', hex: '#F2D479', role: 'Badge Novo Drop, selo', ink: 'espresso', ratio: 'espresso 10.68' },
  { token: 'whatsapp-green', hex: '#2F6B48', role: 'CTA WhatsApp', ink: 'white', ratio: 'branco 6.33' },
  { token: 'error', hex: '#A3362A', role: 'Erros (com ícone + texto)', ink: 'white', ratio: 'branco 6.73' },
]

function Page({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="border-t border-sand-line py-16">
      <div className="container-x">
        <h2 className="text-5xl">{title}</h2>
        <div className="mt-10">{children}</div>
      </div>
    </section>
  )
}

function Frame({ label, children, className = '' }: { label: string; children: ReactNode; className?: string }) {
  return (
    <figure className={`flex min-w-0 flex-col gap-3 ${className}`}>
      <div className="flex flex-1 flex-wrap items-center gap-3 rounded-[18px] bg-ivory p-6 ring-1 ring-sand-line">{children}</div>
      <figcaption className="text-sm text-taupe">{label}</figcaption>
    </figure>
  )
}

export function Styleguide() {
  const [size, setSize] = useState<Size | null>('M')
  const [color, setColor] = useState('Terracota')
  const dress = getProduct('vestido-midi-brisa')!
  const cardigan = getProduct('cardigan-trico-cacau')!
  const variants: ButtonVariant[] = ['primary', 'secondary', 'whatsapp', 'ghost', 'light']
  const tones: [BadgeTone, string][] = [
    ['butter', 'Novo Drop'],
    ['espresso', 'Mais Vendido'],
    ['terracotta', 'Edição Limitada'],
    ['sand', 'Últimas Peças'],
    ['muted', 'Esgotado'],
    ['sage', '-12%'],
  ]

  return (
    <ShopProvider>
      <header className="container-x flex flex-wrap items-center justify-between gap-4 py-8">
        <Logo />
        <nav className="flex flex-wrap gap-4 text-sm font-semibold">
          <a href="#fundacoes">Fundações</a>
          <a href="#componentes">Componentes</a>
          <a href="#estados">Estados</a>
          <a href="/">Voltar ao site</a>
        </nav>
      </header>
      <main>
        <div className="container-x pb-16">
          <p className="eyebrow">Design system · Warm Mediterranean Boutique</p>
          <h1 className="mt-3 text-[clamp(3rem,2rem+4vw,6rem)]">
            Aura Atelier, <em>styleguide</em>
          </h1>
          <p className="mt-4 max-w-2xl text-taupe">Tokens em src/styles/tokens.css e design/tokens.json. Componentes renderizados a partir do código do site.</p>
        </div>

        <Page id="fundacoes" title="Fundações">
          <h3 className="text-3xl">Cores e contraste</h3>
          <ul className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {colors.map((c) => (
              <li key={c.token} className="overflow-hidden rounded-[18px] ring-1 ring-sand-line">
                <div className="flex h-24 items-end p-3 text-sm font-semibold" style={{ background: c.hex, color: c.ink === 'white' ? '#fff' : c.ink === 'linen' ? '#FAF6F0' : '#2C221E' }}>
                  Aa
                </div>
                <div className="bg-ivory p-3 text-xs">
                  <p className="font-mono font-semibold">{c.token}</p>
                  <p className="num font-mono text-taupe">{c.hex}</p>
                  <p className="mt-1 text-taupe">{c.role}</p>
                  <p className="mt-1 font-semibold">{c.ratio}</p>
                </div>
              </li>
            ))}
          </ul>

          <h3 className="mt-14 text-3xl">Tipografia</h3>
          <div className="mt-6 grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-3">
            <Frame label="Display · Cormorant Garamond 500 + itálico (acentos: é ã ç õ)">
              <p className="font-display text-5xl leading-none">
                Caimento <em className="text-terracotta-deep">ação</em> é ã ç õ
              </p>
            </Frame>
            <Frame label="Corpo/UI · Plus Jakarta Sans, preços com tabular-nums">
              <p className="num text-lg">R$ 1.234,56 · 6x de R$ 64,83 · PP P M G GG</p>
            </Frame>
            <Frame label="Técnica · JetBrains Mono (SKU, tabelas)">
              <p className="sku text-base">Ref. AU-101 · busto 86 cm</p>
            </Frame>
          </div>

          <h3 className="mt-14 text-3xl">Raios e sombras</h3>
          <div className="mt-6 flex flex-wrap gap-4">
            {[
              ['4px badge', 'rounded-[4px]'],
              ['10px controle', 'rounded-[10px]'],
              ['18px painel', 'rounded-[18px] shadow-soft'],
              ['28px moldura', 'rounded-[28px] shadow-lift'],
              ['arco hero', 'rounded-t-full rounded-b-[28px]'],
            ].map(([label, cls]) => (
              <div key={label} className="text-center text-xs text-taupe">
                <div className={`size-28 bg-sand ${cls}`} />
                <p className="mt-2">{label}</p>
              </div>
            ))}
          </div>
        </Page>

        <Page id="componentes" title="Componentes">
          <div className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-2">
            <Frame label="Button · variantes (md)">
              {variants.map((v) => (
                <Button key={v} variant={v} icon={v === 'whatsapp' ? <WhatsappLogo size={18} weight="fill" aria-hidden="true" /> : undefined}>
                  {v}
                </Button>
              ))}
            </Frame>
            <Frame label="Button · tamanhos sm / md / lg + desabilitado">
              <Button size="sm">Pequeno</Button>
              <Button>Médio</Button>
              <Button size="lg" icon={<Tote size={18} aria-hidden="true" />}>
                Grande
              </Button>
              <Button disabled>Desabilitado</Button>
            </Frame>
            <Frame label="Badges">
              {tones.map(([t, l]) => (
                <Badge key={l} tone={t}>
                  {l}
                </Badge>
              ))}
            </Frame>
            <Frame label="ColorSwatches (md, com nome)">
              <ColorSwatches colors={dress.colors} value={color} onChange={setColor} showName />
            </Frame>
            <Frame label="SizeSelector · disponível, selecionado, últimas unidades (losango), esgotado">
              <SizeSelector product={cardigan} value={size} onChange={setSize} />
            </Frame>
            <Frame label="Price · lg">
              <Price product={getProduct('calca-reta-linho-cru')!} size="lg" />
            </Frame>
            <Frame label="Tabela de medidas (cm), tamanho destacado" className="lg:col-span-2">
              <div className="w-full">
                <MeasurementTable product={dress} highlight={size} />
              </div>
            </Frame>
            <Frame label="Accordion WAI-ARIA" className="lg:col-span-2">
              <Accordion
                className="w-full"
                defaultOpen={['a']}
                items={[
                  { id: 'a', title: 'Composição & Tecido', content: <p>{dress.fabric}</p> },
                  { id: 'b', title: 'Trocas & Envio', content: <p>1ª troca grátis em até 30 dias.</p> },
                ]}
              />
            </Frame>
          </div>
        </Page>

        <Page id="estados" title="Estados do card">
          <ul className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4">
            {['vestido-midi-brisa', 'vestido-longo-sol', 'regata-gola-alta-areia', 'calca-reta-linho-cru'].map((slug) => (
              <li key={slug} className="min-w-0">
                <ProductCard product={getProduct(slug)!} />
                <p className="mt-2 text-xs text-taupe">{slug === 'vestido-longo-sol' ? 'Sob medida' : slug === 'regata-gola-alta-areia' ? 'Esgotado' : slug === 'calca-reta-linho-cru' ? 'Com desconto' : 'Pronta-entrega (hover = 2ª foto + tamanhos)'}</p>
              </li>
            ))}
          </ul>
        </Page>
      </main>
    </ShopProvider>
  )
}

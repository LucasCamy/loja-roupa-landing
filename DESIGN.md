# DESIGN.md · Aura Atelier — "Warm Mediterranean Boutique"

## Missão visual

Fazer uma boutique de linho parecer uma revista de moda que se compra: fotografia grande e quente, tipografia editorial com itálicos de voz, e um caminho curto e confiável até a sacola e o WhatsApp. A decisão de tamanho é o ponto de maior atrito em moda online; o sistema trata medidas, notas da modelo e depoimentos com tamanho como conteúdo de primeira classe.

**Personalidade:** calma, tátil, precisa nas informações, sem pressa de vender. **Público:** mulheres 28–55, compram por Instagram/WhatsApp, valorizam fibra natural e caimento; muitas compram pelo celular.

## Princípios

1. **Foto primeiro, interface depois.** Cards 4:5 sem moldura pesada; a foto é a superfície.
2. **Tamanho é informação, não detalhe.** Guia de medidas a um clique em card, modal e depoimentos.
3. **Um acento de marca (terracota).** Sálvia/verde-WhatsApp só como estado de sucesso e CTA de conversa.
4. **Um gesto por seção.** Cada seção tem layout e interação próprios; nada de cards idênticos em sequência.
5. **Movimento que explica.** Troca de foto no hover, pílula de filtro, sacola deslizando, croqui virando peça no scroll.

## Paleta (contraste WCAG calculado)

| Token | Hex | Papel | Texto sobre linen / ivory / sand |
|---|---|---|---|
| `linen` | `#FAF6F0` | Fundo da página | — |
| `ivory` | `#FFFDF9` | Cards, diálogos, sacola | — |
| `sand` | `#EFE7DA` | Placeholders, hovers, faixas | — |
| `sand-line` | `#E2D5C1` | Divisórias (decorativo, 1.34:1) | — |
| `espresso` | `#2C221E` | Texto principal, seção escura | 14.40 / 15.26 / 12.63 |
| `taupe` | `#6B584C` | Texto secundário | 6.24 / 6.61 / 5.48 |
| `terracotta` | `#C4684E` | Marca em grandes áreas, ilustração, selo | 3.59 (só ≥ 24px ou decorativo) |
| `terracotta-deep` | `#9E4730` | CTA primário (branco 6.18), links, eyebrows | 5.74 / 6.08 / 5.04 |
| `sage` | `#6E8268` | Decorativo, barras de progresso | 3.86 (não usar como texto) |
| `sage-deep` | `#4F6249` | Texto de sucesso, “em estoque” | 6.14 / 6.51 / 5.39 |
| `sage-soft` | `#E6ECE3` | Fundo de seção/estado de sucesso | espresso 12.90 |
| `butter` | `#F2D479` | Badges “Novo Drop”, destaque | espresso 10.68 |
| `whatsapp-green` | `#2F6B48` | CTA WhatsApp/sucesso | branco 6.33 |
| `error` | `#A3362A` | Erros (sempre com ícone + texto) | 6.25 em linen · branco 6.73 |

Sobre `espresso` (seção escura): `linen` 14.40, `butter` 10.68, `terracotta` 4.01 (somente títulos grandes).

Estados sempre com forma + texto: estoque (ponto sálvia + “Em estoque”), últimas unidades (triângulo terracota + “Últimas unidades”), esgotado (traço diagonal + “Esgotado”).

## Tipografia

| Papel | Família | Uso |
|---|---|---|
| Display | **Cormorant Garamond Variable** (500–600, itálico 500) | H1–H3, nomes de peças, citações. Itálico em 1–2 palavras-chave por título |
| Corpo/UI | **Plus Jakarta Sans Variable** (400–700) | Texto, preços, tamanhos, botões, formulários; `tabular-nums` em preços, medidas e contadores |
| Técnica | **JetBrains Mono Variable** (500) | SKU (`REF. AU-101`), tabelas de medida, etiquetas técnicas |

Acentos (é, ã, ç, õ) conferidos no peso 500 e itálico no `/styleguide.html`.

Escala fluida: `display-xl clamp(2.75rem, 1.6rem + 5.4vw, 6.25rem)` · `h2 clamp(2.1rem, 1.5rem + 2.6vw, 3.6rem)` · `h3 1.6–2rem` · corpo 1rem/1.65 · pequeno 0.875rem · micro 0.75rem (caixa alta, tracking 0.14em).

## Espaço, raio, sombra

- Grade 4px; seções `py-20 md:py-28`; container `max-w-[1360px] px-4 sm:px-6 lg:px-10`.
- Raio: **4** badges/etiquetas · **10** botões quadrados, inputs, chips de tamanho · **18** painéis, cards de conteúdo · **28** molduras grandes/diálogos · **arco** `rounded-t-full` na moldura do hero. Botões CTA em pílula (`rounded-full`).
- Sombras tingidas de espresso: `soft 0 1px 2px rgb(44 34 30/.06), 0 8px 24px -12px rgb(44 34 30/.18)`; `lift 0 24px 60px -24px rgb(44 34 30/.35)`.

## Componentes

- **Button**: `primary` (terracotta-deep/branco), `secondary` (contorno espresso), `whatsapp` (whatsapp-green/branco), `ghost`, `light` (sobre foto/escuro). Tamanhos 40/48/56 px de altura.
- **ProductCard**: foto 4:5 com 2ª foto no hover (`hover:hover`), zoom 1.035, badge, swatches de cor, nome serifado, preço + parcelas, barra quick-add de tamanhos (PP–GG) que entra de baixo sobre a foto.
- **SizeSelector**: chips 44×44, estado esgotado riscado e `aria-disabled`, “Últimas unidades” em texto.
- **ColorSwatches**: bolinhas 28px com anel de foco; nome da cor ativa ao lado.
- **Badges**: `Novo Drop` butter, `Mais Vendido` espresso/linen, `Edição Limitada` terracotta-deep/branco, `Últimas Peças` sand/terracotta-deep.
- **Sheet** (diálogo): foco preso, Esc, rolagem travada, foco devolvido; painel desliza por `transform` (compositor).
- **BagDrawer**: lista animada, barra de frete grátis, preferências de pagamento, total estimado, CTA WhatsApp.

## Elemento-assinatura

**Do croqui ao caimento**: sequência de 120 quadros (`public/media/frames`) desenhada em `<canvas>` e controlada pelo scroll (GSAP ScrollTrigger, pin + scrub) com três legendas encadeadas (Escolha da fibra → Corte em pequenos lotes → Acabamento manual). Fallback/reduced motion: comparador Antes ↔ Depois (croqui × peça pronta) com controle por teclado e as três etapas em lista.

## Motion

Tokens: `--ease-out cubic-bezier(.22,1,.36,1)`, `--ease-in-out cubic-bezier(.65,0,.35,1)`; durações 120 / 180 / 280 / 560 / 900 ms. Só `transform`, `opacity`, `clip-path`. Saídas mais curtas que entradas.

- Hero: revelação de linhas do título por máscara (uma vez); selo giratório lento (pausa em reduced motion).
- Filtros: pílula com `layoutId`; grid com `layout` + fade.
- Card: troca de foto 560ms, quick-add sobe 280ms.
- Sacola: painel 420ms entra / 280ms sai; linhas com `AnimatePresence`; contador da navbar com “pulo”.
- AtelierCraft: pin + scrub (GSAP). Única cena de scroll; rolagem nativa.
- Revelação por etapas (`Reveal.tsx`): cada bloco anima quando o topo chega a ~78–88% da altura da tela, com os itens em sequência. Gestos por tipo: título sobe por máscara, texto sobe e aparece, foto abre com capa que recolhe (cortina vertical ou lateral) e leve aproximação, listas deslizam, selos surgem por último.
- `MotionConfig reducedMotion="user"`; `?movimento=1` força movimento.

## Estados

Hover (foto alterna, botão escurece), focus (anel 2px terracotta-deep + offset 2px linen), active (`translate-y-px`), loading (botão mantém largura), erro (texto + ícone, `role="alert"`, `aria-invalid`), sucesso (sage-soft + ícone de check), vazio (sacola vazia com atalho, vitrine sem resultados com “Limpar filtros”).

## Responsividade

360–767: grid de 2 colunas, quick-add por botão “+” (sem hover), sacola em tela cheia, hero empilhado (texto acima, moldura arqueada abaixo). 768–1023: 3 colunas. ≥1024: 4 colunas, hero em split assimétrico. Nav em uma linha a partir de `lg`; abaixo, menu em diálogo. `min-h-[100dvh]`, `overflow-x: clip` no `main`, alvos de toque ≥ 44px.

## Acessibilidade

Um único `h1`, skip link, `:focus-visible` global, `aria-pressed` em chips/filtros, `aria-expanded` em acordeões, `aria-live` no toast e no contador da sacola, labels visíveis em formulários, `alt` vindo do `MEDIA_MANIFEST.json`.

## Do's / Don'ts

- ✔ Itálico em palavras de sentido (“*linho*”, “*caimento*”). ✔ Informação de tamanho perto de toda decisão de compra. ✔ Preço sempre com Pix e parcelas.
- ✘ Gradientes decorativos, blobs, neon. ✘ Mais de um marquee. ✘ Travessão longo em texto visível. ✘ Terracota clara ou sálvia como cor de texto. ✘ Pulso animado sem estado ao vivo.

## Checklist final

Contraste AA conferido · foco visível em todos os controles · 0 overflow em 360–1920 · reduced motion com versão estática · 0 imagens quebradas · preços com `tabular-nums` · `isDemo` sinalizado no rodapé.

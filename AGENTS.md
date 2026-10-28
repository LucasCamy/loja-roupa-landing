# AGENTS.md · Aura Atelier (landing-boutique)

## Propósito e stack

Landing page de loja-boutique de moda feminina (marca demonstrativa **Aura Atelier**). Fluxo de venda: catálogo → sacola lateral → pedido enviado pelo WhatsApp. Não há backend, checkout nem pagamento online.

- Vite 8 + React 19 + TypeScript strict
- Tailwind CSS v4 (`@tailwindcss/vite`), tokens em `src/styles/tokens.css` expostos via `@theme inline`
- Motion (`motion/react`) para estados de UI e revelações ao rolar (`src/components/ui/Reveal.tsx`); GSAP + ScrollTrigger só na cena `AtelierCraft`. Rolagem nativa (sem Lenis: ver Desempenho)
- Phosphor Icons, fontes self-hosted via `@fontsource-variable/*` (Cormorant Garamond, Plus Jakarta Sans, JetBrains Mono)
- Vitest + Testing Library (jsdom); Playwright (`playwright-core`, Edge/Chrome instalados) para E2E e screenshots
- Docker: build Node 24 → nginx-unprivileged 1.30 na porta 8080, usuário 101 (`Dockerfile`, `docker-compose.yml`, `docker/`)
- Deploy: Cloudlane Homelab (k3s). GitHub Actions publica `ghcr.io/lucascamy/loja-roupa-landing` e o Keel aplica; manifests em `k8s/deploy.yaml` (namespace `landingpages`, porta 8215, `https://moda.cloudlane.com.br`)

## Organização

```
public/media/        mídia AVIF + WebP (+ frames/ da sequência em canvas, hero-ambient.mp4)
src/config/site.ts   marca, contatos, frete grátis, Instagram, isDemo (editar antes de publicar)
src/data/            produtos, categorias, conteúdo (FICTÍCIO / demonstrativo)
src/lib/             shop.tsx (contextos da loja), bag.ts (reducer + totais), shipping.ts (frete por CEP),
                     whatsapp.ts (mensagens), media.ts, format.ts, scroll.ts, catalog.ts
src/data/shipping.ts faixas de CEP por UF + tabela de frete por região (DEMONSTRATIVA)
src/components/ui/   primitivos (Button, Sheet, SmartImage, SizeSelector, ColorSwatches...)
src/components/sections/  as 12 seções + BagDrawer, ProductDetail, BagToast
src/styleguide/      /styleguide.html (espelho do design system, usa os componentes reais)
design/tokens.json   tokens espelhados (variáveis Figma)
scripts/             e2e.mjs, screenshots.mjs, crop_extra_products.sh
sources/, work/      PNGs de origem e artefatos do pacote de mídia (locais: fora do build e do git)
```

## Comandos

| Comando | Uso |
|---|---|
| `npm run dev` | servidor em http://localhost:5190 |
| `npm run build` | typecheck + build de produção (`dist/`) |
| `npm run typecheck` / `npm run lint` | verificação estática |
| `npm test` | Vitest (sacola, mensagem WhatsApp, filtros, componentes) |
| `npm run e2e` | Playwright contra `BASE_URL` (padrão http://localhost:4190, rode `npm run preview` antes) |
| `npm run shots` | screenshots e checagem de overflow/imagens/console em 8 larguras |
| `node scripts/perf-scroll.mjs` / `node scripts/perf-frames.mjs` | rolagem com CPU 4x mais lenta: quadros longos do thread principal (LoAF) e quadros descartados pelo pipeline, por seção (`HEADED=1`, `WIDTH=390`, `CPU=1`) |
| `docker compose up --build` | build + Nginx em http://localhost:8080 |

## Convenções

- pt-BR em todo texto visível; preços com `formatPrice` (Intl BRL) e `tabular-nums`.
- Nada de hex solto em componentes: use tokens (`bg-linen`, `text-taupe`...). `terracotta` e `sage` (claros) não são cor de texto: use `terracotta-deep` / `sage-deep`.
- Imagens sempre via `SmartImage` (`<picture>` AVIF + WebP + `?v=__MEDIA_VERSION__`). Nova mídia vai em `public/media/` com os dois formatos.
- Linha da sacola = `slug + size + color`. Mudanças na sacola passam pelo reducer em `src/lib/shop.tsx` (testado).
- Mensagens de WhatsApp só em `src/lib/whatsapp.ts`, sem emoji ou outro caractere fora do plano básico do Unicode (chegam como `�` após o `wa.me`; há teste para isso).
- Estado da loja em contextos separados (`useShopActions`, `useBag`, `useShopUI`, `useCatalogFilter`): componentes da vitrine usam só as ações, para que abrir painéis não re-renderize a página.
- Painéis deslizantes animam `transform` em string (WAAPI/compositor), não `x`/`y`; nada de `layout` do Motion em listas que montam junto com o painel.
- GSAP e Motion não convivem no mesmo componente. `prefers-reduced-motion` precisa de versão estática completa; `?movimento=1` força animação.

## Desempenho

- Nada de rolagem suave por JS (Lenis e afins): amarrava cada quadro ao thread principal (~50% de quadros ruins com CPU 4x).
- Nada de `backdrop-filter` em elementos fixos ou repetidos.
- Animações só com `opacity`, `transform` em string e capas que encolhem; `clip-path` animado em foto repinta a cada quadro.
- Revelações ao rolar via `RevealGroup`/`RevealItem`/`MaskTitle`, com gatilho por posição (`at`), nunca por fração visível do bloco.
- Fotos com `sizes` correto: o `SmartImage` escolhe entre a versão de 640 px (`scripts/make_small_variants.sh`) e a cheia.
- Imagens para canvas: `img.decode()` antes de desenhar e criação em lotes ociosos.

## Validação

UI: estruturar no Figma antes do código quando houver assento de edição (ver `FIGMA_GUIDE.md`); conferir com Playwright em 360–1920 px, teclado/foco, reduced motion, 0 erros de console, 0 imagens quebradas, 0 overflow horizontal. Lógica: `npm test`. Antes de concluir: `npm run build`.

## Segurança e publicação

- `site.isDemo: true` mantém avisos de conteúdo fictício. Antes de publicar: trocar contatos, depoimentos, nomes e preencher dados do fornecedor (CNPJ, endereço) que ficam como `pendente` no rodapé. Ver `LEGAL_CHECKLIST.md` (minuta, revisar com advogado).
- Nenhum rastreador/analytics instalado; fontes são self-hosted. Adicionar analytics exige rever cookies/consentimento.
- Deploy e publicação exigem pedido explícito. Push na `main` publica a imagem e o Keel atualiza o site em até ~1 min: trate push como deploy.

## Documentação

`DESIGN.md` (sistema visual), `IMPLEMENTATION_PLAN.md` (arquitetura e pendências), `FIGMA_GUIDE.md` (espelho Figma), `MEDIA_README.md` + `MEDIA_MANIFEST.json` (origem da mídia), `LEGAL_CHECKLIST.md`.

# IMPLEMENTATION_PLAN.md · Aura Atelier

## Arquitetura

SPA estática (Vite). Estado global da loja em um `ShopProvider` (React context + `useReducer`) persistido em `localStorage` (`aura-atelier:sacola`). Sem backend: a sacola gera uma mensagem estruturada e abre `https://wa.me/<dígitos>?text=...`.

```
App
├─ ShopProvider · MotionConfig(reducedMotion="user")
├─ SkipLink · Navbar (Topbar + links + botão Sacola com contador)
├─ main
│  ├─ Hero               split editorial + moldura arqueada (vídeo) + selo giratório
│  ├─ BenefitStrip       4 garantias (ícones duotone)
│  ├─ Categories         cards de categoria → filtram e rolam até a vitrine
│  ├─ ProductGrid        chips categoria (layoutId) + tamanho + busca + ordenação → ProductCard×12
│  ├─ ShopTheLook        lookbook com 3 hotspots + seleção de tamanho + combo 10% OFF
│  ├─ AtelierCraft       canvas 120 quadros com GSAP (pin+scrub) | comparador Antes↔Depois
│  ├─ CustomStylingSection  briefing de styling/ajuste → prévia → WhatsApp
│  ├─ AboutBrand         retrato + manifesto + tabela de tiragem
│  ├─ Testimonials       depoimentos com altura + tamanho comprado
│  ├─ FAQ                acordeão WAI-ARIA
│  └─ FinalCTA           CTA + newsletter (simulada, consentimento desmarcado)
├─ Footer                links, LGPD, aviso demo, dados do fornecedor pendentes, /styleguide.html
├─ ProductDetail (Sheet center) · BagDrawer (Sheet right) · BagToast · WhatsAppButton
```

## Dados e contratos

- `Product`: `id, sku, name, slug, category, alsoIn, price, compareAtPrice?, installments, image, gallery, colors, sizes[{size,inStock,lastUnits?}], measurements{size→{busto,cintura,quadril,comprimento}}, modelNote, fabric, care, availability, badge?, description`.
- `BagLine`: `{ slug, size, color, quantity }`; chave `slug|size|color`. Combo do look: linhas comuns + `lookId` opcional; o desconto de 10% vale enquanto as 3 peças do look estiverem na sacola.
- `PaymentPreference`: `pix | cartao | combinar`. Pix aplica 5% sobre o total após combo.
- Frete grátis: `site.shipping.freeShippingFrom` (R$ 399) sobre o subtotal com descontos de combo.
- Totais calculados por função pura `computeTotals(lines, prefs)` (testada) usada pela sacola e pela mensagem.

## Ordem de implementação

1. Scaffold, tokens (`tokens.css`), fontes, `SmartImage` com `MEDIA_VERSION`.
2. Dados (`products.ts`, `categories.ts`, `content.ts`), `site.ts`.
3. Lib: `format`, `catalog` (filtros), `shop` (reducer + totais), `whatsapp` (mensagens).
4. Primitivos UI: Button, Badge, Sheet, SizeSelector, ColorSwatches, Price, Accordion.
5. Navbar → Hero → Benefit → Categories → ProductGrid/Card → ProductDetail → BagDrawer/Toast.
6. ShopTheLook → AtelierCraft (pôster estático primeiro, depois GSAP) → CustomStyling → About → Testimonials → FAQ → FinalCTA → Footer.
7. `/styleguide.html`, testes Vitest, E2E Playwright, screenshots, Docker.

## Responsividade

Mobile-first; grid 2/3/4 colunas; quick-add visível por botão em telas sem hover; ShopTheLook vira lista sob a imagem no mobile; AtelierCraft fixa a cena só ≥ 768px com movimento permitido (no celular, scrub sem pin com altura reduzida).

## Fallback do elemento-assinatura

Pôster = último quadro (peça pronta) renderizado em `<picture>` imediatamente. Quadros carregam só quando a seção está próxima (`start: top 250%`, `once`), com desenho do quadro carregado mais próximo. Reduced motion: comparador Antes↔Depois (input range acessível) + etapas em lista. Erro de carregamento: permanece o pôster.

## Performance

AVIF primeiro (≈35 KB por produto), WebP fallback, `loading="lazy"` exceto hero; dimensões declaradas (sem CLS); vídeo `preload="metadata"`, `muted playsInline`, pausado fora da viewport e em reduced motion; quadros com `devicePixelRatio ≤ 2`; GSAP em chunk separado via `React.lazy` da cena; quadros decodificados com `img.decode()` em lotes ociosos a partir de 1,6 tela de distância; versões de 640 px das fotos via `srcset`/`sizes`; rolagem nativa (Lenis removido após medição).

## Checklist de testes

- Vitest: reducer (`add` por slug+size+color, incremento, `setQty`, `remove`, `clear`), `computeTotals` (frete, Pix, combo), `bagMessage` (nome, SKU, tamanho, cor, qtd, subtotal, frete, link wa.me), filtros (categoria/alsoIn, tamanho em estoque, busca, ordenação), componentes (quick-add, sacola).
- Playwright: fluxo completo (filtro → tamanho → detalhe → guia → cor/tamanho → 2 peças → sacola → quantidade → href), console, imagens, overflow em 360/375/390/768/1024/1280/1440/1920, reduced motion nos dois valores, teclado em diálogos.

## Pendências explícitas

- Figma: conta com assento *View* → espelho via `FIGMA_GUIDE.md` + `design/tokens.json` + `/styleguide.html`.
- Produtos 9–12 usam recortes das mesmas sessões de foto (não há fotos dedicadas). Produzir fotos próprias antes de publicar.
- Dados da empresa (razão social, CNPJ, endereço) pendentes; páginas legais são minutas.
- Newsletter é simulada localmente (sem backend).
- Frete: estimativa local por faixa de CEP → UF → região (`src/data/shipping.ts`, valores fictícios), Econômico grátis a partir de R$ 399 e Expresso pago. O CEP não sai do navegador. Cotação real (Correios/Melhor Envio/transportadora) exige back-end com token: trocar `quoteShipping` por uma chamada a ele.

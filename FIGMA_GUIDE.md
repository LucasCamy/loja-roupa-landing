# FIGMA_GUIDE.md · Aura Atelier

## Situação

O Figma MCP estava conectado nesta sessão, mas a conta (`A equipe de Lucas Camy`, plano starter) tem assento **View**, que não permite criar nem editar arquivos. Conforme autorizado no briefing, a estrutura de design foi documentada aqui, em `design/tokens.json` e no `/styleguide.html`, e o código seguiu a partir dela. Nenhum arquivo ou node Figma foi criado; não há links a registrar.

## Como levar para o Figma (quando houver assento de edição)

1. Criar o arquivo **Aura Atelier · Boutique** com as páginas: `00 Cover`, `01 Foundations`, `02 Components`, `03 Landing · Desktop 1440`, `04 Landing · Mobile 390`, `05 Flows (Sacola → WhatsApp)`.
2. **Variáveis**: importar `design/tokens.json` (plugin *Tokens Studio* ou *Variables Import*) em coleções `Color`, `Radius`, `Motion`, `Type`. Nomes iguais aos tokens CSS (`color/terracotta-deep`).
3. **Estilos de texto**: Display XL/H2/H3 (Cormorant Garamond 500, itálico 500 para ênfase), Body/Small/Micro (Plus Jakarta Sans), SKU (JetBrains Mono 500).
4. **Componentes** (com variantes): `Button` (variant × size × state), `Badge` (4 tons), `SizeChip` (default/selected/últimas/esgotado), `ColorSwatch`, `ProductCard` (default/hover/quick-add aberto/esgotado/sob medida), `BagLine`, `BagDrawer` (vazia/com itens/frete grátis), `ProductDetail`, `Accordion`.
5. **Captura**: com `npm run dev`, importar `http://localhost:5190/styleguide.html` e `http://localhost:5190/` com o *html.to.design* ou com `generate_figma_design` do Figma MCP. As capturas servem de referência de layout; reconstruir com os componentes do passo 4.
6. Registrar o link do arquivo e os node-ids de cada frame neste documento.

## Mapeamento código ↔ Figma

| Figma | Código |
|---|---|
| Color/* | `src/styles/tokens.css` · `design/tokens.json` |
| Button | `src/components/ui/Button.tsx` · `buttonStyles.ts` |
| SizeChip | `src/components/ui/SizeSelector.tsx` |
| ColorSwatch | `src/components/ui/ColorSwatches.tsx` |
| ProductCard | `src/components/sections/ProductCard.tsx` |
| ProductDetail | `src/components/sections/ProductDetail.tsx` |
| BagDrawer / BagToast | `src/components/sections/BagDrawer.tsx` |
| Seções 1–12 | `src/components/sections/*.tsx` |

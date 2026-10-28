# LEGAL_CHECKLIST.md · revisão antes de publicar (minuta)

> Não é parecer jurídico. Organiza evidências e pendências para revisão por advogado. Público-alvo: Brasil.

## Inventário

| Item | Situação no site | Onde |
|---|---|---|
| Dados pessoais | Nome e CEP opcionais na sacola; nome, ocasião, tamanho, tons, data e observações na consultoria; e-mail na newsletter. Nenhum é enviado a servidor: sacola e preferências ficam no `localStorage`; os textos vão na mensagem que a cliente envia pelo WhatsApp. Newsletter é **simulada** (nada é enviado). | `BagDrawer.tsx`, `CustomStylingSection.tsx`, `FinalCTA.tsx`, `lib/shop.tsx` |
| Rastreadores / cookies | Nenhum analytics, pixel ou cookie. Só `localStorage` estritamente funcional (`aura-atelier:sacola`, `aura-atelier:preferencias`). | `lib/shop.tsx` |
| Conteúdo de terceiros | Nenhum embed ou CDN. Fontes self-hosted (Fontsource). Vídeo local. Links externos: `wa.me`, Instagram. | `main.tsx`, `Hero.tsx` |
| Imagens de pessoas | Modelos e diretora criativa **fictícias**, geradas por IA (ver `MEDIA_MANIFEST.json`). Sem crianças. | `public/media/` |
| Licenças | Cormorant Garamond, Plus Jakarta Sans, JetBrains Mono: SIL OFL 1.1. Phosphor Icons: MIT. GSAP: licença “no-charge” da Webflow (conferir termos atuais). Lenis, Motion, React: MIT. | `package.json` |
| Afirmações | Depoimentos, tiragens, números e personagem são fictícios e sinalizados na página. | `data/content.ts`, `Testimonials.tsx`, `AboutBrand.tsx` |
| Identificação do fornecedor | Razão social, CNPJ e endereço **pendentes** (visíveis como `[...: pendente]` no rodapé). | `config/site.ts`, `Footer.tsx` |
| Frete | Estimativa calculada no navegador a partir do CEP (nenhum serviço externo). Valores e prazos **fictícios**, apresentados como estimativa confirmada na separação. | `data/shipping.ts`, `BagDrawer.tsx` |
| Venda | Venda concluída fora do site (WhatsApp + Pix/link de cartão). Troca: 1ª grátis em 30 dias; arrependimento 7 dias (CDC art. 49). | `FAQ`, `Footer`, `ProductDetail` |

## Feito

- Consentimento da newsletter com caixa **desmarcada**, texto específico e link para privacidade.
- Aviso curto de privacidade junto ao envio da consultoria, sem exigir aceite (base provável: procedimentos a pedido da titular; confirmar).
- Resumo de privacidade e trocas no rodapé (`#privacidade`), aviso de demonstração (`site.isDemo`).
- Sem rastreadores, portanto sem banner de cookies (confirmar com o guia de cookies da ANPD).
- Fontes e mídia self-hosted; CSP restritiva no Nginx.

## Pendente (bloqueia publicação)

- Dados reais do fornecedor (Decreto 7.962/2013): razão social, CNPJ/CPF, endereço físico e eletrônico, telefone.
- WhatsApp, e-mail, Instagram e cidade reais.
- Substituir depoimentos, fotos geradas por IA (ou declarar o uso), preços, estoques e números de tiragem por dados verificáveis.
- Tabela de frete real (valores, prazos, transportadora) ou integração de cotação.
- Fotos próprias para AU-109 a AU-112 (hoje recortes das mesmas sessões).
- Backend real da newsletter com descadastro em toda mensagem, se ela for mantida.

## Revisar com advogado

- Política de privacidade completa (página própria): finalidades, bases legais, retenção, direitos da titular, encarregado. O resumo no rodapé é minuta.
- Política de trocas, devoluções e arrependimento (página própria) e prazos de reembolso.
- Base legal da consultoria (dados enviados via WhatsApp de terceiro) e da newsletter.
- Necessidade de banner caso analytics/pixels sejam adicionados.
- Regras de publicidade de preço “de/por” e descontos (Pix, combo).
- Uso de imagens geradas por IA de pessoas fictícias em publicidade.

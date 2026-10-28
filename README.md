# Aura Atelier · Landing-boutique de moda feminina

Loja-boutique demonstrativa (linho e fibras naturais) com o fluxo **Catálogo → Sacola → WhatsApp**: 12 peças com cor, tamanho PP–GG e guia de medidas, quick-add no card, modal de produto, “Compre o Look” com combo 10% OFF, sacola lateral persistida e pedido estruturado enviado por `wa.me`. Conteúdo fictício (`site.isDemo: true`).

## Executar

```bash
npm install
npm run dev          # http://localhost:5190  (styleguide em /styleguide.html)
npm test             # Vitest
npm run build && npm run preview   # http://localhost:4190
npm run e2e          # Playwright (Edge/Chrome instalado) contra o preview
npm run shots        # screenshots + overflow/imagens/console em 360–1920
docker compose up --build          # http://localhost:8080 (PORT=xxxx para mudar)
```

## Deploy (Cloudlane Homelab)

Push na `main` → GitHub Actions (lint, typecheck, testes, build) → `ghcr.io/lucascamy/loja-roupa-landing:latest` → Keel atualiza o Deployment no k3s em até 1 minuto. Manifests em `k8s/deploy.yaml` (namespace `landingpages`, Service LoadBalancer na porta 8215). Público em `https://moda.cloudlane.com.br` pelo Cloudlane Tunnel.

`?movimento=1` força as animações mesmo com “reduzir movimento” ligado.

## Antes de publicar

1. Edite `src/config/site.ts`: nome, WhatsApp, e-mail, Instagram, frete grátis, dados do fornecedor (CNPJ, razão social, endereço) e `isDemo: false`.
2. Troque produtos, preços, depoimentos e fotos fictícias (`src/data/`, `public/media/`).
3. Revise `LEGAL_CHECKLIST.md` com um advogado.

Documentação: `AGENTS.md`, `DESIGN.md`, `IMPLEMENTATION_PLAN.md`, `FIGMA_GUIDE.md`, `MEDIA_README.md`.

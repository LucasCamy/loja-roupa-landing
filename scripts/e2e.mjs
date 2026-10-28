// E2E do fluxo de compra + cena de scroll, com screenshots dos estados.
// Uso: npm run preview (outra aba) e depois: node scripts/e2e.mjs [url]
import { chromium } from 'playwright-core'
import { mkdirSync } from 'node:fs'
import assert from 'node:assert/strict'

const url = process.argv[2] ?? process.env.BASE_URL ?? 'http://localhost:4190/'
const out = process.env.SHOT_DIR ?? 'screenshots'
mkdirSync(out, { recursive: true })
const browser = await chromium.launch({ channel: process.env.BROWSER_CHANNEL ?? 'msedge' })
const results = []
const step = (name) => results.push(name)

function watch(page, errors) {
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
  page.on('pageerror', (e) => errors.push(String(e)))
}

// ---------- 1. Fluxo completo no desktop (movimento reduzido para estabilidade) ----------
{
  const errors = []
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' })
  watch(page, errors)
  await page.goto(url, { waitUntil: 'networkidle' })
  await page.evaluate(() => localStorage.clear())
  await page.reload({ waitUntil: 'networkidle' })

  const vitrine = page.locator('#colecao')
  await vitrine.getByRole('button', { name: 'Vestidos & Macacões' }).click()
  await assert.doesNotReject(vitrine.getByTestId('result-count').filter({ hasText: /^2 peças/ }).waitFor())
  step('filtro de categoria: Vestidos → 2 peças')
  await vitrine.getByRole('button', { name: 'M', exact: true }).click()
  await vitrine.getByTestId('result-count').filter({ hasText: /^2 peças/ }).waitFor()
  await page.waitForTimeout(300)
  assert.equal(await vitrine.getByTestId('product-card').count(), 2)
  step('filtro de tamanho: M → 2 peças')

  await vitrine.getByRole('button', { name: 'Vestido Midi Brisa em Linho', exact: true }).click()
  const detail = page.getByRole('dialog', { name: 'Vestido Midi Brisa em Linho' })
  await detail.waitFor()
  await detail.getByRole('button', { name: /Guia de Medidas/ }).click()
  await detail.locator('#guia-medidas table').waitFor()
  assert.match(await detail.locator('#guia-medidas').innerText(), /Busto[\s\S]*A modelo mede 1,72 m/i)
  step('detalhe aberto + guia de medidas visível')
  await detail.getByRole('radio', { name: 'Areia' }).click()
  await detail.getByRole('radio', { name: 'M', exact: true }).click()
  await page.waitForTimeout(400)
  await page.screenshot({ path: `${out}/e2e-detalhe-guia.png` })
  await detail.getByRole('button', { name: 'Adicionar à Sacola' }).click()
  const bag = page.getByRole('dialog', { name: /Sua sacola/ })
  await bag.waitFor()
  step('peça 1 adicionada (Vestido, M, Areia) e sacola aberta')
  await page.keyboard.press('Escape')
  await bag.waitFor({ state: 'detached' })

  await vitrine.getByRole('button', { name: 'Todas as peças' }).click()
  await vitrine.getByRole('button', { name: 'Todos', exact: true }).click()
  await vitrine.getByRole('button', { name: 'Blazer Oversized Atelier', exact: true }).click()
  const detail2 = page.getByRole('dialog', { name: 'Blazer Oversized Atelier' })
  await detail2.waitFor()
  assert.equal(await detail2.getByRole('radio', { name: 'PP, esgotado' }).isDisabled(), true)
  await detail2.getByRole('radio', { name: 'P', exact: true }).click()
  await detail2.getByRole('button', { name: 'Adicionar à Sacola' }).click()
  await bag.waitFor()
  assert.equal(await bag.getByTestId('bag-line').count(), 2)
  step('peça 2 adicionada (Blazer, P, Areia): 2 linhas na sacola')

  await bag.getByTestId('bag-line').first().getByRole('button', { name: 'Aumentar' }).click()
  assert.equal(await bag.getByTestId('line-qty').first().innerText(), '2')
  await page.getByRole('button', { name: 'Abrir sacola, 3 itens' }).waitFor({ state: 'attached' })
  step('quantidade alterada: vestido 2x, contador da navbar = 3')

  await bag.getByLabel('Seu nome (opcional)').fill('Maria')
  const cep = bag.getByTestId('cep-input')
  await cep.pressSequentially('79000000')
  assert.equal(await cep.inputValue(), '79000-000')
  const options = bag.getByTestId('shipping-options')
  await options.waitFor()
  assert.match(await options.innerText(), /Entrega para MS[\s\S]*Econômico[\s\S]*Grátis[\s\S]*Expresso[\s\S]*R\$ 24,90/)
  step('CEP com máscara → cotação para MS (Econômico grátis, Expresso R$ 24,90)')
  await options.getByText('Expresso').click()
  assert.equal(await bag.getByTestId('bag-total').innerText(), 'R$ 1.200,05')
  step('Expresso escolhido: total com frete R$ 1.200,05')

  const href = await bag.getByTestId('checkout-whatsapp').getAttribute('href')
  const u = new URL(href)
  const text = u.searchParams.get('text')
  assert.equal(u.origin + u.pathname, 'https://wa.me/5567900000000')
  for (const piece of [
    '*ITENS DA SACOLA:*',
    '• 2x Vestido Midi Brisa em Linho (Ref. AU-101)\n  Tam: M | Cor: Areia — R$ 778,00',
    '• 1x Blazer Oversized Atelier (Ref. AU-102)\n  Tam: P | Cor: Areia — R$ 459,00',
    'Subtotal: R$ 1.237,00',
    'Pagamento preferido: Pix com 5% OFF (R$ 1.175,15)',
    'Frete: R$ 24,90 · Expresso para MS, 1 a 2 dias úteis (estimativa)',
    'Total estimado com frete: R$ 1.200,05',
    'Cliente: Maria | CEP: 79000-000',
  ])
    assert.ok(text.includes(piece), `mensagem sem: ${piece}\n---\n${text}`)
  assert.ok(!/[\uD800-\uDFFF]/.test(text), 'mensagem com caractere fora do plano básico (vira �)')
  step('href do WhatsApp verificado (itens, SKU, tamanho, cor, qtd, subtotal, Pix, frete, total, cliente, sem emoji)')
  await page.waitForTimeout(500)
  await page.screenshot({ path: `${out}/e2e-sacola.png` })

  // Teclado: Esc fecha e devolve o foco
  await page.keyboard.press('Escape')
  await bag.waitFor({ state: 'detached' })
  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('aura-atelier:sacola')))
  assert.equal(stored.length, 2)
  step('Esc fecha a sacola; sacola persistida em localStorage')

  const broken = await page.evaluate(() => [...document.images].filter((i) => i.complete && i.naturalWidth === 0).length)
  assert.equal(broken, 0)
  assert.deepEqual(errors, [])
  step('desktop: 0 erros de console, 0 imagens quebradas')
  await page.close()
}

// ---------- 2. Quick-add no celular + toast ----------
{
  const errors = []
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce', hasTouch: true, isMobile: true })
  const page = await ctx.newPage()
  watch(page, errors)
  await page.goto(url + '#colecao', { waitUntil: 'networkidle' })
  const card = page.locator('[data-slug="saia-midi-madreperola"]')
  await card.scrollIntoViewIfNeeded()
  await card.getByRole('button', { name: /Adicionar Saia Midi/ }).click()
  await card.getByTestId('quick-add').getByRole('radio', { name: 'G', exact: true }).click()
  const toast = page.getByTestId('bag-toast')
  await toast.waitFor()
  assert.match(await toast.innerText(), /Saia Midi Evasê Madrepérola \(Tam\. G · Off-white\) adicionado à sacola/)
  await page.screenshot({ path: `${out}/e2e-mobile-toast.png` })
  await toast.getByRole('button', { name: 'Abrir sacola' }).click()
  await page.getByRole('dialog', { name: /Sua sacola/ }).waitFor()
  await page.waitForTimeout(500)
  await page.screenshot({ path: `${out}/e2e-mobile-sacola.png` })
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
  assert.ok(overflow <= 0, `overflow horizontal de ${overflow}px`)
  assert.deepEqual(errors, [])
  step('celular 390: quick-add por tamanho + toast + abrir sacola, sem overflow nem erros')
  await ctx.close()
}

// ---------- 3. Cena de scroll com movimento permitido (desktop e celular) ----------
for (const vp of [
  { width: 1440, height: 900, name: 'desktop' },
  { width: 390, height: 844, name: 'celular' },
]) {
  const errors = []
  const page = await browser.newPage({ viewport: vp, reducedMotion: 'no-preference' })
  watch(page, errors)
  await page.goto(url, { waitUntil: 'networkidle' })
  const canvas = page.getByTestId('craft-canvas')
  await canvas.waitFor({ state: 'attached' })
  const top = await page.evaluate(() => {
    const el = document.getElementById('linho')
    return el.getBoundingClientRect().top + window.scrollY
  })
  // rola em etapas até o meio da cena para carregar e desenhar quadros
  for (let y = top - 1200; y <= top + (vp.name === 'desktop' ? 1100 : 300); y += 150) {
    await page.mouse.wheel(0, 0)
    await page.evaluate((yy) => window.scrollTo({ top: yy, behavior: 'instant' }), y)
    await page.waitForTimeout(60)
  }
  await page.waitForTimeout(1600)
  const painted = await canvas.evaluate((c) => {
    const ctx = c.getContext('2d')
    const d = ctx.getImageData(Math.floor(c.width / 2), Math.floor(c.height / 2), 4, 4).data
    return d[3] > 0
  })
  assert.ok(painted, 'canvas sem quadro desenhado')
  await page.screenshot({ path: `${out}/e2e-cena-${vp.name}.png` })
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
  assert.ok(overflow <= 0, `overflow horizontal de ${overflow}px`)
  assert.deepEqual(errors, [])
  step(`cena de scroll (${vp.name}, movimento permitido): canvas desenhado, sem overflow nem erros`)
  await page.close()
}

await browser.close()
console.log(results.map((r) => `✔ ${r}`).join('\n'))

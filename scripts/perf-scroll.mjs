// Mede a fluidez da rolagem da página inteira, seção por seção.
// Rola com a roda do mouse, com CPU mais lenta (padrão 4x),
// e registra quadros longos + Long Animation Frames com atribuição de script.
// Uso: node scripts/perf-scroll.mjs [url]   (CPU=1 para sem throttle, REDUCED=1 para movimento reduzido)
import { chromium } from 'playwright-core'

const url = process.argv[2] ?? process.env.BASE_URL ?? 'http://localhost:4190/'
const rate = Number(process.env.CPU ?? 4)
const width = Number(process.env.WIDTH ?? 1440)
const browser = await chromium.launch({ channel: process.env.BROWSER_CHANNEL ?? 'msedge', headless: process.env.HEADED !== '1' })
const page = await browser.newPage({
  viewport: { width, height: width < 768 ? 844 : 900 },
  reducedMotion: process.env.REDUCED === '1' ? 'reduce' : 'no-preference',
})
const cdp = await page.context().newCDPSession(page)
await page.goto(url, { waitUntil: 'networkidle' })
await page.waitForTimeout(1500)

await page.evaluate(() => {
  const sectionAt = () => {
    const y = window.innerHeight / 2
    for (const el of document.querySelectorAll('main > section, footer')) {
      const r = el.getBoundingClientRect()
      if (r.top <= y && r.bottom >= y) return el.id || el.getAttribute('aria-labelledby') || el.tagName.toLowerCase()
    }
    return 'outro'
  }
  window.__perf = { frames: [], loaf: [] }
  let last = performance.now()
  const loop = (t) => {
    window.__perf.frames.push({ d: t - last, s: sectionAt() })
    last = t
    if (!window.__perf.stop) requestAnimationFrame(loop)
  }
  requestAnimationFrame(loop)
  new PerformanceObserver((l) => {
    for (const e of l.getEntries())
      window.__perf.loaf.push({
        s: sectionAt(),
        dur: e.duration,
        render: e.startTime + e.duration - (e.renderStart || e.startTime + e.duration),
        layout: e.startTime + e.duration - (e.styleAndLayoutStart || e.startTime + e.duration),
        scripts: e.scripts.map((x) => ({ d: Math.round(x.duration), inv: x.invoker, fn: x.sourceFunctionName, src: (x.sourceURL || '').split('/').pop() })),
      })
  }).observe({ type: 'long-animation-frame' })
})

await cdp.send('Emulation.setCPUThrottlingRate', { rate })
await page.mouse.move(width / 2, 400)
for (let i = 0; i < 400; i++) {
  await page.mouse.wheel(0, Number(process.env.STEP ?? 120))
  await page.waitForTimeout(40)
  if (i % 20 === 0) {
    const done = await page.evaluate(() => window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 4)
    if (done) break
  }
}
await page.waitForTimeout(1500)
await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 })
const { frames, loaf } = await page.evaluate(() => ((window.__perf.stop = true), window.__perf))
await browser.close()

const bySection = new Map()
for (const f of frames.slice(1)) {
  const s = bySection.get(f.s) ?? { frames: 0, long: 0, worst: 0, sumLong: 0 }
  s.frames++
  if (f.d > 50) {
    s.long++
    s.sumLong += f.d
  }
  s.worst = Math.max(s.worst, f.d)
  bySection.set(f.s, s)
}
console.log(`CPU ${rate}x · ${width}px · ${process.env.REDUCED === '1' ? 'movimento reduzido' : 'movimento permitido'}`)
console.log('seção'.padEnd(18), 'quadros  >50ms  pior(ms)  ms perdidos')
for (const [s, v] of bySection)
  console.log(s.padEnd(18), String(v.frames).padStart(7), String(v.long).padStart(6), String(Math.round(v.worst)).padStart(9), String(Math.round(v.sumLong)).padStart(12))

// Atribuição: soma por origem de script e quanto foi render/layout puro
const attrib = new Map()
let renderOnly = 0
for (const e of loaf) {
  if (!e.scripts.length) renderOnly += e.dur
  for (const x of e.scripts) {
    const k = `${x.inv} → ${x.fn || '(anon)'} @ ${x.src}`
    attrib.set(k, (attrib.get(k) ?? 0) + x.d)
  }
}
console.log(`\nLong Animation Frames: ${loaf.length} · só render/pintura: ${Math.round(renderOnly)} ms`)
for (const [k, v] of [...attrib].sort((a, b) => b[1] - a[1]).slice(0, 12)) console.log(String(v).padStart(6), 'ms ', k)
const perSec = new Map()
for (const e of loaf) perSec.set(e.s, (perSec.get(e.s) ?? 0) + e.dur)
console.log('\nLoAF por seção (ms):', JSON.stringify(Object.fromEntries([...perSec].map(([k, v]) => [k, Math.round(v)]))))

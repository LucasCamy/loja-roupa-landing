// Conta quadros descartados pelo pipeline do navegador (inclui GPU/compositor,
// que o requestAnimationFrame não enxerga), agrupados por seção visível.
// Uso: node scripts/perf-frames.mjs [url]   (CPU, WIDTH, STEP, REDUCED, HEADED como em perf-scroll.mjs)
import { chromium } from 'playwright-core'
import { readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const url = process.argv[2] ?? process.env.BASE_URL ?? 'http://localhost:4190/'
const rate = Number(process.env.CPU ?? 4)
const width = Number(process.env.WIDTH ?? 1440)
const tracePath = join(tmpdir(), `aura-trace-${Date.now()}.json`)
const browser = await chromium.launch({ channel: process.env.BROWSER_CHANNEL ?? 'msedge', headless: process.env.HEADED !== '1' })
const page = await browser.newPage({
  viewport: { width, height: width < 768 ? 844 : 900 },
  reducedMotion: process.env.REDUCED === '1' ? 'reduce' : 'no-preference',
})
const cdp = await page.context().newCDPSession(page)
await page.goto(url, { waitUntil: 'networkidle' })
if (process.env.INJECT_CSS) await page.addStyleTag({ content: process.env.INJECT_CSS })
await page.waitForTimeout(1500)
// Marca no trace a seção visível sempre que ela muda
await page.evaluate(() => {
  let current = ''
  const tick = () => {
    const y = window.innerHeight / 2
    for (const el of document.querySelectorAll('main > section, footer')) {
      const r = el.getBoundingClientRect()
      if (r.top <= y && r.bottom >= y) {
        const name = el.id || el.getAttribute('aria-labelledby') || el.tagName.toLowerCase()
        if (name !== current) performance.mark('sec:' + (current = name))
        break
      }
    }
    requestAnimationFrame(tick)
  }
  tick()
})
await browser.startTracing(page, { path: tracePath, categories: ['blink.user_timing', 'benchmark', 'cc', 'gpu', 'viz', 'disabled-by-default-devtools.timeline.frame', 'devtools.timeline'] })
await cdp.send('Emulation.setCPUThrottlingRate', { rate })
await page.mouse.move(width / 2, 400)
for (let i = 0; i < 400; i++) {
  await page.mouse.wheel(0, Number(process.env.STEP ?? 120))
  await page.waitForTimeout(40)
  if (i % 20 === 0 && (await page.evaluate(() => window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 4))) break
}
await page.waitForTimeout(1200)
await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 })
await browser.stopTracing()
await browser.close()

const { traceEvents } = JSON.parse(readFileSync(tracePath, 'utf8'))
const marks = traceEvents.filter((e) => e.name?.startsWith('sec:')).map((e) => ({ ts: e.ts, s: e.name.slice(4) })).sort((a, b) => a.ts - b.ts)
const sectionAt = (ts) => {
  let s = 'antes'
  for (const m of marks) if (m.ts <= ts) s = m.s
  return s
}
const reports = traceEvents.filter((e) => e.name === 'PipelineReporter' && e.ph === 'b' && (e.args?.frame_reporter ?? e.args?.chrome_frame_reporter))
const stats = new Map()
for (const e of reports) {
  const r = e.args.frame_reporter ?? e.args.chrome_frame_reporter
  if (r.state === 'STATE_NO_UPDATE_DESIRED') continue
  const s = stats.get(sectionAt(e.ts)) ?? { total: 0, dropped: 0, partial: 0, stages: {} }
  s.total++
  if (r.state === 'STATE_DROPPED') s.dropped++
  if (r.state === 'STATE_PRESENTED_PARTIAL') s.partial++
  if (r.state !== 'STATE_PRESENTED_ALL' && r.affects_smoothness !== false) for (const st of r.high_latency_stages ?? []) s.stages[st] = (s.stages[st] ?? 0) + 1
  stats.set(sectionAt(e.ts), s)
}
console.log(`CPU ${rate}x · ${width}px · ${process.env.REDUCED === '1' ? 'reduzido' : 'movimento'} · ${reports.length} quadros no pipeline`)
console.log('seção'.padEnd(16), 'quadros  descartados  parciais  % ruim   estágios lentos')
for (const [s, v] of stats)
  console.log(
    s.padEnd(16),
    String(v.total).padStart(7),
    String(v.dropped).padStart(11),
    String(v.partial).padStart(9),
    (((v.dropped + v.partial) / v.total) * 100).toFixed(1).padStart(7) + '%',
    '  ' + JSON.stringify(v.stages),
  )
if (!reports.length) console.log('Sem eventos PipelineReporter neste navegador.')

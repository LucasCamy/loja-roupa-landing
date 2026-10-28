// Screenshots de página inteira + checagem de overflow, imagens quebradas e console em várias larguras.
// Uso: node scripts/screenshots.mjs [url] [larguras]   (REDUCED=0 para movimento permitido)
import { chromium } from 'playwright-core'
import { mkdirSync } from 'node:fs'

const url = process.argv[2] ?? process.env.BASE_URL ?? 'http://localhost:4190/'
const widths = (process.argv[3] ?? '360,375,390,768,1024,1280,1440,1920').split(',').map(Number)
const outDir = process.env.SHOT_DIR ?? 'screenshots'
const reducedMotion = process.env.REDUCED === '0' ? 'no-preference' : 'reduce'
mkdirSync(outDir, { recursive: true })

const browser = await chromium.launch({ channel: process.env.BROWSER_CHANNEL ?? 'msedge' })
const report = []
for (const width of widths) {
  const page = await browser.newPage({ viewport: { width, height: 900 }, deviceScaleFactor: 1, reducedMotion })
  const errors = []
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
  page.on('pageerror', (e) => errors.push(String(e)))
  await page.goto(url, { waitUntil: 'networkidle' })
  // Rola para disparar lazy-loading e entradas
  await page.evaluate(async () => {
    for (let y = 0; y < document.documentElement.scrollHeight; y += 450) {
      window.scrollTo({ top: y, behavior: 'instant' })
      await new Promise((r) => setTimeout(r, 140))
    }
    window.scrollTo({ top: 0, behavior: 'instant' })
  })
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(900)
  const result = await page.evaluate(() => {
    const iw = document.documentElement.clientWidth
    const bad = []
    for (const e of document.querySelectorAll('main *, footer *, header *')) {
      const r = e.getBoundingClientRect()
      if (!r.width || r.right <= iw + 1) continue
      let p = e.parentElement
      let clipped = false
      // o overflow-x: clip do <main> esconderia o problema: não conta como recorte válido
      while (p && p !== document.body && p.tagName !== 'MAIN') {
        if (/(hidden|clip|auto|scroll)/.test(getComputedStyle(p).overflowX) && p.getBoundingClientRect().right <= iw + 1) {
          clipped = true
          break
        }
        p = p.parentElement
      }
      if (!clipped) bad.push(e.tagName + ' ' + (e.textContent || '').trim().slice(0, 30))
    }
    const broken = [...new Set([...document.querySelectorAll('a[href^="#"]')].map((a) => a.getAttribute('href')))].filter(
      (h) => h.length > 1 && !document.getElementById(h.slice(1)),
    )
    const brokenImages = [...document.images].filter((i) => i.complete && i.naturalWidth === 0).map((i) => i.currentSrc || i.src)
    const h1 = document.querySelector('h1')
    const h1Lines = h1 ? Math.round(h1.getBoundingClientRect().height / parseFloat(getComputedStyle(h1).lineHeight)) : 0
    return {
      scrollOverflow: Math.max(0, document.documentElement.scrollWidth - iw),
      overflow: bad.slice(0, 8),
      brokenAnchors: broken,
      brokenImages,
      images: document.images.length,
      h1Lines,
    }
  })
  await page.screenshot({ path: `${outDir}/home-${width}.png`, fullPage: true })
  report.push({ width, ...result, errors })
  await page.close()
}
await browser.close()
console.log(JSON.stringify(report, null, 2))
const failed = report.some((r) => r.scrollOverflow > 0 || r.overflow.length || r.brokenImages.length || r.errors.length || r.brokenAnchors.length)
process.exitCode = failed ? 1 : 0

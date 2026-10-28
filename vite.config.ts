/// <reference types="vitest/config" />
import { createHash } from 'node:crypto'
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

/** Hash curto do conteúdo de public/media: muda sempre que uma mídia muda (cache busting `?v=`). */
function mediaVersion(dir = resolve(import.meta.dirname, 'public/media')) {
  const hash = createHash('sha256')
  const walk = (d: string) => {
    for (const name of readdirSync(d).sort()) {
      const path = join(d, name)
      if (statSync(path).isDirectory()) walk(path)
      else hash.update(name).update(readFileSync(path))
    }
  }
  try {
    walk(dir)
  } catch {
    return 'dev'
  }
  return hash.digest('hex').slice(0, 10)
}

export default defineConfig({
  plugins: [react(), tailwindcss()],
  define: {
    __MEDIA_VERSION__: JSON.stringify(mediaVersion()),
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        styleguide: resolve(import.meta.dirname, 'styleguide.html'),
      },
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: false,
  },
})

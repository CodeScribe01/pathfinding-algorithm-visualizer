import { copyFileSync, existsSync } from 'node:fs'
import { fileURLToPath, URL } from 'node:url'

/**
 * GitHub Pages has no server-side rewrite, so a hard refresh on a client route
 * such as /compare asks for a file that does not exist and returns 404. Pages
 * serves 404.html for any unmatched path, so shipping a copy of index.html
 * under that name lets the SPA boot and React Router resolve the URL itself.
 */
const dist = fileURLToPath(new URL('../dist/', import.meta.url))
const source = `${dist}index.html`
const target = `${dist}404.html`

if (!existsSync(source)) {
  console.error('spa-fallback: dist/index.html not found — run the build first.')
  process.exit(1)
}

copyFileSync(source, target)
console.log('spa-fallback: wrote dist/404.html for client-side routing')

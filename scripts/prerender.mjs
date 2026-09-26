/**
 * Last step of `npm run build`: bakes the rendered page into dist/index.html,
 * so the content, links and structured data are there before any JavaScript
 * runs (search engines, link previews, slow phones).
 *
 * Adds to <head>: font preloads, Bakery structured data with confirmed facts
 * only, and — once `site.url` is set — the canonical URL, og:url and an
 * absolute og:image.
 */
import { readdir, readFile, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const dist = path.join(root, 'dist')
const ssr = path.join(root, 'dist-ssr')
const base = process.env.BASE_PATH ?? '/'

const { render, site } = await import(pathToFileURL(path.join(ssr, 'entry-server.js')).href)
let html = await readFile(path.join(dist, 'index.html'), 'utf8')
const head = []

// Preload the hero's fonts so the headline doesn't swap late.
const assets = await readdir(path.join(dist, 'assets'))
for (const font of ['fraunces-latin-soft-normal', 'fraunces-latin-soft-italic', 'figtree-latin-wght-normal']) {
  const file = assets.find((f) => f.startsWith(font) && f.endsWith('.woff2'))
  if (!file) throw new Error(`Font to preload not found in dist/assets: ${font}`)
  head.push(`<link rel="preload" href="${base}assets/${file}" as="font" type="font/woff2" crossorigin />`)
}

const pageUrl = site.url ? (site.url.endsWith('/') ? site.url : `${site.url}/`) : ''
if (pageUrl) {
  head.push(`<link rel="canonical" href="${pageUrl}" />`, `<meta property="og:url" content="${pageUrl}" />`)
  html = html.replace(/(<meta property="og:image" content=")[^"]*"/, `$1${new URL('og-image.jpg', pageUrl)}"`)
}

const bakery = {
  '@context': 'https://schema.org',
  '@type': 'Bakery',
  name: site.name,
  description: site.tagline,
  address: {
    '@type': 'PostalAddress',
    streetAddress: site.address.area,
    addressLocality: site.address.city,
    postalCode: site.address.postalCode,
    addressCountry: site.address.countryCode,
  },
  sameAs: [site.links.facebook],
  // Image URLs must be absolute, so they wait for the live domain.
  ...(pageUrl && {
    url: pageUrl,
    logo: new URL('brand/logo.png', pageUrl).href,
    image: new URL('og-image.jpg', pageUrl).href,
  }),
}
head.push(`<script type="application/ld+json">${JSON.stringify(bakery).replace(/</g, '\\u003c')}</script>`)

if (!html.includes('<!--head-tags-->') || !html.includes('<!--app-html-->')) throw new Error('Placeholders missing in dist/index.html')
html = html.replace('<!--head-tags-->', head.join('\n    ')).replace('<!--app-html-->', () => render())
await writeFile(path.join(dist, 'index.html'), html)
await rm(ssr, { recursive: true, force: true })
console.log(`Prerendered dist/index.html (${Math.round(html.length / 1024)} KB)`)

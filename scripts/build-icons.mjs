/**
 * Builds the favicons and the social share image.
 *
 *   npm run icons
 *
 * - public/favicon.svg, favicon-32.png, apple-touch-icon.png: a kraft disc
 *   with the "R" from the Roll Up lettering (Rammetto One).
 * - public/og-image.jpg (1200×630): scripts/og-image.html rendered by Google
 *   Chrome. Set CHROME=/path/to/chrome if it isn't in the default Mac spot.
 */
import { execFileSync } from 'node:child_process'
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import opentype from 'opentype.js'
import sharp from 'sharp'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const r = (p) => path.join(root, p)
const KRAFT = '#d09c68'
const INK = '#2a190f'

// "R", centred in a 64×64 box, `height` units tall.
const buf = readFileSync(r('node_modules/@fontsource/rammetto-one/files/rammetto-one-latin-400-normal.woff'))
const font = opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength))
function letterR(height) {
  const probe = font.getPath('R', 0, 0, 100).getBoundingBox()
  const size = (100 * height) / (probe.y2 - probe.y1)
  const box = font.getPath('R', 0, 0, size).getBoundingBox()
  const p = font.getPath('R', 32 - (box.x1 + box.x2) / 2, 32 - (box.y1 + box.y2) / 2, size)
  // Own serialiser: opentype's toPathData can emit NaN (see build-brand.mjs).
  const n = (v) => +v.toFixed(2)
  const d = p.commands
    .map((c) =>
      c.type === 'M' || c.type === 'L'
        ? `${c.type}${n(c.x)} ${n(c.y)}`
        : c.type === 'Q'
          ? `Q${n(c.x1)} ${n(c.y1)} ${n(c.x)} ${n(c.y)}`
          : c.type === 'C'
            ? `C${n(c.x1)} ${n(c.y1)} ${n(c.x2)} ${n(c.y2)} ${n(c.x)} ${n(c.y)}`
            : 'Z',
    )
    .join('')
  if (d.includes('NaN')) throw new Error('Bad path data for "R"')
  return `<path fill="${INK}" d="${d}"/>`
}

const svg = (shape, height) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">${shape}${letterR(height)}</svg>`
const favicon = svg(`<circle cx="32" cy="32" r="32" fill="${KRAFT}"/>`, 34)
// iOS rounds the corners itself and turns transparency black, so fill the square.
const touch = svg(`<rect width="64" height="64" fill="${KRAFT}"/>`, 30)

writeFileSync(r('public/favicon.svg'), favicon)
await sharp(Buffer.from(favicon), { density: 600 }).resize(32, 32).png().toFile(r('public/favicon-32.png'))
await sharp(Buffer.from(touch), { density: 1200 }).resize(180, 180).png().toFile(r('public/apple-touch-icon.png'))

// Social share image: render the HTML template at 2× and downscale.
const chrome = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const shot = path.join(mkdtempSync(path.join(tmpdir(), 'og-')), 'og.png')
execFileSync(chrome, [
  '--headless=new',
  '--hide-scrollbars',
  '--force-device-scale-factor=2',
  '--window-size=1200,630',
  '--virtual-time-budget=5000',
  `--screenshot=${shot}`,
  pathToFileURL(r('scripts/og-image.html')).href,
], { stdio: 'ignore' })
await sharp(shot).resize(1200, 630).jpeg({ quality: 84, mozjpeg: true }).toFile(r('public/og-image.jpg'))

console.log('Wrote public/favicon.svg, favicon-32.png, apple-touch-icon.png, og-image.jpg')

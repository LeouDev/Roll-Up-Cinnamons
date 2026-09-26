/**
 * Builds the Roll Up logo assets.
 *
 *   node scripts/build-brand.mjs
 *
 * - Torn kraft-paper strips (public/brand/*.webp), textured with the real
 *   crumpled kraft paper from the original Facebook logo.
 * - "ROLL UP" / "Cinnamon" / "est.2026" lettering outlined to SVG paths
 *   (src/components/brand/logo-data.ts), so the logo needs no web fonts.
 *
 * Only needs re-running if the logo itself changes.
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import opentype from 'opentype.js'
import sharp from 'sharp'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const r = (p) => path.join(root, p)

// ---------------------------------------------------------------------------
// Deterministic noise helpers
// ---------------------------------------------------------------------------
function rng(seed) {
  let s = seed >>> 0
  return () => {
    s = (s + 0x6d2b79f5) >>> 0
    let t = s
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** 1D value noise with smooth interpolation, sampled on a closed loop. */
function loopNoise(rand, length, wavelength) {
  const n = Math.max(3, Math.round(length / wavelength))
  const knots = Array.from({ length: n }, () => rand() * 2 - 1)
  return (t) => {
    const x = ((t / length) * n) % n
    const i = Math.floor(x)
    const f = x - i
    const a = knots[(i + n) % n]
    const b = knots[(i + 1) % n]
    const s = f * f * (3 - 2 * f)
    return a + (b - a) * s
  }
}

// ---------------------------------------------------------------------------
// Torn paper strip
// ---------------------------------------------------------------------------
/**
 * Returns a closed polygon (array of [x, y]) for a torn strip. `corners` is a
 * hand-shaped base outline; edges are subdivided and pushed along their
 * normals by layered noise to get the torn look.
 */
function tornOutline(corners, seed) {
  const rand = rng(seed)
  const pts = []
  const segs = corners.map((p, i) => [p, corners[(i + 1) % corners.length]])
  const perimeter = segs.reduce((sum, [a, b]) => sum + Math.hypot(b[0] - a[0], b[1] - a[1]), 0)
  const octaves = [
    [9, 240],
    [5, 70],
    [2.6, 22],
    [1.3, 7],
    [0.6, 3],
  ].map(([amp, wl]) => [amp, loopNoise(rand, perimeter, wl)])

  let travelled = 0
  for (const [a, b] of segs) {
    const len = Math.hypot(b[0] - a[0], b[1] - a[1])
    const steps = Math.ceil(len / 2.5)
    const nx = (b[1] - a[1]) / len
    const ny = -(b[0] - a[0]) / len
    for (let s = 0; s < steps; s++) {
      const t = s / steps
      const d = octaves.reduce((sum, [amp, fn]) => sum + amp * fn(travelled + t * len), 0)
      pts.push([a[0] + (b[0] - a[0]) * t + nx * d, a[1] + (b[1] - a[1]) * t + ny * d])
    }
    travelled += len
  }
  return pts
}

async function buildStrip({ width, height, corners, seed, out, sizes }) {
  const outline = tornOutline(corners, seed)
  const poly = outline.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ')
  const maskSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><rect width="100%" height="100%" fill="#000"/><polygon points="${poly}" fill="#fff"/></svg>`

  const mask = await sharp(Buffer.from(maskSvg)).greyscale().raw().toBuffer()
  const inner = await sharp(Buffer.from(maskSvg)).greyscale().blur(22).raw().toBuffer()
  const rim = await sharp(Buffer.from(maskSvg)).greyscale().blur(1.6).raw().toBuffer()
  const shadow = await sharp(Buffer.from(maskSvg)).greyscale().blur(10).raw().toBuffer()

  // Real kraft texture: the text-free top band of the original logo, graded
  // toward the warmer, more golden paper of the refreshed logo.
  const texture = await sharp(r('assets/brand/logo-kraft-square.jpg'))
    .extract({ left: 0, top: 0, width: 720, height: 240 })
    .resize({ width, height, fit: 'cover', kernel: 'lanczos3' })
    .removeAlpha()
    .raw()
    .toBuffer()

  const rand = rng(seed * 7 + 3)
  const px = Buffer.alloc(width * height * 4)
  const shadowOffset = Math.round(height * 0.02)
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = y * width + x
      const m = mask[i] / 255
      const o = i * 4
      if (m <= 0.002) {
        // Soft shadow under the paper.
        const sy = y - shadowOffset
        const sv = sy >= 0 ? shadow[sy * width + x] / 255 : 0
        px[o] = 58
        px[o + 1] = 32
        px[o + 2] = 18
        px[o + 3] = Math.round(sv * 60)
        continue
      }
      let R = texture[i * 3]
      let G = texture[i * 3 + 1]
      let B = texture[i * 3 + 2]
      // Grade: salmon kraft (#c08c6f) → golden kraft (~#d7a06c).
      R = R * 1.12 + 2
      G = G * 1.12 + 1
      B = B * 0.94 + 2
      // Crease contrast around the paper's mid tone.
      const lum = 0.3 * R + 0.59 * G + 0.11 * B
      const k = 1.18
      R = lum + (R - lum) * 1.05 + (lum - 160) * (k - 1)
      G = lum + (G - lum) * 1.05 + (lum - 160) * (k - 1)
      B = lum + (B - lum) * 1.05 + (lum - 160) * (k - 1)
      // Toasted edges: darker and warmer toward the tear.
      const edge = 1 - inner[i] / 255
      const toast = Math.min(1, edge * 1.7) ** 1.6
      R = R * (1 - 0.2 * toast)
      G = G * (1 - 0.3 * toast)
      B = B * (1 - 0.42 * toast)
      // Fine paper grain.
      const g = (rand() - 0.5) * 14
      R += g
      G += g * 0.9
      B += g * 0.8
      // Lighter torn fibres right at the edge.
      const fibre = Math.max(0, Math.min(1, (1 - rim[i] / 255) * 2.2)) * (0.55 + rand() * 0.45)
      R = R + (246 - R) * fibre * 0.5
      G = G + (222 - G) * fibre * 0.5
      B = B + (188 - B) * fibre * 0.5
      px[o] = Math.max(0, Math.min(255, R))
      px[o + 1] = Math.max(0, Math.min(255, G))
      px[o + 2] = Math.max(0, Math.min(255, B))
      px[o + 3] = Math.round(255 * m)
    }
  }

  const img = sharp(px, { raw: { width, height, channels: 4 } })
  const png = await img.png().toBuffer()
  const files = []
  for (const w of sizes) {
    const file = `${out}-${w}.webp`
    await sharp(png).resize({ width: w }).webp({ quality: 82, alphaQuality: 90, effort: 6 }).toFile(r(`public/brand/${file}`))
    files.push({ file, w })
  }
  return files
}

// ---------------------------------------------------------------------------
// Lettering → SVG paths
// ---------------------------------------------------------------------------
async function loadFont(p) {
  const buf = await readFile(r(p))
  return opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength))
}

/** Lays out `text` so its ink box is centred on cx and spans `targetWidth`. */
function textPath(font, text, { cx, baseline, targetWidth, fontSize, tracking = 0 }) {
  const layout = (size) => {
    const scale = size / font.unitsPerEm
    const glyphs = font.stringToGlyphs(text)
    let x = 0
    const placed = []
    glyphs.forEach((g, i) => {
      placed.push([g, x])
      x += g.advanceWidth * scale + tracking * size
      if (i < glyphs.length - 1) x += font.getKerningValue(g, glyphs[i + 1]) * scale
    })
    const p = new opentype.Path()
    for (const [g, gx] of placed) p.extend(g.getPath(gx, 0, size))
    return p
  }
  let size = fontSize ?? 100
  if (targetWidth) {
    const bb = layout(100).getBoundingBox()
    size = (100 * targetWidth) / (bb.x2 - bb.x1)
  }
  const probe = layout(size).getBoundingBox()
  const dx = cx - (probe.x1 + probe.x2) / 2
  const scale = size / font.unitsPerEm
  const glyphs = font.stringToGlyphs(text)
  let x = dx
  const out = new opentype.Path()
  glyphs.forEach((g, i) => {
    out.extend(g.getPath(x, baseline, size))
    x += g.advanceWidth * scale + tracking * size
    if (i < glyphs.length - 1) x += font.getKerningValue(g, glyphs[i + 1]) * scale
  })
  const bb = out.getBoundingBox()
  // Serialise ourselves: opentype's toPathData optimiser can emit NaN on
  // degenerate curves. Whole units are plenty at this viewBox size.
  const n = (v) => Math.round(v)
  const d = out.commands
    .map((c) => {
      if (c.type === 'M' || c.type === 'L') return `${c.type}${n(c.x)} ${n(c.y)}`
      if (c.type === 'Q') return `Q${n(c.x1)} ${n(c.y1)} ${n(c.x)} ${n(c.y)}`
      if (c.type === 'C') return `C${n(c.x1)} ${n(c.y1)} ${n(c.x2)} ${n(c.y2)} ${n(c.x)} ${n(c.y)}`
      return 'Z'
    })
    .join('')
  if (d.includes('NaN')) throw new Error(`Bad path data for "${text}"`)
  return { d, box: [bb.x1, bb.y1, bb.x2, bb.y2].map((n) => +n.toFixed(1)), size: +size.toFixed(2) }
}

// ---------------------------------------------------------------------------
await mkdir(r('public/brand'), { recursive: true })
await mkdir(r('src/components/brand'), { recursive: true })

const display = await loadFont('node_modules/@fontsource/rammetto-one/files/rammetto-one-latin-400-normal.woff')
const script = await loadFont('node_modules/@fontsource/cedarville-cursive/files/cedarville-cursive-latin-400-normal.woff')

// Full lockup — ROLL UP / Cinnamon / — est.2026 — on a wide torn strip.
const FULL = { width: 1400, height: 560 }
const fullStrip = await buildStrip({
  ...FULL,
  seed: 11,
  corners: [
    [74, 92], [520, 70], [1012, 66], [1318, 84], [1336, 250], [1352, 420], [1250, 488],
    [760, 500], [300, 492], [96, 478], [40, 380], [66, 280], [44, 190],
  ],
  out: 'kraft-strip',
  sizes: [640, 1000, 1400],
})
const fullRollUp = textPath(display, 'ROLL UP', { cx: 692, baseline: 318, targetWidth: 1010, tracking: 0.02 })
const fullScript = textPath(script, 'Cinnamon', { cx: 704, baseline: 412, targetWidth: 356 })
const fullEst = textPath(script, 'est.2026', { cx: 700, baseline: 462, targetWidth: 178 })

// Compact lockup for the navigation — ROLL UP / Cinnamon, tighter strip.
const COMPACT = { width: 760, height: 300 }
const compactStrip = await buildStrip({
  ...COMPACT,
  seed: 5,
  corners: [
    [40, 44], [300, 34], [560, 36], [712, 50], [722, 150], [716, 250], [520, 262],
    [250, 266], [52, 256], [26, 190], [40, 120],
  ],
  out: 'kraft-strip-compact',
  sizes: [320, 480, 760],
})
const compactRollUp = textPath(display, 'ROLL UP', { cx: 374, baseline: 158, targetWidth: 566, tracking: 0.02 })
const compactScript = textPath(script, 'Cinnamon', { cx: 382, baseline: 234, targetWidth: 246 })

const INK = '#24150c'
const RUST = '#a4502a'
const line = ([x1, y1, x2, y2], w) =>
  `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${RUST}" stroke-width="${w}" stroke-linecap="round"/>`
const rough = (id, scale) =>
  `<filter id="${id}" x="-3%" y="-8%" width="106%" height="116%"><feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="2" seed="7" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="${scale}" xChannelSelector="R" yChannelSelector="G"/></filter>`

const fullRules = [
  [Math.round(fullEst.box[0] - 186), 446, Math.round(fullEst.box[0] - 40), 446],
  [Math.round(fullEst.box[2] + 40), 446, Math.round(fullEst.box[2] + 186), 446],
]
const fullSparks = [
  [1364, 112, 1398, 40],
  [1392, 150, 1466, 116],
  [1402, 196, 1480, 206],
]
const compactSparks = [
  [744, 60, 762, 22],
  [762, 88, 802, 68],
  [770, 120, 814, 124],
]

const fullSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1510 ${FULL.height}"><defs>${rough('r', 3.2)}</defs>` +
  `<path filter="url(#r)" fill="${INK}" d="${fullRollUp.d}"/>` +
  `<path fill="${INK}" d="${fullScript.d}"/><path fill="${INK}" d="${fullEst.d}"/>` +
  fullRules.map((l) => line(l, 7)).join('') + fullSparks.map((l) => line(l, 12)).join('') + `</svg>`

const compactSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 830 ${COMPACT.height}"><defs>${rough('r', 2.6)}</defs>` +
  `<path filter="url(#r)" fill="${INK}" d="${compactRollUp.d}"/>` +
  `<path fill="${INK}" d="${compactScript.d}"/>` + compactSparks.map((l) => line(l, 9)).join('') + `</svg>`

await writeFile(r('public/brand/logo-ink.svg'), fullSvg)
await writeFile(r('public/brand/logo-compact-ink.svg'), compactSvg)

// A flattened PNG of the full logo on transparent background (social / docs).
const paperPng = await sharp(r('public/brand/kraft-strip-1400.webp')).png().toBuffer()
await sharp({ create: { width: 1510, height: FULL.height, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
  .composite([{ input: paperPng, left: 0, top: 0 }, { input: Buffer.from(fullSvg), left: 0, top: 0 }])
  .png({ compressionLevel: 9 })
  .toFile(r('public/brand/logo.png'))

const meta = {
  full: { ink: 'brand/logo-ink.svg', width: 1510, height: FULL.height, paperWidth: FULL.width, paper: fullStrip },
  compact: { ink: 'brand/logo-compact-ink.svg', width: 830, height: COMPACT.height, paperWidth: COMPACT.width, paper: compactStrip },
}
const banner = '// AUTO-GENERATED by scripts/build-brand.mjs — do not edit by hand.\n'
await writeFile(r('src/components/brand/logo-data.ts'), `${banner}export const logoData = ${JSON.stringify(meta, null, 2)} as const\n`)

console.log('Logo assets written:', [...fullStrip, ...compactStrip].map((f) => f.file).join(', '))
console.log('ROLL UP size', fullRollUp.size, 'box', fullRollUp.box)

/**
 * Admin API for the menu editor at /admin/.
 *
 *   GET    → the latest menu (src/data/catalog.json on GitHub); needs a session
 *   POST   { password }                  → log in (sets a session cookie)
 *   PUT    { catalog, baseSha, photos }  → validate and commit to GitHub;
 *                                          Vercel then republishes the site
 *   DELETE                               → log out
 *
 * Set in Vercel → Settings → Environment Variables:
 *   ADMIN_PASSWORD  the admin password (12+ characters)
 *   ADMIN_SECRET    long random string that signs the login cookie
 *   GITHUB_TOKEN    fine-grained token: this repository, Contents read & write
 */
import { createHash, createHmac, timingSafeEqual } from 'node:crypto'

const CATALOG = 'src/data/catalog.json'
const UPLOADS = 'assets/photos/uploads'
const COOKIE = 'rollup_admin'
const SESSION_SECONDS = 14 * 24 * 60 * 60

class HttpError extends Error {
  constructor(status, message, upstream) {
    super(message)
    this.status = status
    this.upstream = upstream
  }
}
const fail = (status, message, upstream) => {
  throw new HttpError(status, message, upstream)
}
const bad = (message) => fail(400, message)

const json = (body, status = 200, headers = {}) =>
  Response.json(body, { status, headers: { 'cache-control': 'no-store', ...headers } })

const handle = (fn) => async (request) => {
  try {
    return await fn(request)
  } catch (e) {
    if (e instanceof HttpError) return json({ error: e.message }, e.status)
    console.error(e)
    return json({ error: 'Something went wrong. Please try again.' }, 500)
  }
}

// ---------------------------------------------------------------------------
// Session
// ---------------------------------------------------------------------------
function requireSetup() {
  const { ADMIN_PASSWORD = '', ADMIN_SECRET = '', GITHUB_TOKEN = '' } = process.env
  if (ADMIN_PASSWORD.length < 12 || ADMIN_SECRET.length < 16 || !GITHUB_TOKEN) {
    fail(503, 'The admin isn’t set up yet: add ADMIN_PASSWORD (12+ characters), ADMIN_SECRET and GITHUB_TOKEN in Vercel, then redeploy.')
  }
}

const sign = (value) => createHmac('sha256', process.env.ADMIN_SECRET).update(value).digest('base64url')
const sameBytes = (a, b) => a.length === b.length && timingSafeEqual(a, b)
const cookie = (value, maxAge) => `${COOKIE}=${value}; Path=/api/admin; HttpOnly; Secure; SameSite=Strict; Max-Age=${maxAge}`

function requireSession(request) {
  const raw = (request.headers.get('cookie') ?? '')
    .split(/;\s*/)
    .find((c) => c.startsWith(`${COOKIE}=`))
    ?.slice(COOKIE.length + 1)
  const [expires = '', signature = ''] = (raw ?? '').split('.')
  const valid = Number(expires) > Date.now() && sameBytes(Buffer.from(signature), Buffer.from(sign(expires)))
  if (!valid) fail(401, 'Please log in.')
}

async function readJson(request) {
  // JSON-only (with SameSite=Strict cookies) keeps other sites from posting here.
  if (!request.headers.get('content-type')?.startsWith('application/json')) fail(415, 'Expected JSON.')
  return request.json().catch(() => bad('Invalid request.'))
}

// ---------------------------------------------------------------------------
// GitHub
// ---------------------------------------------------------------------------
const repo = () => ({
  owner: process.env.VERCEL_GIT_REPO_OWNER || 'LeouDev',
  name: process.env.VERCEL_GIT_REPO_SLUG || 'Roll-Up-Cinnamons',
  branch: process.env.GITHUB_BRANCH || process.env.VERCEL_GIT_COMMIT_REF || 'main',
})

async function github(path, { method = 'GET', body } = {}) {
  const { owner, name } = repo()
  const res = await fetch(`https://api.github.com/repos/${owner}/${name}${path}`, {
    method,
    headers: {
      accept: 'application/vnd.github+json',
      authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      'user-agent': 'roll-up-cinnamons-admin',
      'x-github-api-version': '2022-11-28',
      ...(body && { 'content-type': 'application/json' }),
    },
    body: body && JSON.stringify(body),
  })
  if (res.ok) return res.json()
  if (res.status === 401) fail(502, 'GitHub didn’t accept GITHUB_TOKEN. It may have expired; make a new one and update it in Vercel.', 401)
  if (res.status === 403 || res.status === 404)
    fail(502, `GITHUB_TOKEN can’t reach ${owner}/${name}. It needs Contents: read and write on this repository.`, res.status)
  fail(502, `GitHub error ${res.status}. Please try again.`, res.status)
}

async function readCatalog(ref) {
  const file = await github(`/contents/${CATALOG}?ref=${encodeURIComponent(ref)}`)
  return { catalog: JSON.parse(Buffer.from(file.content, 'base64').toString('utf8')), sha: file.sha }
}

/** One commit with every change, so Vercel builds once. Returns the new catalog.json blob sha. */
async function commit(parent, files, removed, message) {
  const { branch } = repo()
  const { tree: base } = await github(`/git/commits/${parent}`)
  const blobs = await Promise.all(
    files.map((f) => github('/git/blobs', { method: 'POST', body: { content: f.content, encoding: f.encoding } })),
  )
  const makeTree = (deletions) =>
    github('/git/trees', {
      method: 'POST',
      body: {
        base_tree: base.sha,
        tree: [
          ...files.map((f, i) => ({ path: f.path, mode: '100644', type: 'blob', sha: blobs[i].sha })),
          ...deletions.map((path) => ({ path, mode: '100644', type: 'blob', sha: null })),
        ],
      },
    })
  // GitHub refuses to delete a file that's already gone; then just skip the clean-up.
  const tree = await makeTree(removed).catch((e) => (e.upstream === 422 && removed.length ? makeTree([]) : Promise.reject(e)))
  const created = await github('/git/commits', { method: 'POST', body: { message, tree: tree.sha, parents: [parent] } })
  try {
    await github(`/git/refs/heads/${branch}`, { method: 'PATCH', body: { sha: created.sha } })
  } catch (e) {
    // Not a fast-forward: something was pushed a moment ago.
    if (e.upstream === 422) fail(409, 'Someone saved at the same moment. Please save again.')
    throw e
  }
  return blobs[0].sha
}

// ---------------------------------------------------------------------------
// Validation: the menu is published as-is, so check everything that comes in.
// ---------------------------------------------------------------------------
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const UPLOAD_ID = /^upload-(flavor|product)-[a-z0-9]+(?:-[a-z0-9]+)*$/

const object = (v, what) => (v && typeof v === 'object' && !Array.isArray(v) ? v : bad(`${what} is missing.`))
const list = (v, what, min, max) =>
  Array.isArray(v) && v.length >= min && v.length <= max ? v : bad(`${what}: needs ${min}–${max}.`)

function text(v, what, max, required = true) {
  if (v == null && !required) return ''
  if (typeof v !== 'string') bad(`${what} must be text.`)
  const s = v.trim()
  if (required && !s) bad(`${what} can’t be empty.`)
  if (s.length > max) bad(`${what} is too long (${max} characters max).`)
  return s
}
const flag = (v, what) => (typeof v === 'boolean' ? v : bad(`${what}: availability must be on or off.`))
function price(v, what) {
  if (v === null) return null
  if (typeof v !== 'number' || !Number.isFinite(v) || v < 0 || v > 1_000_000) bad(`${what}: the price must be a number of pesos, or empty.`)
  return Math.round(v * 100) / 100
}
function slug(v, what, seen) {
  if (typeof v !== 'string' || !SLUG.test(v) || v.length > 60) bad(`${what} has an invalid id.`)
  if (seen.has(v)) bad(`${what}: two items share the id "${v}".`)
  seen.add(v)
  return v
}
const photo = (v, what, known) => (typeof v === 'string' && known.has(v) ? v : bad(`${what} needs a photo.`))

function cleanCatalog(input, known) {
  const c = object(input, 'The menu')
  const boxIds = new Set()
  const boxSizes = list(c.boxSizes, 'Box sizes', 1, 6).map((raw, i) => {
    const b = object(raw, `Box size ${i + 1}`)
    const label = text(b.label, `Box size ${i + 1} name`, 40)
    const rolls = Number.isInteger(b.rolls) && b.rolls >= 1 && b.rolls <= 24 ? b.rolls : bad(`${label}: rolls must be 1–24.`)
    return { id: slug(b.id, label, boxIds), label, rolls, price: price(b.price, label) }
  })

  const flavorIds = new Set()
  const flavors = list(c.flavors, 'Flavors', 1, 30).map((raw, i) => {
    const f = object(raw, `Flavor ${i + 1}`)
    const name = text(f.name, `Flavor ${i + 1} name`, 40)
    const what = `Flavor “${name}”`
    return {
      id: slug(f.id, what, flavorIds),
      name,
      note: text(f.note, `${what} description`, 80, false),
      image: photo(f.image, what, known),
      imageAlt: text(f.imageAlt, `${what} photo description`, 200, false) || name,
      swatch: typeof f.swatch === 'string' && /^#[0-9a-f]{6}$/i.test(f.swatch) ? f.swatch.toLowerCase() : bad(`${what}: pick a dot color.`),
      available: flag(f.available, what),
    }
  })

  const productIds = new Set()
  const products = list(c.products, 'Products', 1, 30).map((raw, i) => {
    const p = object(raw, `Product ${i + 1}`)
    const name = text(p.name, `Product ${i + 1} name`, 50)
    const what = `“${name}”`
    const action = p.action === 'builder' || p.action === 'options' ? p.action : bad(`${what} has an unknown type.`)
    const product = {
      id: slug(p.id, what, productIds),
      name,
      description: text(p.description, `${what} description`, 240, false),
      image: photo(p.image, what, known),
      imageAlt: text(p.imageAlt, `${what} photo description`, 200, false) || name,
      tag: text(p.tag, `${what} label`, 40, false),
      action,
      available: flag(p.available, what),
    }
    if (action === 'options') {
      const optionIds = new Set()
      product.options = list(p.options, `${what} options`, 1, 12).map((rawOption, j) => {
        const o = object(rawOption, `${what} option ${j + 1}`)
        const label = text(o.label, `${what} option ${j + 1} name`, 50)
        const at = `${what} “${label}”`
        return {
          id: slug(o.id, at, optionIds),
          label,
          detail: text(o.detail, `${at} details`, 80, false),
          price: price(o.price, at),
          available: flag(o.available, at),
        }
      })
    }
    return product
  })
  if (products.filter((p) => p.action === 'builder').length !== 1) bad('The box-of-rolls product must stay on the menu.')

  return { boxSizes, flavors, products }
}

function cleanPhotos(input = []) {
  return list(input, 'Photos', 0, 6).map((raw) => {
    const p = object(raw, 'A photo')
    if (typeof p.id !== 'string' || !UPLOAD_ID.test(p.id) || p.id.length > 80) bad('A photo has an invalid name.')
    const bytes = typeof p.data === 'string' ? Buffer.from(p.data, 'base64') : Buffer.alloc(0)
    const jpeg = bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff
    if (!jpeg || bytes.length < 500 || bytes.length > 3_000_000) bad('Photos must be JPEG images under 3 MB.')
    return { id: p.id, data: bytes.toString('base64') }
  })
}

const photosOf = (catalog) => [...catalog.flavors, ...catalog.products].map((item) => item.image)

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------
export const GET = handle(async (request) => {
  requireSetup()
  requireSession(request)
  return json(await readCatalog(repo().branch))
})

export const POST = handle(async (request) => {
  requireSetup()
  const { password } = await readJson(request)
  const digest = (s) => createHash('sha256').update(String(s)).digest()
  if (typeof password !== 'string' || !sameBytes(digest(password), digest(process.env.ADMIN_PASSWORD))) {
    await new Promise((r) => setTimeout(r, 800)) // slows down guessing
    fail(401, 'Wrong password.')
  }
  const expires = String(Date.now() + SESSION_SECONDS * 1000)
  return json(await readCatalog(repo().branch), 200, { 'set-cookie': cookie(`${expires}.${sign(expires)}`, SESSION_SECONDS) })
})

export const PUT = handle(async (request) => {
  requireSetup()
  requireSession(request)
  const body = object(await readJson(request), 'Request')

  const head = (await github(`/git/ref/heads/${repo().branch}`)).object.sha
  const current = await readCatalog(head)
  if (body.baseSha !== current.sha) {
    fail(409, 'The menu was changed somewhere else after you opened it. Reload to get the latest version, then make your changes again.')
  }

  const photos = cleanPhotos(body.photos)
  const known = new Set([...photosOf(current.catalog), ...photos.map((p) => p.id)])
  const catalog = cleanCatalog(body.catalog, known)
  const used = new Set(photosOf(catalog))

  const files = [
    { path: CATALOG, content: `${JSON.stringify(catalog, null, 2)}\n`, encoding: 'utf-8' },
    ...photos.filter((p) => used.has(p.id)).map((p) => ({ path: `${UPLOADS}/${p.id}.jpg`, content: p.data, encoding: 'base64' })),
  ]
  // Uploaded photos nothing uses any more.
  const removed = photosOf(current.catalog)
    .filter((id) => UPLOAD_ID.test(id) && !used.has(id))
    .map((id) => `${UPLOADS}/${id}.jpg`)

  const sha = await commit(head, files, [...new Set(removed)], 'Update the menu from the admin page')
  return json({ catalog, sha })
})

export const DELETE = handle(async () => json({ ok: true }, 200, { 'set-cookie': cookie('', 0) }))

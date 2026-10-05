/**
 * Runnable check for api/admin.js and api/menu.js, against an in-memory fake
 * of Supabase (the menu table with its version trigger, and photo storage).
 *
 *   npm run check:admin
 */
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

process.env.ADMIN_PASSWORD = 'correct horse battery staple'
process.env.ADMIN_SECRET = 'a-long-random-test-secret'
process.env.SUPABASE_SECRET_KEY = 'sb_secret_test'
process.env.SUPABASE_URL = 'https://fake.supabase.test'
process.env.VERCEL_DEPLOY_HOOK = 'https://api.vercel.test/deploy-hook'

// ---------------------------------------------------------------------------
// Fake Supabase: one menu row (version bumps + history on update, like the
// real trigger), and a photo bucket.
// ---------------------------------------------------------------------------
let row = { catalog: JSON.parse(readFileSync(new URL('../src/data/catalog.json', import.meta.url), 'utf8')), version: 1 }
const history = []
const photos = new Map()
const hooks = []
let raceOnce = false // simulate someone else saving between our read and our write

globalThis.fetch = async (url, init = {}) => {
  const u = new URL(url)
  if (u.href === process.env.VERCEL_DEPLOY_HOOK) return hooks.push(init.method), Response.json({})
  if (u.origin !== 'https://fake.supabase.test') throw new Error(`Unexpected request: ${url}`)
  if (init.headers?.apikey !== 'sb_secret_test') return Response.json({ message: 'Invalid API key' }, { status: 401 })
  assert.equal(init.headers.authorization, undefined, 'secret keys go on the apikey header only')
  const method = init.method ?? 'GET'

  if (u.pathname === '/rest/v1/menu' && u.searchParams.get('id') === 'eq.1') {
    if (method === 'GET') return Response.json({ catalog: row.catalog, version: row.version })
    if (method === 'PATCH') {
      if (raceOnce) {
        raceOnce = false
        history.push(structuredClone(row))
        row = { ...row, version: row.version + 1 }
      }
      if (u.searchParams.get('version') !== `eq.${row.version}`) return Response.json([])
      history.push(structuredClone(row))
      row = { catalog: JSON.parse(init.body).catalog, version: row.version + 1 }
      return Response.json([{ catalog: row.catalog, version: row.version }])
    }
  }
  if (method === 'POST' && u.pathname.startsWith('/storage/v1/object/menu-photos/')) {
    assert.equal(init.headers['content-type'], 'image/jpeg')
    photos.set(u.pathname.split('/').pop(), init.body)
    return Response.json({ Key: u.pathname })
  }
  return Response.json({ message: 'not found' }, { status: 404 })
}

// ---------------------------------------------------------------------------
// Exercise the API
// ---------------------------------------------------------------------------
const { GET, POST, PUT, DELETE } = await import('../api/admin.js')
const menuFeed = (await import('../api/menu.js')).GET
const req = (method, { body, cookie } = {}) =>
  new Request('https://example.test/api/admin', {
    method,
    headers: { ...(body && { 'content-type': 'application/json' }), ...(cookie && { cookie }) },
    body: body && JSON.stringify(body),
  })
const put = (cookie, body) => PUT(req('PUT', { cookie, body }))

// The public feed serves the live menu, briefly cached at the edge.
let res = await menuFeed()
assert.equal(res.status, 200)
assert.equal((await res.json()).version, 1)
assert.match(res.headers.get('cache-control'), /s-maxage=5/)

// Not set up → a clear message instead of an open door.
process.env.ADMIN_PASSWORD = 'short'
assert.equal((await GET(req('GET'))).status, 503)
process.env.ADMIN_PASSWORD = 'correct horse battery staple'

// Locked without a session, with the wrong password, or with a forged cookie.
assert.equal((await GET(req('GET'))).status, 401)
assert.equal((await POST(req('POST', { body: { password: 'nope' } }))).status, 401)
assert.equal((await GET(req('GET', { cookie: `rollup_admin=${Date.now() + 1e9}.forged` }))).status, 401)

// Log in → session cookie and the live menu.
const login = await POST(req('POST', { body: { password: 'correct horse battery staple' } }))
assert.equal(login.status, 200)
assert.match(login.headers.get('set-cookie'), /HttpOnly; Secure; SameSite=Strict/)
const cookie = login.headers.get('set-cookie').split(';')[0]
let { catalog, version } = await login.json()
assert.equal(version, 1)
assert.equal((await GET(req('GET', { cookie }))).status, 200)
assert.equal((await put(undefined, { catalog, baseVersion: version })).status, 401) // saving needs a login too

// Bad input and stale copies are refused before anything is written.
const blankName = structuredClone(catalog)
blankName.flavors[0].name = ' '
res = await put(cookie, { catalog: blankName, baseVersion: version })
assert.equal(res.status, 400)
assert.match((await res.json()).error, /name can’t be empty/)
const noPhoto = structuredClone(catalog)
noPhoto.flavors.push({ ...noPhoto.flavors[0], id: 'mystery', image: 'upload-flavor-never-sent' })
assert.equal((await put(cookie, { catalog: noPhoto, baseVersion: version })).status, 400)
assert.equal((await put(cookie, { catalog, baseVersion: 0 })).status, 409)
assert.equal(row.version, 1)
assert.equal(photos.size, 0)

// A real edit: set a price, mark a flavor sold out, add a flavor with a photo.
const jpeg = Buffer.concat([Buffer.from([0xff, 0xd8, 0xff, 0xe0]), Buffer.alloc(2000)]).toString('base64')
const edited = structuredClone(catalog)
edited.boxSizes[0].price = 350
edited.flavors[0].available = false
edited.flavors.push({ id: 'ube', name: '  Ube ', note: 'Purple yam', image: 'upload-flavor-ube-k3f9', imageAlt: '', swatch: '#6B3FA0', available: true })
res = await put(cookie, { catalog: edited, baseVersion: version, photos: [{ id: 'upload-flavor-ube-k3f9', data: jpeg }] })
assert.equal(res.status, 200, await res.clone().text())
;({ catalog, version } = await res.json())
assert.equal(version, 2)
assert.equal(row.catalog.boxSizes[0].price, 350)
assert.equal(row.catalog.flavors[0].available, false)
assert.deepEqual(row.catalog.flavors.at(-1), {
  id: 'ube',
  name: 'Ube',
  note: 'Purple yam',
  image: 'upload-flavor-ube-k3f9',
  imageAlt: 'Ube',
  swatch: '#6b3fa0',
  available: true,
})
assert.ok(photos.has('upload-flavor-ube-k3f9.jpg'))
assert.equal(history.at(-1).version, 1)
assert.deepEqual(hooks, ['POST'])
assert.equal((await (await menuFeed()).json()).version, 2)

// The old version can't overwrite the new one.
assert.equal((await put(cookie, { catalog, baseVersion: 1 })).status, 409)

// Someone else saves between our read and our write: refused, not overwritten.
raceOnce = true
res = await put(cookie, { catalog, baseVersion: version })
assert.equal(res.status, 409)
assert.match((await res.json()).error, /same moment/)
assert.equal(row.version, 3)

// A wrong secret key gives a clear message, and the public feed says unavailable.
process.env.SUPABASE_SECRET_KEY = 'sb_secret_wrong'
const logError = console.error
console.error = () => {} // the API logs these failures; expected here
res = await GET(req('GET', { cookie }))
assert.equal(res.status, 502)
assert.match((await res.json()).error, /SUPABASE_SECRET_KEY/)
res = await menuFeed()
assert.equal(res.status, 503)
assert.equal(res.headers.get('cache-control'), 'no-store')
process.env.SUPABASE_SECRET_KEY = 'sb_secret_test'
console.error = logError

// Log out clears the cookie.
assert.match((await DELETE(req('DELETE'))).headers.get('set-cookie'), /Max-Age=0/)

console.log('Admin API: all checks passed.')

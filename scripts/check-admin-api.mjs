/**
 * Runnable check for api/admin.js, against an in-memory fake of the GitHub API.
 *
 *   npm run check:admin
 */
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

process.env.ADMIN_PASSWORD = 'correct horse battery staple'
process.env.ADMIN_SECRET = 'a-long-random-test-secret'
process.env.GITHUB_TOKEN = 'test-token'
process.env.GITHUB_BRANCH = 'main'

// ---------------------------------------------------------------------------
// Fake GitHub: commits → trees (path → blob sha) → blobs
// ---------------------------------------------------------------------------
const blobs = new Map()
const trees = new Map()
const commits = new Map()
let n = 0
const store = (map, value) => {
  const sha = `sha${++n}`
  map.set(sha, value)
  return sha
}
const catalogFile = readFileSync(new URL('../src/data/catalog.json', import.meta.url))
let head = store(commits, { tree: store(trees, new Map([['src/data/catalog.json', store(blobs, catalogFile)]])) })
const fileAt = (path) => blobs.get(trees.get(commits.get(head).tree).get(path))

globalThis.fetch = async (url, init = {}) => {
  const { pathname, searchParams } = new URL(url)
  const path = pathname.replace('/repos/LeouDev/Roll-Up-Cinnamons', '')
  const method = init.method ?? 'GET'
  const body = init.body && JSON.parse(init.body)
  if (init.headers.authorization !== 'Bearer test-token') return new Response('', { status: 401 })
  const ok = (data) => Response.json(data)

  if (method === 'GET' && path === '/git/ref/heads/main') return ok({ object: { sha: head } })
  if (method === 'GET' && path.startsWith('/git/commits/')) return ok({ tree: { sha: commits.get(path.split('/').pop()).tree } })
  if (method === 'GET' && path.startsWith('/contents/')) {
    const ref = searchParams.get('ref')
    const sha = trees.get(commits.get(ref === 'main' ? head : ref).tree).get(path.slice('/contents/'.length))
    return sha ? ok({ sha, content: blobs.get(sha).toString('base64') }) : new Response('', { status: 404 })
  }
  if (method === 'POST' && path === '/git/blobs') return ok({ sha: store(blobs, Buffer.from(body.content, body.encoding === 'base64' ? 'base64' : 'utf8')) })
  if (method === 'POST' && path === '/git/trees') {
    const tree = new Map(trees.get(body.base_tree))
    for (const entry of body.tree) {
      if (entry.sha !== null) tree.set(entry.path, entry.sha)
      else if (!tree.delete(entry.path)) return new Response('', { status: 422 })
    }
    return ok({ sha: store(trees, tree) })
  }
  if (method === 'POST' && path === '/git/commits') return ok({ sha: store(commits, { tree: body.tree, parent: body.parents[0], message: body.message }) })
  if (method === 'PATCH' && path === '/git/refs/heads/main') {
    if (commits.get(body.sha).parent !== head) return new Response('', { status: 422 })
    head = body.sha
    return ok({})
  }
  throw new Error(`Unexpected GitHub call: ${method} ${path}`)
}

// ---------------------------------------------------------------------------
// Exercise the API
// ---------------------------------------------------------------------------
const { GET, POST, PUT, DELETE } = await import('../api/admin.js')
const req = (method, { body, cookie } = {}) =>
  new Request('https://example.test/api/admin', {
    method,
    headers: { ...(body && { 'content-type': 'application/json' }), ...(cookie && { cookie }) },
    body: body && JSON.stringify(body),
  })
const put = (cookie, body) => PUT(req('PUT', { cookie, body }))

// Not set up → a clear message instead of an open door.
process.env.ADMIN_PASSWORD = 'short'
assert.equal((await GET(req('GET'))).status, 503)
process.env.ADMIN_PASSWORD = 'correct horse battery staple'

// Locked without a session, with the wrong password, or with a forged cookie.
assert.equal((await GET(req('GET'))).status, 401)
assert.equal((await POST(req('POST', { body: { password: 'nope' } }))).status, 401)
assert.equal((await GET(req('GET', { cookie: `rollup_admin=${Date.now() + 1e9}.forged` }))).status, 401)

// Log in → session cookie and the menu from GitHub.
const login = await POST(req('POST', { body: { password: 'correct horse battery staple' } }))
assert.equal(login.status, 200)
assert.match(login.headers.get('set-cookie'), /HttpOnly; Secure; SameSite=Strict/)
const cookie = login.headers.get('set-cookie').split(';')[0]
let { catalog, sha } = await login.json()
assert.equal((await GET(req('GET', { cookie }))).status, 200)

// Bad input and stale copies are refused before anything is written.
const before = commits.size
const blankName = structuredClone(catalog)
blankName.flavors[0].name = ' '
let res = await put(cookie, { catalog: blankName, baseSha: sha })
assert.equal(res.status, 400)
assert.match((await res.json()).error, /name can’t be empty/)
const noPhoto = structuredClone(catalog)
noPhoto.flavors.push({ ...noPhoto.flavors[0], id: 'mystery', image: 'upload-flavor-never-sent' })
assert.equal((await put(cookie, { catalog: noPhoto, baseSha: sha })).status, 400)
assert.equal((await put(cookie, { catalog, baseSha: 'stale' })).status, 409)
assert.equal(commits.size, before)

// A real edit: set a price, mark a flavor sold out, add a flavor with a photo.
const jpeg = Buffer.concat([Buffer.from([0xff, 0xd8, 0xff, 0xe0]), Buffer.alloc(2000)]).toString('base64')
const edited = structuredClone(catalog)
edited.boxSizes[0].price = 350
edited.flavors[0].available = false
edited.flavors.push({ id: 'ube', name: '  Ube ', note: 'Purple yam', image: 'upload-flavor-ube-k3f9', imageAlt: '', swatch: '#6B3FA0', available: true })
res = await put(cookie, { catalog: edited, baseSha: sha, photos: [{ id: 'upload-flavor-ube-k3f9', data: jpeg }] })
assert.equal(res.status, 200, await res.clone().text())
const firstSha = sha
;({ catalog, sha } = await res.json())
const saved = JSON.parse(fileAt('src/data/catalog.json'))
assert.equal(saved.boxSizes[0].price, 350)
assert.equal(saved.flavors[0].available, false)
assert.deepEqual(saved.flavors.at(-1), {
  id: 'ube',
  name: 'Ube',
  note: 'Purple yam',
  image: 'upload-flavor-ube-k3f9',
  imageAlt: 'Ube',
  swatch: '#6b3fa0',
  available: true,
})
assert.ok(fileAt('assets/photos/uploads/upload-flavor-ube-k3f9.jpg'))
assert.equal(commits.get(head).message, 'Update the menu from the admin page')
assert.equal((await put(cookie, { catalog, baseSha: firstSha })).status, 409)

// Removing the flavor removes its photo too.
res = await put(cookie, { catalog: { ...catalog, flavors: catalog.flavors.slice(0, -1) }, baseSha: sha })
assert.equal(res.status, 200)
assert.equal(fileAt('assets/photos/uploads/upload-flavor-ube-k3f9.jpg'), undefined)

// Log out clears the cookie.
assert.match((await DELETE(req('DELETE'))).headers.get('set-cookie'), /Max-Age=0/)

console.log('Admin API: all checks passed.')

import { ExternalLink, LogOut, Plus, Trash2 } from 'lucide-react'
import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import { Logo } from '../components/brand/Logo'
import { Button } from '../components/ui/Button'
import { Picture } from '../components/ui/Picture'
import { images, type ImageId } from '../data/images.generated'
import { isUpload, type BoxSize, type Catalog, type Product, type UploadId } from '../data/products'

/**
 * Menu admin (/admin/): edit products, flavors, prices, photos and what's
 * sold out. Publishing sends the menu to api/admin.js, which saves it in
 * Supabase; the website shows it right away.
 */

type Menu = { catalog: Catalog; version: number }
/** Photos picked this session: preview URL, plus the JPEG until it's published. */
type Photos = Record<string, { url: string; data?: string }>
type Status = { kind: 'idle' | 'saving' | 'saved' } | { kind: 'error'; message: string; conflict?: boolean }

const label = 'mb-1.5 block text-[0.6875rem] font-bold tracking-[0.14em] text-muted uppercase'
const input =
  'h-11 w-full rounded-xl border border-chocolate/15 bg-white px-3.5 text-[0.9375rem] text-chocolate outline-none transition-colors placeholder:text-muted/60 focus:border-chocolate disabled:bg-oat/40'
const quiet =
  'inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-semibold transition-colors hover:bg-chocolate/5 disabled:opacity-40 [&_svg]:size-4'

// ---------------------------------------------------------------------------
// API and helpers
// ---------------------------------------------------------------------------
async function api<T>(method: 'GET' | 'POST' | 'PUT' | 'DELETE', body?: unknown): Promise<T> {
  const res = await fetch('/api/admin', {
    method,
    headers: body ? { 'content-type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const message =
      res.status === 404
        ? 'The admin API isn’t running here. Use /admin/ on the live site (or `vercel dev` locally).'
        : (data.error ?? `Something went wrong (${res.status}).`)
    throw Object.assign(new Error(message), { status: res.status })
  }
  return data as T
}

/**
 * Crops a phone photo from the centre to the shape the site shows it in
 * (square for flavors, 4:5 for products), shrinks it and re-encodes it as
 * JPEG. The site serves this file as is, so it's kept small.
 */
async function toJpeg(file: File, aspect: number, width: number) {
  const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' })
  let [sw, sh] = [bitmap.width, bitmap.height]
  if (sw / sh > aspect) sw = Math.round(sh * aspect)
  else sh = Math.round(sw / aspect)
  const canvas = document.createElement('canvas')
  canvas.width = Math.min(width, sw)
  canvas.height = Math.round(canvas.width / aspect)
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = '#fbf5ec' // transparent PNGs get the page's cream, not black
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.drawImage(bitmap, (bitmap.width - sw) / 2, (bitmap.height - sh) / 2, sw, sh, 0, 0, canvas.width, canvas.height)
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.86))
  if (!blob) throw new Error('Unreadable photo')
  const data = await new Promise<string>((resolve) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result).split(',')[1])
    reader.readAsDataURL(blob)
  })
  return { url: URL.createObjectURL(blob), data }
}

const randomId = () => Math.random().toString(36).slice(2, 8).padEnd(6, '0')
const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40)

/** Items added this session get readable ids from their names ("Ube Halaya" → "ube-halaya"). */
function withIds(catalog: Catalog): Catalog {
  const c = structuredClone(catalog)
  const assign = <T extends { id: string }>(items: T[], name: (item: T) => string) => {
    const taken = new Set(items.filter((x) => !x.id.startsWith('new-')).map((x) => x.id))
    for (const item of items) {
      if (!item.id.startsWith('new-')) continue
      const base = slugify(name(item)) || `item-${randomId()}`
      let id = base
      for (let i = 2; taken.has(id); i++) id = `${base}-${i}`
      taken.add(id)
      item.id = id
    }
  }
  assign(c.flavors, (f) => f.name)
  assign(c.products, (p) => p.name)
  for (const p of c.products) if (p.options) assign(p.options, (o) => o.label)
  return c
}

// ---------------------------------------------------------------------------
// App
// ---------------------------------------------------------------------------
export function Admin() {
  const [menu, setMenu] = useState<Menu | null>(null)
  const [view, setView] = useState<'loading' | 'login' | string>('loading') // anything else is an error message

  useEffect(() => {
    api<Menu>('GET').then(setMenu, (e: Error & { status?: number }) => setView(e.status === 401 ? 'login' : e.message))
  }, [])

  if (menu)
    return (
      <Editor
        menu={menu}
        onLogout={() => {
          setMenu(null)
          setView('login')
        }}
      />
    )
  return (
    <main className="grid min-h-dvh place-items-center bg-cream p-4">
      {view === 'login' ? (
        <Login onLoggedIn={setMenu} />
      ) : (
        <p className="max-w-sm text-center text-cocoa" role={view === 'loading' ? undefined : 'alert'}>
          {view === 'loading' ? 'Loading…' : view}
        </p>
      )}
    </main>
  )
}

function Login({ onLoggedIn, note }: { onLoggedIn: (menu: Menu) => void; note?: string }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      onLoggedIn(await api<Menu>('POST', { password }))
    } catch (err) {
      setError((err as Error).message)
      setBusy(false)
    }
  }

  return (
    <form onSubmit={submit} className="w-full max-w-sm rounded-[1.75rem] bg-paper p-7 shadow-lift sm:p-9">
      <Logo variant="compact" sizes="150px" className="w-36" />
      <h1 className="mt-7 text-[2rem] leading-none">Menu admin</h1>
      <p className="mt-2 text-sm text-cocoa">{note ?? 'Update products, prices, photos and what’s sold out.'}</p>
      <label className="mt-6 block">
        <span className={label}>Password</span>
        <input
          type="password"
          autoComplete="current-password"
          required
          autoFocus
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={input}
        />
      </label>
      {error && (
        <p role="alert" className="mt-3 text-sm font-semibold text-rust">
          {error}
        </p>
      )}
      <Button type="submit" size="lg" className="mt-6 w-full" disabled={busy}>
        {busy ? 'Logging in…' : 'Log in'}
      </Button>
    </form>
  )
}

// ---------------------------------------------------------------------------
// Editor
// ---------------------------------------------------------------------------
function Editor({ menu, onLogout }: { menu: Menu; onLogout: () => void }) {
  const [draft, setDraft] = useState(menu.catalog)
  const [published, setPublished] = useState(menu)
  const [photos, setPhotos] = useState<Photos>({})
  const [status, setStatus] = useState<Status>({ kind: 'idle' })
  const [expired, setExpired] = useState(false)
  const dirty = JSON.stringify(draft) !== JSON.stringify(published.catalog)
  const saving = status.kind === 'saving'

  useEffect(() => {
    if (!dirty) return
    const warn = (e: BeforeUnloadEvent) => e.preventDefault()
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [dirty])

  const change = (edit: (c: Catalog) => void) => {
    setDraft((d) => {
      const c = structuredClone(d)
      edit(c)
      return c
    })
    setStatus({ kind: 'idle' })
  }

  const pickPhoto = async (kind: 'flavor' | 'product', file: File, apply: (c: Catalog, id: UploadId) => void) => {
    try {
      const photo = kind === 'flavor' ? await toJpeg(file, 1, 600) : await toJpeg(file, 4 / 5, 960)
      const id: UploadId = `upload-${kind}-${randomId()}${randomId()}`
      setPhotos((p) => ({ ...p, [id]: photo }))
      change((c) => apply(c, id))
    } catch {
      setStatus({ kind: 'error', message: 'That photo couldn’t be opened. Try a JPG or PNG.' })
    }
  }

  const publish = async () => {
    setStatus({ kind: 'saving' })
    try {
      const catalog = withIds(draft)
      const used = new Set<string>([...catalog.flavors, ...catalog.products].map((item) => item.image))
      const uploads = Object.entries(photos).flatMap(([id, p]) => (p.data && used.has(id) ? [{ id, data: p.data }] : []))
      const saved = await api<Menu>('PUT', { catalog, baseVersion: published.version, photos: uploads })
      setPublished(saved)
      setDraft(saved.catalog)
      setPhotos((all) => Object.fromEntries(Object.entries(all).map(([id, p]) => [id, { url: p.url }])))
      setStatus({ kind: 'saved' })
    } catch (e) {
      const err = e as Error & { status?: number }
      if (err.status === 401) {
        setExpired(true)
        setStatus({ kind: 'idle' })
      } else setStatus({ kind: 'error', message: err.message, conflict: err.status === 409 })
    }
  }

  const logout = async () => {
    if (dirty && !confirm('Log out without publishing your changes?')) return
    await api('DELETE').catch(() => {})
    onLogout()
  }

  const message =
    status.kind === 'saving'
      ? 'Publishing…'
      : status.kind === 'saved'
        ? 'Published! It’s on the website now.'
        : status.kind === 'error'
          ? status.message
          : dirty
            ? 'You have changes that aren’t published yet.'
            : 'Everything is published.'

  return (
    <div className="min-h-dvh bg-cream pb-36">
      <header className="sticky top-0 z-30 border-b border-chocolate/10 bg-cream/90 backdrop-blur-md">
        <div className="container-page flex h-16 max-w-3xl items-center justify-between gap-3">
          <span className="flex items-center gap-3">
            <Logo variant="compact" sizes="100px" className="w-24" />
            <span className="eyebrow hidden text-muted sm:inline">Menu admin</span>
          </span>
          <span className="-mr-2 flex items-center">
            <a href="/" target="_blank" rel="noopener" className={quiet}>
              <ExternalLink aria-hidden="true" /> View site
            </a>
            <button type="button" onClick={logout} className={quiet}>
              <LogOut aria-hidden="true" /> Log out
            </button>
          </span>
        </div>
      </header>

      <main className="container-page max-w-3xl">
        <fieldset disabled={saving} className="min-w-0">
          <Section title="Products" subtitle="Everything on the menu. Cinnamon Rolls is the build-a-box product; its price is per box.">
            {draft.products.map((p, i) => (
              <ProductFields
                key={p.id}
                product={p}
                boxSizes={draft.boxSizes}
                preview={photos[p.image]?.url}
                onPhoto={(file) => pickPhoto('product', file, (c, id) => void (c.products[i].image = id))}
                update={(edit) => change((c) => edit(c.products[i], c))}
                onRemove={
                  p.action === 'options'
                    ? () => confirm(`Delete “${p.name || 'this product'}” from the menu?`) && change((c) => void c.products.splice(i, 1))
                    : undefined
                }
              />
            ))}
            <AddButton
              onClick={() =>
                change((c) =>
                  void c.products.push({
                    id: `new-${randomId()}`,
                    name: '',
                    description: '',
                    image: '' as ImageId,
                    imageAlt: '',
                    tag: '',
                    action: 'options',
                    available: true,
                    options: [{ id: `new-${randomId()}`, label: '', detail: '', price: null, available: true }],
                  }),
                )
              }
            >
              Add a product
            </AddButton>
          </Section>

          <Section title="Box flavors" subtitle="The flavors customers can pick when they build a box.">
            {draft.flavors.map((f, i) => (
              <article key={f.id} className="flex gap-4 rounded-[1.5rem] bg-paper p-4 shadow-soft sm:gap-5 sm:p-5">
                <PhotoPicker
                  image={f.image}
                  preview={photos[f.image]?.url}
                  round
                  label={`Photo of ${f.name || 'the new flavor'}`}
                  onPick={(file) => pickPhoto('flavor', file, (c, id) => void (c.flavors[i].image = id))}
                />
                <div className="grid min-w-0 flex-1 gap-3 sm:grid-cols-2">
                  <TextField label="Name" value={f.name} onChange={(v) => change((c) => void (c.flavors[i].name = v))} />
                  <TextField
                    label="Short description"
                    placeholder="e.g. Creamy frosting swirl"
                    value={f.note}
                    onChange={(v) => change((c) => void (c.flavors[i].note = v))}
                  />
                  <div className="flex flex-wrap items-center gap-x-5 gap-y-3 sm:col-span-2">
                    <label className="inline-flex items-center gap-2 text-sm font-semibold">
                      <input
                        type="color"
                        value={f.swatch}
                        onChange={(e) => change((c) => void (c.flavors[i].swatch = e.target.value))}
                        className="size-8 cursor-pointer rounded-full border border-chocolate/15 bg-transparent p-0.5"
                      />
                      Dot color
                    </label>
                    <Toggle checked={f.available} onChange={(v) => change((c) => void (c.flavors[i].available = v))} />
                    <button
                      type="button"
                      disabled={draft.flavors.length === 1}
                      onClick={() => confirm(`Delete “${f.name || 'this flavor'}”?`) && change((c) => void c.flavors.splice(i, 1))}
                      className={`${quiet} ml-auto text-rust`}
                    >
                      <Trash2 aria-hidden="true" /> Delete
                    </button>
                  </div>
                </div>
              </article>
            ))}
            <AddButton
              onClick={() =>
                change((c) =>
                  void c.flavors.push({
                    id: `new-${randomId()}`,
                    name: '',
                    note: '',
                    image: '' as ImageId,
                    imageAlt: '',
                    swatch: '#d09c68',
                    available: true,
                  }),
                )
              }
            >
              Add a flavor
            </AddButton>
          </Section>
        </fieldset>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-chocolate/10 bg-cream/92 backdrop-blur-md">
        <div className="container-page flex max-w-3xl items-center justify-between gap-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <p role="status" className={`text-sm leading-snug ${status.kind === 'error' ? 'font-semibold text-rust' : 'text-cocoa'}`}>
            {message}
            {status.kind === 'error' && status.conflict && (
              <button type="button" onClick={() => location.reload()} className="ml-2 underline underline-offset-2">
                Reload
              </button>
            )}
          </p>
          <Button onClick={publish} disabled={!dirty || saving} className="shrink-0">
            {saving ? 'Publishing…' : 'Publish'}
          </Button>
        </div>
      </div>

      {expired && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-chocolate/50 p-4 backdrop-blur-sm">
          <Login note="Your login expired. Log in again, then press Publish; your changes are still here." onLoggedIn={() => setExpired(false)} />
        </div>
      )}
    </div>
  )
}

function ProductFields({
  product: p,
  boxSizes,
  preview,
  onPhoto,
  update,
  onRemove,
}: {
  product: Product
  boxSizes: BoxSize[]
  preview?: string
  onPhoto: (file: File) => void
  update: (edit: (p: Product, c: Catalog) => void) => void
  onRemove?: () => void
}) {
  return (
    <article className="rounded-[1.5rem] bg-paper p-4 shadow-soft sm:p-6">
      <div className="flex gap-4 sm:gap-5">
        <PhotoPicker image={p.image} preview={preview} label={`Photo of ${p.name || 'the new product'}`} onPick={onPhoto} />
        <div className="min-w-0 flex-1 space-y-3">
          <TextField label="Name" value={p.name} onChange={(v) => update((x) => void (x.name = v))} />
          <Toggle checked={p.available} onChange={(v) => update((x) => void (x.available = v))} />
        </div>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-[2fr_1fr]">
        <TextField label="Description" value={p.description} onChange={(v) => update((x) => void (x.description = v))} />
        <TextField label="Label on photo" placeholder="e.g. Homemade" value={p.tag} onChange={(v) => update((x) => void (x.tag = v))} />
      </div>

      {p.action === 'builder' ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {boxSizes.map((b, j) => (
            <PriceField key={b.id} label={`${b.label} price`} value={b.price} onChange={(v) => update((_, c) => void (c.boxSizes[j].price = v))} />
          ))}
        </div>
      ) : (
        <div className="mt-5 border-t border-chocolate/10 pt-4">
          <p className={label}>Sizes and prices</p>
          <div className="space-y-3">
            {p.options?.map((o, j) => (
              <div key={o.id} className="grid gap-3 rounded-2xl border border-chocolate/10 p-3 sm:grid-cols-[1.2fr_1.2fr_1fr]">
                <TextField
                  label="Name"
                  placeholder="e.g. Pack of 6"
                  value={o.label}
                  onChange={(v) => update((x) => void (x.options![j].label = v))}
                />
                <TextField
                  label="Details"
                  placeholder="e.g. Regular size, 6 rolls"
                  value={o.detail ?? ''}
                  onChange={(v) => update((x) => void (x.options![j].detail = v))}
                />
                <PriceField label="Price" value={o.price} onChange={(v) => update((x) => void (x.options![j].price = v))} />
                <div className="flex items-center justify-between sm:col-span-3">
                  <Toggle checked={o.available} onChange={(v) => update((x) => void (x.options![j].available = v))} />
                  {p.options!.length > 1 && (
                    <button type="button" onClick={() => update((x) => void x.options!.splice(j, 1))} className={`${quiet} text-rust`}>
                      <Trash2 aria-hidden="true" /> Remove
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
          <AddButton
            onClick={() => update((x) => void x.options!.push({ id: `new-${randomId()}`, label: '', detail: '', price: null, available: true }))}
          >
            Add a size
          </AddButton>
        </div>
      )}

      {onRemove && (
        <div className="mt-4 flex justify-end border-t border-chocolate/10 pt-3">
          <button type="button" onClick={onRemove} className={`${quiet} -mr-2 text-rust`}>
            <Trash2 aria-hidden="true" /> Delete product
          </button>
        </div>
      )}
    </article>
  )
}

// ---------------------------------------------------------------------------
// Fields
// ---------------------------------------------------------------------------
function Section({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="text-[1.9rem] leading-tight">{title}</h2>
      <p className="mt-1 text-sm text-cocoa">{subtitle}</p>
      <div className="mt-5 space-y-4">{children}</div>
    </section>
  )
}

function TextField({ label: text, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <label className="block min-w-0">
      <span className={label}>{text}</span>
      <input value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className={input} />
    </label>
  )
}

/** Pesos; empty means "not set yet" (the site says the price is confirmed in Messenger). */
function PriceField({ label: text, value, onChange }: { label: string; value: number | null; onChange: (v: number | null) => void }) {
  return (
    <label className="block min-w-0">
      <span className={label}>{text}</span>
      <span className="relative block">
        <span className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-muted">₱</span>
        <input
          type="number"
          inputMode="decimal"
          min={0}
          step="any"
          placeholder="Not set"
          value={value ?? ''}
          onChange={(e) => {
            const n = e.target.valueAsNumber
            onChange(e.target.value === '' ? null : Number.isNaN(n) ? value : n)
          }}
          className={`${input} pl-8`}
        />
      </span>
    </label>
  )
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-2.5 text-sm font-semibold">
      <input type="checkbox" role="switch" checked={checked} onChange={(e) => onChange(e.target.checked)} className="peer sr-only" />
      <span className="relative h-6 w-11 shrink-0 rounded-full bg-chocolate/20 transition-colors peer-checked:bg-cinnamon peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-rust after:absolute after:top-0.5 after:left-0.5 after:size-5 after:rounded-full after:bg-white after:shadow-soft after:transition-transform peer-checked:after:translate-x-5" />
      <span className={checked ? '' : 'text-rust'}>{checked ? 'Available' : 'Sold out'}</span>
    </label>
  )
}

function PhotoPicker({
  image,
  preview,
  round = false,
  label: text,
  onPick,
}: {
  image: string
  preview?: string
  round?: boolean
  label: string
  onPick: (file: File) => void
}) {
  return (
    <label
      className={`relative block shrink-0 cursor-pointer overflow-hidden bg-oat shadow-soft has-focus-visible:outline-2 has-focus-visible:outline-offset-3 has-focus-visible:outline-rust ${round ? 'size-24 rounded-full' : 'aspect-[4/5] w-24 rounded-2xl sm:w-28'}`}
    >
      {preview ? (
        <img src={preview} alt="" className="size-full object-cover" />
      ) : image in images || isUpload(image) ? (
        <Picture image={image as ImageId | UploadId} alt="" sizes="112px" className="size-full object-cover" />
      ) : (
        <span className="grid size-full place-items-center p-3 text-center text-xs leading-snug text-muted">Add a photo</span>
      )}
      <span className="absolute inset-x-0 bottom-0 bg-chocolate/65 py-1 text-center text-[0.625rem] font-bold tracking-[0.12em] text-cream uppercase">
        {image ? 'Change' : 'Add'}
      </span>
      <input
        type="file"
        accept="image/*"
        aria-label={text}
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0]
          e.currentTarget.value = ''
          if (file) onPick(file)
        }}
      />
    </label>
  )
}

function AddButton({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mt-1 flex w-full items-center justify-center gap-2 rounded-[1.25rem] border-2 border-dashed border-chocolate/15 py-4 text-sm font-bold text-cocoa transition-colors hover:border-chocolate/40 hover:text-chocolate"
    >
      <Plus className="size-4" aria-hidden="true" /> {children}
    </button>
  )
}

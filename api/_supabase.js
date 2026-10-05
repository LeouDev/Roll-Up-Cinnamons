/**
 * Minimal Supabase client for the API routes and build scripts. Server-only:
 * it uses SUPABASE_SECRET_KEY, which must never reach the browser.
 * (Files starting with "_" in api/ are not served as endpoints.)
 */
export const SUPABASE_URL = process.env.SUPABASE_URL || 'https://nrxrayvnjqfjiclkiwhf.supabase.co'
export const PHOTO_BUCKET = 'menu-photos'

export class SupabaseError extends Error {
  constructor(status, message) {
    super(message)
    this.status = status
  }
}

export async function supabase(path, { method = 'GET', headers = {}, body } = {}) {
  // New-style keys (sb_secret_…) go on the apikey header only, not Authorization.
  const res = await fetch(`${SUPABASE_URL}${path}`, {
    method,
    headers: { apikey: process.env.SUPABASE_SECRET_KEY ?? '', ...headers },
    body,
  })
  if (!res.ok) throw new SupabaseError(res.status, `Supabase ${method} ${path.split('?')[0]} → ${res.status}: ${await res.text()}`)
  return res.status === 204 ? null : res.json()
}

/** The live menu row: { catalog, version }. */
export const readMenu = () =>
  supabase('/rest/v1/menu?id=eq.1&select=catalog,version', { headers: { accept: 'application/vnd.pgrst.object+json' } })

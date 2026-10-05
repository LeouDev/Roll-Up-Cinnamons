/**
 * Public, read-only: the live menu the website loads after it opens, so admin
 * changes show without a rebuild. Cached at Vercel's edge for a few seconds.
 * Also hit daily by a cron (vercel.json) so a quiet week doesn't let the free
 * Supabase project pause.
 */
import { readMenu } from './_supabase.js'

export async function GET() {
  try {
    return Response.json(await readMenu(), {
      headers: { 'cache-control': 'public, max-age=0, s-maxage=5, stale-while-revalidate=60' },
    })
  } catch (e) {
    console.error(e)
    // The page keeps the menu it was built with.
    return Response.json({ error: 'The menu is unavailable right now.' }, { status: 503, headers: { 'cache-control': 'no-store' } })
  }
}

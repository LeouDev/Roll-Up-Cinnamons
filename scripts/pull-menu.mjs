/**
 * First build step: copy the live menu from Supabase into src/data/catalog.json,
 * so the prerendered page matches what the admin last published.
 *
 * Without SUPABASE_SECRET_KEY (e.g. a local build), or if Supabase can't be
 * reached, the committed catalog.json is used as it is — the site then loads
 * the live menu in the browser anyway.
 */
import { writeFile } from 'node:fs/promises'
import { readMenu } from '../api/_supabase.js'

if (!process.env.SUPABASE_SECRET_KEY) {
  console.log('Menu: no SUPABASE_SECRET_KEY, using the committed catalog.json.')
} else {
  try {
    const { catalog, version } = await readMenu()
    await writeFile(new URL('../src/data/catalog.json', import.meta.url), `${JSON.stringify(catalog, null, 2)}\n`)
    console.log(`Menu: using live version ${version} from Supabase.`)
  } catch (e) {
    console.warn(`Menu: couldn't read Supabase (${e.message}); using the committed catalog.json.`)
  }
}

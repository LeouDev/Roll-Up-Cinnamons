# Roll Up Cinnamons

Website for **Roll Up Cinnamons**, homemade soft cinnamon rolls in Babag 2, Lapu-Lapu City.

Visitors see the rolls, **build a box of 4** with their own mix of flavors, review the order and **send it through Messenger**. There's no payment step: the bakery confirms every order in the chat.

Products, prices, photos and what's sold out are managed from the **menu admin** at `/admin/` (see below).

Built with Vite, React, TypeScript and Tailwind CSS, hosted on Vercel, with the menu in **Supabase** (project *Rollup_Cinnamon*). The page itself is static and prerendered; the only server code is `api/admin.js` (the admin) and `api/menu.js` (the live menu feed).

---

## Run it on your computer

You need **Node 20.19+ or 22.12+** (`node -v`).

```bash
npm install
npm run dev        # → http://localhost:5173
```

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server with hot reload |
| `npm run build` | Typecheck, build and prerender the page into `dist/` |
| `npm run preview` | Serve the built `dist/` locally, to check it before publishing |
| `npm run typecheck` | TypeScript only |
| `npm run check:admin` | Test the admin API (login, validation, publishing) against a fake GitHub |
| `npm run images` | Optimize new or changed photos (also runs before `dev` and `build`) |
| `npm run icons` | Rebuild the favicons and the social share image (needs Google Chrome) |
| `npm run brand` | Rebuild the logo files (only if the logo itself changes) |

---

## Menu admin

Open **`/admin/`** on the live site (https://www.rollup-cinnamon.online/admin/) and log in with the admin password. From there you can:

- change **prices** (the box of 4, and each size of other products, like cheese roll packs),
- mark anything **Sold out** or **Available** (sold-out items stay on the menu with a tag, but can't be ordered),
- add, edit or delete **flavors** and **products**, with their sizes and prices,
- upload **photos** straight from your phone (cropped from the centre in the browser, square for flavors and 4:5 for products, then shrunk before upload).

Press **Publish** and it's live: the admin saves the menu in Supabase (table `menu`, photos in the `menu-photos` storage bucket), and the website loads the latest menu every time it opens, so visitors see the change on their next visit or refresh. Each build also copies the live menu into the page itself (`scripts/pull-menu.mjs`), so search engines and slow connections see it too.

How it holds up:

- **Two people saving at once** can't overwrite each other: the second one is asked to reload.
- **Undo:** every earlier version is kept in the `menu_history` table. To go back, open Supabase → SQL Editor and run (with the version you want):
  ```sql
  update menu set catalog = (select catalog from menu_history where version = 12) where id = 1;
  ```
  Uploaded photos are never deleted, so old versions keep their photos.
- **If Supabase is unreachable**, the website shows the menu from its last build and the admin says it can't reach the database. Free Supabase projects pause after a week without activity; a daily request from Vercel (`vercel.json` → `crons`) keeps it awake. If it ever pauses, press *Restore* in the Supabase dashboard.
- `src/data/catalog.json` in the repo is only the fallback copy. To refresh it on your computer: `SUPABASE_SECRET_KEY=… node scripts/pull-menu.mjs`.

### One-time setup

The database tables, permissions and photo bucket are in `supabase/migrations/`. Add these environment variables in Vercel (Project → Settings → Environment Variables, for *Production*), then redeploy:

| Name | Value |
| --- | --- |
| `ADMIN_PASSWORD` | The admin password: at least 12 characters (a few random words work well). |
| `ADMIN_SECRET` | A long random string that signs the login cookie. Create one with `openssl rand -base64 32`. Changing it logs everyone out. |
| `SUPABASE_SECRET_KEY` | Supabase → Project Settings → API Keys → *Secret keys* → create one (starts with `sb_secret_`). It's used only on the server; never put it in the website code or share it. |
| `VERCEL_DEPLOY_HOOK` | *Optional.* Vercel → Settings → Git → Deploy Hooks → create one for `main`. With it, each Publish also rebuilds the page so the built-in copy of the menu stays current. |

Logins last 14 days. Keep the password private: anyone with it can change the menu. The database itself can't be read or changed with the public keys; only these server functions use it.

## Editing the content

Menu items and prices are easiest to change in the admin. Everything else lives in `src/data/`, so you never need to touch the layout code.

| To change | Edit | Notes |
| --- | --- | --- |
| **Prices, flavors, products, availability** | The admin | An empty price shows "Price on request" and totals say "confirmed in Messenger". |
| **Box sizes** | Supabase → Table Editor → `menu` → `catalog` → `boxSizes` | Add e.g. `{ "id": "box-6", "label": "Box of 6", "rolls": 6, "price": null }`; the size picker and the box drawing adapt on their own. |
| **Opening hours** | `src/data/site.ts` → `hours` | e.g. `[{ days: 'Mon – Sat', time: '9:00 AM – 6:00 PM' }]`. Empty shows "Message us to check today's availability." |
| **Phone / email** | `site.ts` → `phone`, `email` | Hidden while `null`. |
| **Live website address** | `site.ts` → `url` | Now `https://www.rollup-cinnamon.online`. If the domain changes, update it here so link previews and Google point to the right address. |
| **Reviews** | `src/data/testimonials.ts` | Replace the placeholders with real reviews (ask the customer first). `rating` is optional: leave it out if the review has no stars. Works with 1 to 6 reviews. |
| **Founder's note** | `src/data/content.ts` → `about.founderNote`, `founderName` | Shown as a quote in "Our story" once filled in. |
| **Any other wording** | `src/data/content.ts` | Headlines and section text. |
| **Gallery** | `src/data/gallery.ts` | Order, captions and tile `shape`. Keep the tiles adding up to a multiple of 4 cells (large = 4, tall/wide = 2, square = 1) so the grid has no gaps. |

## Photos

Product and flavor photos are easiest to change in the admin. For the other photos (hero, gallery, about):

1. Put the original photo in `assets/photos/` (JPEG or PNG, as large as you have).
2. Add or edit its entry in `scripts/images.config.mjs`. `crop` is `[left, top, width, height]` in pixels of the original; leave it out to use the whole photo.
3. Run `npm run images`. Optimized AVIF/WebP versions are written to `public/images/` (only new or changed photos are processed).
4. Use the photo's `id` in `src/data/` (e.g. `gallery.ts`).

After changing the hero photo or logo, run `npm run icons` to refresh the image shown when the site is shared (`public/og-image.jpg`, drawn from `scripts/og-image.html`).

## How ordering works

1. The customer fills a box of 4 (flavors can repeat) and adds it to the order. The order is saved in their browser, so a refresh doesn't lose it.
2. **Copy order & open Messenger** copies the order text, with a short reference like `RU-7K3F`, and opens a chat with the page (`site.links.messenger`). Messenger doesn't let websites fill in a message, so the customer pastes it and presses send; the screen tells them to. (If the browser blocks copying, the order text is shown to copy by hand.)
3. The bakery confirms the order details and total in Messenger.

---

## Publishing

`npm run build` creates the finished site in `dist/`. Upload that folder to any static host:

- **Netlify / Vercel / Cloudflare Pages**: connect the GitHub repository. Build command `npm run build`, output folder `dist`.
- **GitHub Pages** (served from a sub-folder): build with the repository name as the base path, then publish `dist/`:

  ```bash
  BASE_PATH=/Roll-Up-Cinnamons/ npm run build
  ```

The build prerenders the page, so the content, social previews and Google's business details are in the HTML before any JavaScript loads.

---

## Placeholders to confirm with the bakery

The site only states facts from the bakery's Facebook page. Everything else is a placeholder that's hidden or clearly softened until it's filled in:

- [ ] **Admin setup**: the environment variables above
- [ ] **Box of 4 price** (admin, now "Price on request")
- [ ] **Flavor names** (admin; now Classic / Cookies & Cream / Cookie Butter, named after the photos)
- [ ] **More flavors**, each with a photo (admin)
- [ ] **Cheese rolls pack sizes and prices** (admin)
- [ ] **Opening hours**: `site.ts` → `hours`
- [ ] **Phone / email**, if the bakery wants them shown: `site.ts`
- [ ] **Messenger link**: open `https://m.me/61594842145810` on a phone and check it starts a chat with Roll Up Cinnamons (`site.ts` → `links.messenger`)
- [ ] **Exact map pin**: `site.ts` → `links.directions` (now a Google Maps search for Babag 2)
- [ ] **Reviews**: `testimonials.ts` (the Facebook page has 2; ask the reviewers' permission)
- [ ] **Founder's note**: `content.ts` → `about.founderNote`
- [ ] **Original logo file**: the logo is recreated from the Facebook one; drop the original into `assets/brand/` if you want it pixel-exact

---

## Where things are

```
src/data/         content, built-in menu copy (catalog.json), photos list
src/admin/        the menu admin page (/admin/)
api/admin.js      the admin API: login, validation, saving to Supabase
api/menu.js       the live menu feed the website loads
supabase/         database setup (tables, permissions, photo bucket)
src/components/   page sections, layout, order drawer, UI pieces
src/lib/order.ts  prices, totals and the Messenger message
src/state/        the order and the box builder
scripts/          image, logo, icon and prerender build steps
assets/           original photos and logo (inputs for the scripts)
public/           files served as-is: optimized images, logo, icons
```

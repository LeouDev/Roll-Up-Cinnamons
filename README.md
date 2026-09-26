# Roll Up Cinnamons

Website for **Roll Up Cinnamons**, homemade soft cinnamon rolls in Babag 2, Lapu-Lapu City.

Visitors see the rolls, **build a box of 4** with their own mix of flavors, review the order and **send it through Messenger**. There's no payment or backend: the bakery confirms every order in the chat.

Built with Vite, React, TypeScript and Tailwind CSS. It's a single static page, so any static host can serve it.

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
| `npm run images` | Rebuild the optimized photos after adding or swapping one |
| `npm run icons` | Rebuild the favicons and the social share image (needs Google Chrome) |
| `npm run brand` | Rebuild the logo files (only if the logo itself changes) |

---

## Editing the content

All text, prices and business details live in `src/data/`. You never need to touch the layout code to change them.

| To change | Edit | Notes |
| --- | --- | --- |
| **Box price** | `src/data/products.ts` → `boxSizes` → `price` | `null` shows "Price on request" and totals say "confirmed in Messenger". Put a number in pesos (e.g. `price: 350`) and every price and total on the site updates. |
| **Box sizes** | `products.ts` → `boxSizes` | Add e.g. `{ id: 'box-6', label: 'Box of 6', rolls: 6, price: null }`; the size picker and the box drawing adapt on their own. |
| **Flavors** | `products.ts` → `flavors` | Change `name` / `note`, set `placeholderName: false` once a name is confirmed. A new flavor needs a round photo (see *Photos* below). `swatch` is the color of its little dot. |
| **Cheese rolls** | `products.ts` → `products` → Cheese Rolls → `options` | Pack size (`detail`) and `price`. |
| **Opening hours** | `src/data/site.ts` → `hours` | e.g. `[{ days: 'Mon – Sat', time: '9:00 AM – 6:00 PM' }]`. Empty shows "Message us to check today's availability." |
| **Phone / email** | `site.ts` → `phone`, `email` | Hidden while `null`. |
| **Live website address** | `site.ts` → `url` | e.g. `'https://rollupcinnamons.com'`. Turns on the canonical link and full social-preview and Google details. |
| **Reviews** | `src/data/testimonials.ts` | Replace the placeholders with real reviews (ask the customer first). `rating` is optional: leave it out if the review has no stars. Works with 1 to 6 reviews. |
| **Founder's note** | `src/data/content.ts` → `about.founderNote`, `founderName` | Shown as a quote in "Our story" once filled in. |
| **Any other wording** | `src/data/content.ts` | Headlines and section text. |
| **Gallery** | `src/data/gallery.ts` | Order, captions and tile `shape`. Keep the tiles adding up to a multiple of 4 cells (large = 4, tall/wide = 2, square = 1) so the grid has no gaps. |

## Photos

1. Put the original photo in `assets/photos/` (JPEG or PNG, as large as you have).
2. Add or edit its entry in `scripts/images.config.mjs`. `crop` is `[left, top, width, height]` in pixels of the original; leave it out to use the whole photo.
3. Run `npm run images`. Optimized AVIF/WebP versions are written to `public/images/`.
4. Use the photo's `id` in `src/data/` (e.g. a flavor's `image`).

After changing the hero photo or logo, run `npm run icons` to refresh the image shown when the site is shared (`public/og-image.jpg`, drawn from `scripts/og-image.html`).

## How ordering works

1. The customer fills a box of 4 (flavors can repeat) and adds it to the order. The order is saved in their browser, so a refresh doesn't lose it.
2. **Order via Messenger** opens a chat with the page (`site.links.messenger`) and puts the order text, with a short reference like `RU-7K3F`, in the message. It's also copied to the clipboard, because Messenger sometimes drops pre-filled text, so the customer can just paste it.
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

- [ ] **Box of 4 price**: `products.ts` → `boxSizes[0].price` (now "Price on request")
- [ ] **Flavor names**: `products.ts` → `flavors[].name` (now Classic / Cookies & Cream / Cookie Butter, named after the photos)
- [ ] **More flavors**, each with a photo: `products.ts` → `flavors`
- [ ] **Cheese rolls pack size and price**: `products.ts` → Cheese Rolls `options`
- [ ] **Opening hours**: `site.ts` → `hours`
- [ ] **Phone / email**, if the bakery wants them shown: `site.ts`
- [ ] **Live domain**: `site.ts` → `url`
- [ ] **Messenger link**: open `https://m.me/61594842145810` on a phone and check it starts a chat with Roll Up Cinnamons (`site.ts` → `links.messenger`)
- [ ] **Exact map pin**: `site.ts` → `links.directions` (now a Google Maps search for Babag 2)
- [ ] **Reviews**: `testimonials.ts` (the Facebook page has 2; ask the reviewers' permission)
- [ ] **Founder's note**: `content.ts` → `about.founderNote`
- [ ] **Original logo file**: the logo is recreated from the Facebook one; drop the original into `assets/brand/` if you want it pixel-exact

---

## Where things are

```
src/data/         content, prices, flavors, photos list (edit these)
src/components/   page sections, layout, order drawer, UI pieces
src/lib/order.ts  prices, totals and the Messenger message
src/state/        the order and the box builder
scripts/          image, logo, icon and prerender build steps
assets/           original photos and logo (inputs for the scripts)
public/           files served as-is: optimized images, logo, icons
```

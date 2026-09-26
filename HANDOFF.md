# Roll Up Cinnamons: build handoff

> **Update 27 Sep 2026:** everything in section 4 (4.1–4.13) is now built. See `README.md` for running, editing and publishing the site. The notes below describe the state at the hand-off and are kept for history.

**Status:** work in progress (paused mid-build on 26 Sep 2026 to move from the cloud session to a local Mac).
**Branch:** `claude/sharp-cori-8sbdm5` on `github.com/LeouDev/Roll-Up-Cinnamons`

Roughly **45% done**. The foundation is complete and tested: the project setup, real photos, logo, design system, all data/config, order logic, and state. So are the reusable UI pieces and the top of the page (nav, hero, marquee, menu). The Box Builder, order modal, the remaining sections, and the SEO prerender step are still to do. They're specified in detail below.

---

## 1. Get it running on your Mac

You need **Node 20.19+ or 22.12+** (`node -v`). Get it from nodejs.org or `brew install node`.

**Option A: clone from GitHub (recommended, keeps git history)**

```bash
# If ~/Roll-up-Cinnamon is empty:
git clone --branch claude/sharp-cori-8sbdm5 https://github.com/LeouDev/Roll-Up-Cinnamons.git ~/Roll-up-Cinnamon
cd ~/Roll-up-Cinnamon
npm install
npm run dev          # → http://localhost:5173
```

**Option B: from the zip** (`roll-up-cinnamons.zip`, sent in the chat)

```bash
unzip ~/Downloads/roll-up-cinnamons.zip -d ~/Roll-up-Cinnamon
cd ~/Roll-up-Cinnamon
npm install
npm run dev
```

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server with hot reload |
| `npm run build` | Typecheck + production build into `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run typecheck` | TypeScript only |
| `npm run images` | Rebuild optimized photos from `assets/photos` (see `scripts/images.config.mjs`) |
| `npm run brand` | Rebuild the logo files (only if the logo changes) |

What you'll see right now: the nav, hero, kraft marquee and "Fresh From The Oven" menu. The **Order now** buttons try to scroll to `#build-your-box`, which doesn't exist yet, so they do nothing until the Box Builder is built.

---

## 2. The brief (summary)

The goal is a premium, modern artisan-bakery site for a small home bakery. It should stay warm and homemade, not look like a template, and be mobile-first. The core conversion is: land → see the rolls → **build a box of 4** → review the order → **order via Messenger**. There's no payment backend.

**Hard content rule:** don't invent facts. That covers prices, flavor names, hours, phone, email, payment, delivery, founder story and reviews. Unknowns are clearly marked `PLACEHOLDER` values in `src/data/*`.

### Facts confirmed from the Facebook reference (PDF supplied by you)
- Name: **Roll Up Cinnamons**. Category: Bakery. 43 followers. **2 reviews** (text not visible).
- Intro: *"Home made soft cinnamon rolls, packed with variety of flavors"*
- Address: **Babag 2, Lapu-Lapu City, Philippines, 6015**
- Contact: **Messenger** (the page lists Messenger under Contact info). Hours exist ("Closed now") but aren't shown.
- Posts: *"Order a box of 4 with your own choice of flavors."* and *"Our home made cinnamon rolls and cheese rolls"*
- The logo says **"ROLL UP / Cinnamon / est. 2026"** on crumpled kraft paper. Your newer horizontal logo is a torn kraft strip with rust rules around "est.2026" and three rust "spark" lines.
- Photos show three toppings: a creamy frosting swirl (classic), chocolate cookie crumble (Oreo-style) and biscuit crumble with drizzle (Biscoff-style). The box-of-4 photo has 2 classic + 1 cookie crumble + 1 biscuit, **so repeat flavors are allowed**. Cheese rolls are a **separate product** (a tray of sugar-dusted rolls), not a box flavor.
- The Facebook page ID is `61594842145810`, used for the Facebook and Messenger links.

---

## 3. What has been built

### Project setup
- **Vite 8 + React 19 + TypeScript 7 + Tailwind CSS 4** (CSS-first config in `src/styles/index.css`) + **lucide-react**. There's no animation library; motion is CSS plus small hooks.
- Fonts are **self-hosted** via Fontsource (no Google requests):
  - **Fraunces** (soft axis, `SOFT 100`, weight 600, italic 500 for accents) for headlines
  - **Figtree** for body and UI
  - **Cedarville Cursive** for small handwritten accents (matches the logo's "Cinnamon")
- `index.html` has the exact requested **title and meta description**, OG/Twitter tags, a theme color, and a `<!--head-tags-->` / `<!--app-html-->` hook for the prerender step (still to do). It also sets a `.js` class with a 4-second safety net so reveal animations can never leave content hidden.
- `vite.config.ts` has a `BASE_PATH` env var, for hosting in a sub-folder (e.g. GitHub Pages).

### Real photos: `assets/` → `public/images/` (13 images, 76 files)
- The originals were extracted from the Facebook PDF: `box-trio.jpg` (kraft box, 3 rolls, the hero photo), `plate-single.jpg`, `box-of-four-top.jpg`, `cheese-rolls.jpg`, plus the brand files `logo-kraft-square.jpg` and `logo-circle.jpg`.
- `scripts/build-images.mjs` + `scripts/images.config.mjs` produce the crops, writing **AVIF + WebP** at several widths (never upscaled) and a **blurred 16px preview** for each image. They also regenerate `src/data/images.generated.ts` (typed `ImageId`).
- The crops are: product cards (4:5), three **flavor close-ups** cut from the top-down box (`flavor-classic`, `flavor-cookie-crumble`, `flavor-caramel-biscuit`), and gallery detail crops.

### Logo, recreated from your new horizontal logo
- `scripts/build-brand.mjs` builds:
  - **Torn kraft-paper strips** (`public/brand/kraft-strip*.webp`, with alpha) using the **real crumpled kraft texture** from the original logo. They're color-graded to the new golden kraft, with toasted edges, lighter torn fibers and a soft shadow.
  - The lettering, outlined as SVG (`public/brand/logo-ink.svg` for the full lockup, `logo-compact-ink.svg` for the nav). "ROLL UP" is set in **Rammetto One** with a subtle rough-edge filter; "Cinnamon" and "est.2026" in **Cedarville Cursive**; the rust rules and sparks are included.
- `src/components/brand/Logo.tsx` has two variants: `compact` (nav) and `full` (footer/about). The logo loads no web fonts, about 3–6 KB gzipped plus the paper WebP.
- Note: opentype.js `toPathData()` emits `NaN` on some glyphs, so the script serializes paths itself.

### Design system: `src/styles/index.css`
- **Colors** (Tailwind tokens, default palette removed on purpose so nothing off-brand creeps in): `cream #fbf5ec` (page), `paper`, `oat`, `sand`, `kraft #d09c68`, `kraft-deep`, `caramel`, `toast`, `apricot #f5b07a`, `rust #a4502a`, `cinnamon #6e3418` (primary buttons), `cinnamon-deep`, `chocolate #2a190f` (text), `espresso` (footer), `cocoa`, `muted`.
- **Utilities:**
  - Layout and type: `container-page` (max 82rem, fluid gutters 20/32/48px), `eyebrow`, `text-h2`, `text-h3`, `text-lead` (fluid clamp sizes), `italic-accent`, `script`
  - Surfaces: `grain` (SVG noise), `kraft` (CSS kraft surface), `torn-edges` (torn-paper top/bottom edges via mask, `src/assets/torn-edge.svg`, tiles seamlessly)
  - Links: `link-underline`
- **Motion:**
  - Scroll reveal: `[data-reveal]`, driven by one shared IntersectionObserver
  - Hero entrance: CSS-only `animate-rise`, `animate-settle` and `animate-float-in`, which run before JS so LCP isn't delayed
  - Micro-interactions: `animate-drop-in` (a roll dropping into the box), `animate-pop`, `animate-nudge`
  - Marquee: `animate-marquee`
  - Dialogs: sheet, drawer, fade and zoom keyframes
  - Everything respects `prefers-reduced-motion`.

### Data (single source of truth): `src/data/`
- `site.ts` holds the name, tagline, est. 2026, address, and links (Facebook, reviews tab, Messenger `m.me/61594842145810`, a Google Maps search for the barangay). It also holds the PLACEHOLDER `phone`, `email`, `hours` and `url` (live domain), plus the `navigation` list (hash links, ready to become routes).
- `products.ts` holds:
  - `currency` (₱)
  - `boxSizes`: Box of 4, `price: null`, PLACEHOLDER
  - `flavors`, with **placeholder names** Classic, Cookies & Cream and Cookie Butter, named after the photos and flagged `placeholderName: true`, plus a visual note and a swatch color
  - `products`: Cinnamon Rolls (→ builder) and Cheese Rolls (→ options sheet; pack size and price are placeholders)
  - `price: null` shows "Price on request" and the total "confirmed in Messenger". Set a number and every price and total updates.
- `content.ts` holds all the section copy. The About section has PLACEHOLDER `founderNote` / `founderName`, which are hidden until filled.
- `gallery.ts` holds 8 real photos with alt text, captions and a tile `shape` (tall/wide/square/large).
- `testimonials.ts` holds 2 placeholder reviews ("Customer review will appear here." / "Customer Name"), easy to replace.

### Logic and state
- `src/lib/order.ts` holds the pure order functions:
  - Money and totals: SSR-safe `formatPrice`, `priceLabel`, `unitPrice`/`lineTotal`, `orderTotal` (with `complete: false` while any price is null)
  - Box helpers: `flavorBreakdown`, `boxKey` (identical boxes merge into one line)
  - Persistence: `sanitizeLines` (validates saved orders)
  - Messenger hand-off: `orderReference()` (e.g. `RU-7K3F`), `buildOrderMessage()` (the text sent to Messenger) and `messengerUrl()`
- `src/state/order.tsx` (`OrderProvider`/`useOrder`) holds the cart lines (box and product) and add/setQty/remove/clear. It persists to localStorage **after hydration** and manages the order modal's open/close state and `addedTick` for the cart "pop".
- `src/state/builder.tsx` (`BuilderProvider`/`useBuilder`) holds Build Your Box state. Slots are positional, like a real box: removing a roll leaves a gap and the next pick fills it. It exposes `add`, `removeOne`, `removeAt`, `surprise` (random fill), `reset`, `justFilled` (slots to animate), and `inView` for the mobile bar.
- `src/lib/hooks.ts` has `useScrolled`, `useInView`, `useActiveSection` (scroll-spy) and `scrollToId`.

### UI primitives: `src/components/ui/`
- `Picture`: `<picture>` with AVIF/WebP, lazy by default, `priority` for the hero, blurred preview background, intrinsic width/height (no layout shift).
- `Button` / `ButtonLink` / `ArrowNudge`: pill buttons in primary, secondary, light, outline-light and kraft variants, sizes sm/md/lg.
- `Dialog`: native `<dialog>`, so focus trap, Esc and the inert page come for free. The `sheet` variant is a bottom sheet on phones and a right drawer from `md`; there are also `center` and `full` variants. It has animated open/close, backdrop click, and children render only while open.
- `Reveal` + `useRevealObserver`, `SectionHeading` (eyebrow, H2, subtitle), `Stepper` (44px thumb-friendly −/+).
- `Stamp`: circular "HOMEMADE · SOFT CINNAMON ROLLS · EST. 2026" badge that rotates slightly on scroll.
- `icons.tsx`: `SwirlIcon` (the brand swirl, used instead of the 🍥 emoji), `FacebookIcon`, `MessengerIcon`.

### Sections done
- **Navbar** (`layout/Navbar.tsx`): sticky, turns frosted on scroll, scroll-spy underline, logo, links, and an "Order now" button that becomes "Your order (n)" with a pop once the cart has items. On mobile it has a full-screen menu (big serif links, Order button, address, Messenger and Facebook).
- **Hero** (`sections/Hero.tsx`):
  - The H1 includes the eyebrow "Homemade cinnamon rolls · Lapu-Lapu City", which keeps it good for SEO. The headline is "Soft. Warm. *Rolled with love.*"
  - The arch-framed hero photo, CTAs and a "Box of 4 · choose your own flavors" flavor stack.
  - On phones the order is headline → big photo → text, so the photo is in the first screen.
  - Desktop adds the stamp, an overlapping second photo and a handwritten note.
- **Marquee** (`sections/Marquee.tsx`): a slow, tilted kraft ribbon (decorative, `aria-hidden`).
- **Fresh From The Oven** (`sections/ProductSection.tsx`, `product/ProductCard.tsx`, `product/ProductOptions.tsx`): two large editorial cards, the second offset for asymmetry, and the whole card is clickable. "View options" on Cinnamon Rolls scrolls to the builder. On Cheese Rolls it opens an options sheet with a quantity stepper and "Add to order", then opens the order.
- **App shell:** `main.tsx` hydrates if prerendered and renders otherwise. `App.tsx` holds the providers, a skip link and the layout. `pages/HomePage.tsx` lists the sections in page order, with TODO comments for the missing ones.

---

## 4. What's left, in build order

Page order: Hero → Marquee → Menu (`#menu`) → **Build Your Box (`#build-your-box`)** → Why Roll Up → Gallery (`#gallery`) → About (`#about`) → Testimonials → Location (`#contact`) → Final CTA → Footer.
Nav scroll-spy ids: `top, menu, about, gallery, contact`.

### 4.1 BoxBuilder (`src/components/sections/BoxBuilder.tsx`, the most important section)
- The section has id `build-your-box`, an **oat background with `grain` + `torn-edges`**, so it reads like a torn kraft sheet on the page.
- Heading: eyebrow "Box of 4", **H2 "Build your box"**, subtitle **"Four rolls. Your favorites. One box."**, plus a script note "pick any four!" in rust.
- **Box visual:** a top-down kraft box (`kraft` utility, inset shadows for the walls, a slightly rotated parchment liner like the real box) with a 2×2 grid of round slots.
  - Columns: `rolls <= 4 ? 2 : rolls <= 9 ? 3 : 4`.
  - Empty slot: dashed ring with its number.
  - Filled slot: the flavor's round photo with `animate-drop-in`, staggered 90ms for `justFilled`. Tapping a filled slot calls `removeAt(i)`.
- **Status row:** "Selected ● ● ● ○" where the dots use each slot's flavor `swatch`, and "Remaining: 2 selections" → "Box full — ready to add!".
- **Box size:** fieldset "Box size" with pill radios from `boxSizes` (today just **[ 4 rolls ]**).
- **Flavors:** each flavor is one option. On mobile it's a row (photo, name/note, `Stepper`); from `sm` it's a tile in a 3-column grid (big round photo, name, note, stepper).
  - Tapping the photo or name adds one, with a count badge (`×2`) that pops.
  - The selected state gets a cinnamon border.
  - If the box is full, apply `animate-nudge` to the box and show "Your box is full — tap a roll to swap it."
- **Actions:** "Mix it up" (Shuffle icon → `surprise`), "Start over" (RotateCcw → `reset`).
- **Summary + CTA:** the flavor breakdown line, the price via `priceLabel(boxSize.price)` (or "Price confirmed in Messenger"), and **[ ADD TO ORDER ]**, disabled until full (label "Pick N more"). On click: `addBox(sizeId, slots)` → `reset()` → `openOrder()`.
- **A11y:** a visually hidden `aria-live` line, e.g. "Classic added — 3 of 4 picked." Steppers already have labels.
- Report `inView` with `useInView(ref, { rootMargin: '-20% 0px -20% 0px' })` → `setInView`.

### 4.2 OrderModal (`src/components/order/OrderModal.tsx`)
- `Dialog variant="sheet"` driven by `useOrder().isOpen`. Header "Your order" (serif) + close button.
- Lines:
  - A box line shows "Box of 4", its flavor breakdown (`1 × Classic`…) with tiny thumbnails, a qty `Stepper` (1–`MAX_QTY`), remove, and the line total.
  - A product line shows its label and detail, qty and total.
- Empty state: the swirl icon, "Your box is empty", and a [Build a box] button (close, then scroll to the builder).
- Footer: "Total ₱X", or when `!complete`, "Total confirmed in Messenger". Add the note "The bakery will confirm your order details in Messenger."
- **[ ORDER VIA MESSENGER ]** is an `<a href={messengerUrl(message)} target="_blank">`. Its `onClick` makes a reference with `orderReference()`, builds the message with `buildOrderMessage(lines, ref)` and **copies it to the clipboard** (`navigator.clipboard.writeText` in try/catch), because m.me may ignore `?text=`.
- Then show a success state: "Salamat! Your order (RU-XXXX) is copied — paste it in the chat if it isn't there already." with [Open Messenger again] and [Start a new order] (`clear()`).
- Secondary: "Add another box" (close, then scroll to the builder).

### 4.3 MobileOrderBar (`src/components/layout/MobileOrderBar.tsx`)
- Fixed bottom, `md:hidden`, padded for the safe area, cream/blur background. Add bottom padding to `<main>` or the footer so it never covers content.
- Default: a full-width pill **"[swirl] ORDER NOW"** that scrolls to the builder. With items in the cart it becomes "Review order · n", which opens the modal.
- While the builder is in view (`useBuilder().inView`): swatch dots + "3 of 4", plus [Add to order], disabled until full.
- Hide it while the final CTA or footer is on screen (optional).

### 4.4 WhyRollUp
Eyebrow "Why Roll Up", H2 "Homemade, the way it should taste." Four benefits from `content.whyRollUp`: Homemade (House icon), Fresh (Sparkles), Flavorful (Cookie), Made with love (Heart). Show a rust numeral 01–04, a serif title and one line each. The layout is 4 columns with thin vertical rules on desktop, 2×2 on tablet and stacked on mobile. No cards; keep it visually simple.

### 4.5 Gallery + Lightbox (`#gallery`)
- Header from `galleryIntro`. Use a **dense CSS grid bento**: 4 columns from `md`, 2 on mobile, square-ish row height. Shapes map to spans: tall `row-span-2`, wide `col-span-2`, large 2×2, square 1×1. Use `grid-auto-flow: dense`, soft radius around 1rem (used sparingly), and hover scale 1.04 with a small expand icon.
- Each tile is a `<button>` that opens the **Lightbox**: `Dialog variant="full"` on a chocolate backdrop, image contained at up to 90vh, caption, "3 / 8" counter, prev/next buttons, arrow keys, swipe on touch, and preloading of neighbors.
- All gallery images `loading="lazy"`.

### 4.6 About (`#about`)
H2 "A little bit about Roll Up". Two columns: an image stack (the kraft logo square + the classic-swirl detail photo, slightly overlapped and rotated) next to `about.paragraphs`. Show `founderNote` as a pull quote **only if filled**. Sign off in script: "est. 2026 · Babag 2, Lapu-Lapu City".

### 4.7 Testimonials
Eyebrow "Kind words", H2 "What people are saying". Render `testimonials`: ★ rating (caramel, only if `rating` is set), the quote in serif italic, name and source. Avoid heavy boxed cards; use large quote marks and hairline dividers. The layout should handle 1–6 entries. Add a "Follow Roll Up Cinnamons" block with [Follow on Facebook] (`FacebookIcon`) and a "Read our reviews on Facebook" link (`site.links.facebookReviews`).

### 4.8 Location (`#contact`)
- H2 **"Find your way to Roll Up"**. The address is large: "Babag 2" in serif, then "Lapu-Lapu City, Philippines 6015".
- Details: Orders via Messenger (`locationIntro.orderNote`). Hours come from `site.hours`, or `hoursFallback` when empty. Show phone and email only if set.
- Buttons: **[Get directions]** (`site.links.directions`, new tab) and **[Message us]** (`site.links.messenger`).
- Visual: no fake map, since the exact pin is unknown. A kraft "shipping label" card (Roll Up Cinnamons · Babag 2 · Lapu-Lapu City 6015 · est. 2026 · swirl stamp) is on-brand. A real map embed can come later.

### 4.9 Final CTA
Full-bleed **cinnamon background, cream type**. A huge serif **"Ready to roll?"** (clamp up to ~10rem), "Pick your flavors and build your box.", and a **[Order now]** button (`light` variant). Decorate with the three round flavor photos floating around the headline, with subtle parallax. This should be one of the strongest moments on the page.

### 4.10 Footer
Espresso background. Include:
- The `full` logo and the tagline "Homemade soft cinnamon rolls, packed with variety of flavors."
- The location "Babag 2, Lapu-Lapu City, Philippines"
- Links: Home, Menu, About, Gallery, Contact
- Facebook
- "© 2026 Roll Up Cinnamons"

An optional giant outlined "ROLL UP" wordmark can sit at the bottom.

### 4.11 SEO, prerender and performance
- `src/entry-server.tsx` exports `render()` using `renderToString(<StrictMode><App/></StrictMode>)` and also `site`.
- `scripts/prerender.mjs` injects the HTML into `<!--app-html-->` in `dist/index.html`. From `site.url` (only when set) it injects the canonical link, `og:url` and an absolute `og:image` into `<!--head-tags-->`. It adds **`Bakery` JSON-LD with confirmed facts only**: name, description, address (`streetAddress: Babag 2`, `addressLocality: Lapu-Lapu City`, `postalCode: 6015`, `addressCountry: PH`), `sameAs` Facebook, logo and image. There's **no** phone, hours or priceRange until they're known. It also preloads the latin Fraunces (normal and italic) and Figtree woff2 files, then deletes `dist-ssr`.
- Then restore the full build script: `"build": "tsc --noEmit && vite build && vite build --ssr src/entry-server.tsx --outDir dist-ssr && node scripts/prerender.mjs"`.
- Create in `public/`:
  - `favicon.svg`: kraft circle with a chocolate "R", matching the brand's "R" avatar
  - `favicon-32.png` and `apple-touch-icon.png` (180px)
  - `og-image.jpg` (1200×630, box-trio photo + logo on cream; render it with Playwright from an HTML template)
  - `site.webmanifest` and `robots.txt`
  - `index.html` already links to all of these.
- The production JS is about 85 KB gzipped (mostly React). Keep new sections free of new dependencies.

### 4.12 QA and polish
- Screenshot at **375, 390, 430, 768, 1024, 1280 and 1440** px. Check there are no console errors, **no horizontal overflow**, the sticky bar doesn't cover content, and the dialogs, focus and keyboard work.
- Known polish items from the last screenshots:
  - Desktop hero: the handwritten note "three flavors, one box!" (`xl` only) sits **on top of the photo** and is hard to read. Move it into the free space left of the arch, or drop it.
  - Desktop hero: the overlapping second photo runs past the first screen on 900px-tall screens. Pull it up or shrink it.
  - Mobile hero: the headline wraps "Rolled / with love." A slightly smaller size would give "Rolled with / love." Taste call.
  - Confirm the tilted marquee's edges never show gaps at 375px.

### 4.13 README.md (for the owner)
Cover how to edit prices, flavors, hours and reviews (`src/data/*`), how to swap photos (`npm run images`), how to deploy (any static host: Netlify, Vercel, Cloudflare Pages, or GitHub Pages with `BASE_PATH`), and the checklist of placeholders below.

---

## 5. Placeholders to confirm with the bakery

| What | Where | Now |
| --- | --- | --- |
| Box of 4 price | `src/data/products.ts` → `boxSizes[0].price` | `null` ("Price on request") |
| Flavor names | `products.ts` → `flavors[].name` | Classic / Cookies & Cream / Cookie Butter (named after the photos) |
| More flavors | `products.ts` → `flavors` (+ photo) | 3 shown in the photos |
| Cheese rolls pack size and price | `products.ts` → `products[1].options` | "Pack size confirmed in Messenger", `null` |
| Opening hours | `src/data/site.ts` → `hours` | empty; shows "Message us to check today's availability" |
| Phone / email | `site.ts` | `null` (hidden) |
| Live domain | `site.ts` → `url` | empty (canonical, OG and JSON-LD URL are skipped) |
| Messenger link | `site.ts` → `links.messenger` | `m.me/61594842145810`; **verify** it opens the page chat |
| Exact map pin | `site.ts` → `links.directions` | Google Maps search for "Babag 2, Lapu-Lapu City" |
| Reviews | `src/data/testimonials.ts` | 2 placeholders (the page has 2 reviews); ask the reviewers' permission |
| Founder note | `src/data/content.ts` → `about.founderNote` | empty (hidden) |
| Original logo file | `assets/brand/` | Logo is recreated as vector + real kraft texture; drop in the original PNG if you want it pixel-exact |

---

## 6. Supabase: an open question, nothing built

Supabase details were pasted into the chat without instructions. **They were not used or stored anywhere in this repo.** An attempted read-only check of the project was blocked by the session's safety rules.

- **Please rotate the database password** (Supabase → Project Settings → Database → Reset password), since it was shared in plain text. Keep secrets out of the repo. Only the *publishable* key may live in frontend env vars (`VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` in `.env.local`, which is already gitignored).
- Proposed optional use: **save each order request** when "Order via Messenger" is clicked. That means an `orders` table (reference, lines JSON, total, created_at) with RLS allowing anonymous **insert only**, done via a small `fetch` to the REST API with no supabase-js dependency, and never blocking the Messenger flow. Decide whether you want this before building it.

---

## 7. Suggested prompt to continue with Claude Code locally

> Read HANDOFF.md, then continue the Roll Up Cinnamons build from section 4 in order, starting with 4.1 BoxBuilder. Reuse the existing design tokens, data files and UI primitives, and don't invent business facts. After each section run `npm run typecheck` and check it in the browser at 390px and 1440px.

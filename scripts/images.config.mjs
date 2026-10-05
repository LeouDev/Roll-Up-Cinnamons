/**
 * Image pipeline config — every photo used on the site is listed here.
 *
 * To swap or add a photo:
 *   1. Put the original in assets/photos/ (JPEG or PNG, the bigger the better).
 *   2. Add or edit an entry below. `crop` is [left, top, width, height] in
 *      pixels of the ORIGINAL file (leave it out to use the whole photo).
 *   3. Run `npm run images` — optimized AVIF/WebP files land in
 *      public/images/ and src/data/images.generated.ts is rewritten.
 *   4. Reference the photo by its `id` in src/data/*.ts.
 *
 * Widths larger than the (cropped) source are skipped automatically, so
 * nothing is ever upscaled.
 *
 * Photos uploaded from the admin page need no entry here: they live in
 * Supabase Storage (bucket menu-photos) and are cropped in the browser.
 */

export default [
  // Hero — three rolls in the kraft box (Facebook post photo).
  { id: 'box-trio', src: 'assets/photos/box-trio.jpg', widths: [360, 540, 720] },

  // Single roll on a plate with the kraft box behind it.
  { id: 'plate-single', src: 'assets/photos/plate-single.jpg', widths: [360, 540, 720] },
  { id: 'plate-single-card', src: 'assets/photos/plate-single.jpg', crop: [0, 250, 720, 900], widths: [360, 540, 720] },

  // Top-down box of four.
  { id: 'box-of-four-top', src: 'assets/photos/box-of-four-top.jpg', widths: [480, 720, 960] },

  // Cheese rolls.
  { id: 'cheese-rolls', src: 'assets/photos/cheese-rolls.jpg', widths: [480, 720, 960] },
  { id: 'cheese-rolls-card', src: 'assets/photos/cheese-rolls.jpg', crop: [0, 40, 960, 1200], widths: [360, 540, 720, 960] },

  // Flavor close-ups for Build Your Box (cropped from the top-down box of four).
  { id: 'flavor-classic', src: 'assets/photos/box-of-four-top.jpg', crop: [482, 572, 470, 470], widths: [160, 320, 470] },
  { id: 'flavor-cookie-crumble', src: 'assets/photos/box-of-four-top.jpg', crop: [402, 196, 424, 424], widths: [160, 320, 424] },
  { id: 'flavor-caramel-biscuit', src: 'assets/photos/box-of-four-top.jpg', crop: [16, 300, 430, 430], widths: [160, 320, 430] },

  // Gallery detail crops from the kraft-box photo.
  { id: 'detail-cookie-crumble', src: 'assets/photos/box-trio.jpg', crop: [150, 410, 480, 384], widths: [360, 480] },
  { id: 'detail-caramel-biscuit', src: 'assets/photos/box-trio.jpg', crop: [190, 770, 470, 376], widths: [360, 470] },
  { id: 'detail-classic-swirl', src: 'assets/photos/box-of-four-top.jpg', crop: [40, 560, 910, 560], widths: [480, 720, 910] },

  // Original logo on kraft paper (from the Facebook page).
  { id: 'logo-kraft-square', src: 'assets/brand/logo-kraft-square.jpg', widths: [360, 540, 720] },

]

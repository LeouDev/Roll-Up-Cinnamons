/**
 * Gallery photos, in display order. All are the bakery's own photos from its
 * Facebook page. `shape` controls the tile in the asymmetric grid:
 *   'tall' (1×2) · 'wide' (2×1) · 'square' (1×1) · 'large' (2×2)
 */
import type { ImageId } from './images.generated'

export type GalleryItem = {
  image: ImageId
  alt: string
  caption: string
  shape: 'tall' | 'wide' | 'square' | 'large'
}

export const gallery: GalleryItem[] = [
  {
    image: 'box-trio',
    alt: 'Three cinnamon rolls with different toppings in a kraft box',
    caption: 'Three flavors, one kraft box',
    shape: 'tall',
  },
  {
    image: 'detail-classic-swirl',
    alt: 'Two cinnamon rolls with thick frosting swirls, seen from above',
    caption: 'The classic swirl',
    shape: 'wide',
  },
  {
    image: 'detail-cookie-crumble',
    alt: 'Close-up of a cinnamon roll covered in chocolate cookie crumbs',
    caption: 'Cookie crumble, up close',
    shape: 'square',
  },
  {
    image: 'cheese-rolls',
    alt: 'A tray of soft homemade cheese rolls dusted with sugar',
    caption: 'Soft cheese rolls',
    shape: 'large',
  },
  {
    image: 'logo-kraft-square',
    alt: 'The Roll Up Cinnamon logo on crumpled kraft paper',
    caption: 'Roll Up — est. 2026',
    shape: 'square',
  },
  {
    image: 'plate-single',
    alt: 'A cinnamon roll with biscuit crumble on a plate, a kraft box of rolls behind it',
    caption: 'One for the plate',
    shape: 'tall',
  },
  {
    image: 'detail-caramel-biscuit',
    alt: 'Close-up of a cinnamon roll topped with golden biscuit crumble and drizzle',
    caption: 'Biscuit crumble & drizzle',
    shape: 'square',
  },
  {
    image: 'box-of-four-top',
    alt: 'Four cinnamon rolls with three different toppings in a round container, seen from above',
    caption: 'A box of four, mixed',
    shape: 'square',
  },
]

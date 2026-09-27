/**
 * Menu: box sizes, flavors, products and prices.
 *
 * The data lives in catalog.json. Edit it from the admin page (/admin/) —
 * each save commits the file to GitHub and Vercel republishes the site — or
 * by hand. The facts rule still applies: only enter what the bakery confirms.
 *
 * Prices: `null` means "not set yet". The site then shows "Price on request"
 * and leaves the total to be confirmed in Messenger.
 * `available: false` shows the item as "Sold out"; it can't be ordered.
 */
import catalog from './catalog.json'
import type { ImageId } from './images.generated'

export type Price = number | null

export const currency = {
  code: 'PHP',
  symbol: '₱',
  locale: 'en-PH',
} as const

/** A box the customer fills with flavors (the Facebook page promotes a box of 4). */
export type BoxSize = {
  id: string
  label: string
  rolls: number
  price: Price
}

export type Flavor = {
  id: string
  name: string
  /** Short, visual description — no ingredient claims. */
  note: string
  image: ImageId
  imageAlt: string
  /** Color of the little "selected" dots. */
  swatch: string
  available: boolean
}

export type ProductOption = {
  id: string
  label: string
  detail?: string
  price: Price
  available: boolean
}

export type Product = {
  id: string
  name: string
  description: string
  image: ImageId
  imageAlt: string
  tag: string
  /** 'builder' scrolls to Build Your Box; 'options' opens the options sheet. */
  action: 'builder' | 'options'
  options?: ProductOption[]
  available: boolean
}

export type Catalog = { boxSizes: BoxSize[]; flavors: Flavor[]; products: Product[] }

// The admin API validates every save, and the image build step fails the
// deploy if a photo is missing, so the shape can be trusted here.
export const { boxSizes, flavors, products } = catalog as Catalog

export const getFlavor = (id: string) => flavors.find((f) => f.id === id)
export const getBoxSize = (id: string) => boxSizes.find((b) => b.id === id)
export const getProduct = (id: string) => products.find((p) => p.id === id)
/** The box-of-rolls product; when it's sold out, so is the box builder. */
export const boxProduct = products.find((p) => p.action === 'builder')

/**
 * Menu, flavors, box sizes and prices — edit here, never in the components.
 *
 * Prices: `null` means "not set yet". The site then shows "Price on request"
 * and leaves the total to be confirmed in Messenger. Set a number (in pesos)
 * and every price, line total and order total updates automatically.
 */
import type { ImageId } from './images.generated'

export type Price = number | null

export const currency = {
  code: 'PHP',
  symbol: '₱',
  locale: 'en-PH',
} as const

// ---------------------------------------------------------------------------
// Box sizes — the Facebook page promotes a "box of 4 with your own choice of
// flavors". Add more sizes here (e.g. 6) and Build Your Box picks them up.
// ---------------------------------------------------------------------------
export type BoxSize = {
  id: string
  label: string
  rolls: number
  /** PLACEHOLDER — price per box in pesos. */
  price: Price
}

export const boxSizes: BoxSize[] = [{ id: 'box-4', label: 'Box of 4', rolls: 4, price: null }]

// ---------------------------------------------------------------------------
// Flavors
//
// PLACEHOLDER NAMES: the Facebook page does not list flavor names. These
// three are named after the toppings visible in the bakery's own photos —
// confirm the real names with the bakery and edit `name` below. Add more
// flavors by adding entries (you will need a photo — see scripts/images.config.mjs).
// ---------------------------------------------------------------------------
export type Flavor = {
  id: string
  name: string
  /** Short, visual description — no ingredient claims. */
  note: string
  image: ImageId
  imageAlt: string
  /** Swatch used for the little "selected" dots. */
  swatch: string
  /** True while the name is unconfirmed. */
  placeholderName: boolean
}

export const flavors: Flavor[] = [
  {
    id: 'classic',
    name: 'Classic',
    note: 'Creamy frosting swirl',
    image: 'flavor-classic',
    imageAlt: 'Cinnamon roll with a thick swirl of creamy frosting, seen from above',
    swatch: '#ecd79a',
    placeholderName: true,
  },
  {
    id: 'cookies-and-cream',
    name: 'Cookies & Cream',
    note: 'Chocolate cookie crumble',
    image: 'flavor-cookie-crumble',
    imageAlt: 'Cinnamon roll topped with dark chocolate cookie crumbs over frosting',
    swatch: '#3b2a22',
    placeholderName: true,
  },
  {
    id: 'cookie-butter',
    name: 'Cookie Butter',
    note: 'Biscuit crumble & drizzle',
    image: 'flavor-caramel-biscuit',
    imageAlt: 'Cinnamon roll topped with golden biscuit crumble and a caramel-colored drizzle',
    swatch: '#b8712e',
    placeholderName: true,
  },
]

// ---------------------------------------------------------------------------
// Products shown in "Fresh From The Oven"
// ---------------------------------------------------------------------------
export type ProductOption = {
  id: string
  label: string
  detail?: string
  /** PLACEHOLDER — price in pesos. */
  price: Price
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
}

export const products: Product[] = [
  {
    id: 'cinnamon-rolls',
    name: 'Cinnamon Rolls',
    description: 'Soft homemade cinnamon rolls with different flavors and toppings.',
    image: 'plate-single-card',
    imageAlt: 'A homemade cinnamon roll topped with biscuit crumble on a plate, with a kraft box of rolls behind it',
    tag: 'Box of 4 · pick your flavors',
    action: 'builder',
  },
  {
    id: 'cheese-rolls',
    name: 'Cheese Rolls',
    description: 'Soft homemade cheese rolls.',
    image: 'cheese-rolls-card',
    imageAlt: 'A tray of soft homemade cheese rolls dusted with sugar',
    tag: 'Homemade',
    action: 'options',
    options: [
      {
        id: 'cheese-rolls-pack',
        label: 'Cheese rolls',
        // PLACEHOLDER — pack size isn't on the Facebook page, e.g. 'Pack of 10'.
        detail: 'Pack size confirmed in Messenger',
        price: null,
      },
    ],
  },
]

export const getFlavor = (id: string) => flavors.find((f) => f.id === id)
export const getBoxSize = (id: string) => boxSizes.find((b) => b.id === id)
export const getProduct = (id: string) => products.find((p) => p.id === id)

/**
 * Menu: box sizes, flavors, products and prices.
 *
 * The live menu is in Supabase (table public.menu), edited from the admin page
 * (/admin/). catalog.json is the copy each build starts from: the build pulls
 * it from Supabase, and the page fetches the latest from /api/menu once it's
 * open, so admin changes show without a rebuild. The facts rule still
 * applies: only enter what the bakery confirms.
 *
 * Prices: `null` means "not set yet". The site then shows "Price on request"
 * and leaves the total to be confirmed in Messenger.
 * `available: false` shows the item as "Sold out"; it can't be ordered.
 */
import { useSyncExternalStore } from 'react'
import catalog from './catalog.json'
import type { ImageId } from './images.generated'

/** A photo uploaded from the admin, served from Supabase Storage. */
export type UploadId = `upload-${string}`
export const isUpload = (id: string): id is UploadId => id.startsWith('upload-')

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
  image: ImageId | UploadId
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
  image: ImageId | UploadId
  imageAlt: string
  tag: string
  /** 'builder' scrolls to Build Your Box; 'options' opens the options sheet. */
  action: 'builder' | 'options'
  options?: ProductOption[]
  available: boolean
}

export type Catalog = { boxSizes: BoxSize[]; flavors: Flavor[]; products: Product[] }

// ---------------------------------------------------------------------------
// The current menu. These exports are live bindings: setMenu() swaps them, so
// helpers like getFlavor() always see the latest; components that show menu
// data call useMenu() to re-render when it changes. The admin API validates
// every save, so the shape can be trusted.
// ---------------------------------------------------------------------------
let menu = catalog as Catalog
export let { boxSizes, flavors, products } = menu
/** The box-of-rolls product; when it's sold out, so is the box builder. */
export let boxProduct = products.find((p) => p.action === 'builder')

const listeners = new Set<() => void>()
const subscribe = (listener: () => void) => {
  listeners.add(listener)
  return () => void listeners.delete(listener)
}

export function setMenu(next: Catalog) {
  if (JSON.stringify(next) === JSON.stringify(menu)) return
  menu = next
  ;({ boxSizes, flavors, products } = next)
  boxProduct = products.find((p) => p.action === 'builder')
  listeners.forEach((listener) => listener())
}

/** The current menu; re-renders the component when a newer one arrives. */
export const useMenu = () => useSyncExternalStore(subscribe, () => menu, () => menu)

/** Swaps in the live menu (api/menu.js) if it changed since this page was built. */
export async function refreshMenu() {
  try {
    const res = await fetch(`${import.meta.env.BASE_URL}api/menu`)
    const live = res.ok ? await res.json() : null
    if (Array.isArray(live?.catalog?.flavors)) setMenu(live.catalog)
  } catch {
    // Offline, or not on Vercel (local dev): keep the built menu.
  }
}

export const getFlavor = (id: string) => flavors.find((f) => f.id === id)
export const getBoxSize = (id: string) => boxSizes.find((b) => b.id === id)
export const getProduct = (id: string) => products.find((p) => p.id === id)

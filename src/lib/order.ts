import { boxSizes, currency, flavors, getBoxSize, getFlavor, getProduct, type Flavor, type Price } from '../data/products'
import { site } from '../data/site'

export type BoxLine = { id: string; kind: 'box'; sizeId: string; flavors: string[]; qty: number }
export type ProductLine = { id: string; kind: 'product'; productId: string; optionId: string; qty: number }
export type OrderLine = BoxLine | ProductLine

export const MAX_QTY = 20

// ---------------------------------------------------------------------------
// Money
// ---------------------------------------------------------------------------
/** Deterministic (SSR-safe) peso formatting: 1280 → "₱1,280". */
export function formatPrice(value: number): string {
  const fixed = Number.isInteger(value) ? value.toFixed(0) : value.toFixed(2)
  return currency.symbol + fixed.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

export const priceLabel = (price: Price, fallback = 'Price on request') => (price == null ? fallback : formatPrice(price))

/** Lowest configured box price — for "From ₱…" labels. */
export function startingBoxPrice(): Price {
  const prices = boxSizes.map((b) => b.price).filter((p): p is number => p != null)
  return prices.length ? Math.min(...prices) : null
}

// ---------------------------------------------------------------------------
// Lines
// ---------------------------------------------------------------------------
export function unitPrice(line: OrderLine): Price {
  if (line.kind === 'box') return getBoxSize(line.sizeId)?.price ?? null
  return getProduct(line.productId)?.options?.find((o) => o.id === line.optionId)?.price ?? null
}

export function lineTotal(line: OrderLine): Price {
  const price = unitPrice(line)
  return price == null ? null : price * line.qty
}

/** Sum of all lines. `complete` is false while any price is still a placeholder. */
export function orderTotal(lines: OrderLine[]) {
  let total = 0
  let complete = lines.length > 0
  for (const line of lines) {
    const t = lineTotal(line)
    if (t == null) complete = false
    else total += t
  }
  return { total, complete }
}

export const itemCount = (lines: OrderLine[]) => lines.reduce((n, l) => n + l.qty, 0)

/** Flavors in a box, grouped and in menu order: [{ flavor, count }]. */
export function flavorBreakdown(ids: (string | null)[]): { flavor: Flavor; count: number }[] {
  return flavors
    .map((flavor) => ({ flavor, count: ids.filter((id) => id === flavor.id).length }))
    .filter((row) => row.count > 0)
}

/** Identical boxes (same size + same flavor mix) merge into one line. */
export const boxKey = (sizeId: string, ids: string[]) => `${sizeId}:${[...ids].sort().join(',')}`

export function lineTitle(line: OrderLine): string {
  if (line.kind === 'box') return getBoxSize(line.sizeId)?.label ?? 'Box'
  const product = getProduct(line.productId)
  const option = product?.options?.find((o) => o.id === line.optionId)
  return option?.label ?? product?.name ?? 'Item'
}

/** Drops anything that no longer exists in the menu (e.g. a removed flavor). */
export function sanitizeLines(input: unknown): OrderLine[] {
  if (!Array.isArray(input)) return []
  return input.flatMap((raw): OrderLine[] => {
    if (!raw || typeof raw !== 'object') return []
    const l = raw as Record<string, unknown>
    const qty = Math.min(MAX_QTY, Math.max(1, Math.floor(Number(l.qty) || 1)))
    const id = typeof l.id === 'string' ? l.id : newId()
    if (l.kind === 'box' && typeof l.sizeId === 'string' && Array.isArray(l.flavors)) {
      const size = getBoxSize(l.sizeId)
      const ids = l.flavors.filter((f): f is string => typeof f === 'string' && !!getFlavor(f))
      const valid = size && ids.length === size.rolls && ids.length === l.flavors.length
      return valid ? [{ id, kind: 'box', sizeId: l.sizeId, flavors: ids, qty }] : []
    }
    if (l.kind === 'product' && typeof l.productId === 'string' && typeof l.optionId === 'string') {
      const valid = getProduct(l.productId)?.options?.some((o) => o.id === l.optionId)
      return valid ? [{ id, kind: 'product', productId: l.productId, optionId: l.optionId, qty }] : []
    }
    return []
  })
}

let counter = 0
export const newId = () => `l${Date.now().toString(36)}${(counter++).toString(36)}${Math.random().toString(36).slice(2, 6)}`

// ---------------------------------------------------------------------------
// Messenger hand-off
// ---------------------------------------------------------------------------
/** Short, human-friendly reference the bakery and customer can both quote. */
export function orderReference(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let ref = ''
  for (let i = 0; i < 4; i++) ref += alphabet[Math.floor(Math.random() * alphabet.length)]
  return `RU-${ref}`
}

export function buildOrderMessage(lines: OrderLine[], reference: string): string {
  const out: string[] = [`Hi ${site.name}! I'd like to order (ref ${reference}):`, '']
  for (const line of lines) {
    const title = lineTitle(line)
    out.push(`• ${title} × ${line.qty}`)
    if (line.kind === 'box') {
      for (const { flavor, count } of flavorBreakdown(line.flavors)) out.push(`   – ${count} × ${flavor.name}`)
    }
  }
  const { total, complete } = orderTotal(lines)
  out.push('')
  out.push(complete ? `Total: ${formatPrice(total)}` : 'Please confirm the total. Thank you!')
  return out.join('\n')
}

export function messengerUrl(message?: string): string {
  const base = site.links.messenger
  return message ? `${base}?text=${encodeURIComponent(message)}` : base
}

import { createContext, use, useCallback, useEffect, useMemo, useReducer, useRef, useState, type ReactNode } from 'react'
import { MAX_QTY, boxKey, newId, sanitizeLines, type OrderLine } from '../lib/order'

const STORAGE_KEY = 'rollup:order:v1'

type Action =
  | { type: 'addBox'; sizeId: string; flavors: string[] }
  | { type: 'addProduct'; productId: string; optionId: string; qty: number }
  | { type: 'setQty'; id: string; qty: number }
  | { type: 'remove'; id: string }
  | { type: 'clear' }
  | { type: 'restore'; lines: OrderLine[] }

const clampQty = (n: number) => Math.min(MAX_QTY, Math.max(1, n))

function reducer(lines: OrderLine[], action: Action): OrderLine[] {
  switch (action.type) {
    case 'addBox': {
      const key = boxKey(action.sizeId, action.flavors)
      const same = lines.find((l) => l.kind === 'box' && boxKey(l.sizeId, l.flavors) === key)
      if (same) return lines.map((l) => (l === same ? { ...l, qty: clampQty(l.qty + 1) } : l))
      return [...lines, { id: newId(), kind: 'box', sizeId: action.sizeId, flavors: [...action.flavors], qty: 1 }]
    }
    case 'addProduct': {
      const same = lines.find(
        (l) => l.kind === 'product' && l.productId === action.productId && l.optionId === action.optionId,
      )
      if (same) return lines.map((l) => (l === same ? { ...l, qty: clampQty(l.qty + action.qty) } : l))
      return [
        ...lines,
        { id: newId(), kind: 'product', productId: action.productId, optionId: action.optionId, qty: clampQty(action.qty) },
      ]
    }
    case 'setQty':
      return lines.map((l) => (l.id === action.id ? { ...l, qty: clampQty(action.qty) } : l))
    case 'remove':
      return lines.filter((l) => l.id !== action.id)
    case 'clear':
      return []
    case 'restore':
      return action.lines
  }
}

type OrderContextValue = {
  lines: OrderLine[]
  addBox: (sizeId: string, flavors: string[]) => void
  addProduct: (productId: string, optionId: string, qty?: number) => void
  setQty: (id: string, qty: number) => void
  remove: (id: string) => void
  clear: () => void
  isOpen: boolean
  openOrder: () => void
  closeOrder: () => void
  /** Bumps every time something is added — drives the little cart "pop". */
  addedTick: number
}

const OrderContext = createContext<OrderContextValue | null>(null)

export function OrderProvider({ children }: { children: ReactNode }) {
  const [lines, dispatch] = useReducer(reducer, [])
  const [isOpen, setOpen] = useState(false)
  const [addedTick, setAddedTick] = useState(0)
  const restored = useRef(false)

  // Restore a saved order after hydration (never during render — keeps the
  // prerendered HTML and the first client render identical).
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY)
      if (saved) dispatch({ type: 'restore', lines: sanitizeLines(JSON.parse(saved)) })
    } catch {
      /* storage unavailable (private mode) — start empty */
    }
    restored.current = true
  }, [])

  useEffect(() => {
    if (!restored.current) return
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines))
    } catch {
      /* ignore */
    }
  }, [lines])

  const addBox = useCallback((sizeId: string, flavors: string[]) => {
    dispatch({ type: 'addBox', sizeId, flavors })
    setAddedTick((t) => t + 1)
  }, [])
  const addProduct = useCallback((productId: string, optionId: string, qty = 1) => {
    dispatch({ type: 'addProduct', productId, optionId, qty })
    setAddedTick((t) => t + 1)
  }, [])
  const setQty = useCallback((id: string, qty: number) => dispatch({ type: 'setQty', id, qty }), [])
  const remove = useCallback((id: string) => dispatch({ type: 'remove', id }), [])
  const clear = useCallback(() => dispatch({ type: 'clear' }), [])
  const openOrder = useCallback(() => setOpen(true), [])
  const closeOrder = useCallback(() => setOpen(false), [])

  const value = useMemo(
    () => ({ lines, addBox, addProduct, setQty, remove, clear, isOpen, openOrder, closeOrder, addedTick }),
    [lines, addBox, addProduct, setQty, remove, clear, isOpen, openOrder, closeOrder, addedTick],
  )
  return <OrderContext value={value}>{children}</OrderContext>
}

export function useOrder() {
  const ctx = use(OrderContext)
  if (!ctx) throw new Error('useOrder must be used inside <OrderProvider>')
  return ctx
}

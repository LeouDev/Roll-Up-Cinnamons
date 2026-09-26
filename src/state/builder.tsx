import { createContext, use, useCallback, useMemo, useState, type ReactNode } from 'react'
import { boxSizes, flavors } from '../data/products'

/**
 * Build Your Box state. Lives in context (not inside <BoxBuilder>) so the
 * mobile bottom bar can show progress and "Add to order" while the builder
 * is on screen.
 *
 * Slots are positional: taking a roll out leaves a gap, and the next pick
 * fills the first empty slot — like a real box.
 */
type BuilderContextValue = {
  sizeId: string
  setSizeId: (id: string) => void
  capacity: number
  slots: (string | null)[]
  picked: number
  remaining: number
  isFull: boolean
  countOf: (flavorId: string) => number
  add: (flavorId: string) => boolean
  removeOne: (flavorId: string) => void
  removeAt: (index: number) => void
  surprise: () => void
  reset: () => void
  inView: boolean
  setInView: (v: boolean) => void
  /** Slots filled by the latest action — they get the drop-in animation. */
  justFilled: number[]
}

const BuilderContext = createContext<BuilderContextValue | null>(null)

const emptySlots = (n: number) => Array.from({ length: n }, () => null as string | null)

export function BuilderProvider({ children }: { children: ReactNode }) {
  const [sizeId, setSize] = useState(boxSizes[0].id)
  const capacity = boxSizes.find((b) => b.id === sizeId)?.rolls ?? 4
  const [slots, setSlots] = useState<(string | null)[]>(() => emptySlots(capacity))
  const [inView, setInView] = useState(false)
  const [justFilled, setJustFilled] = useState<number[]>([])

  const setSizeId = useCallback((id: string) => {
    const rolls = boxSizes.find((b) => b.id === id)?.rolls ?? 4
    setSize(id)
    setSlots((prev) => {
      const kept = prev.filter(Boolean).slice(0, rolls)
      return [...kept, ...emptySlots(rolls - kept.length)]
    })
  }, [])

  const add = useCallback(
    (flavorId: string) => {
      const index = slots.indexOf(null)
      if (index === -1) return false
      setSlots(slots.map((s, i) => (i === index ? flavorId : s)))
      setJustFilled([index])
      return true
    },
    [slots],
  )

  const removeOne = useCallback((flavorId: string) => {
    setSlots((prev) => {
      const index = prev.lastIndexOf(flavorId)
      return index === -1 ? prev : prev.map((s, i) => (i === index ? null : s))
    })
    setJustFilled([])
  }, [])

  const removeAt = useCallback((index: number) => {
    setSlots((prev) => prev.map((s, i) => (i === index ? null : s)))
    setJustFilled([])
  }, [])

  const surprise = useCallback(() => {
    setJustFilled(slots.flatMap((s, i) => (s ? [] : [i])))
    setSlots(slots.map((s) => s ?? flavors[Math.floor(Math.random() * flavors.length)].id))
  }, [slots])

  const reset = useCallback(() => {
    setSlots(emptySlots(capacity))
    setJustFilled([])
  }, [capacity])

  const value = useMemo(() => {
    const picked = slots.filter(Boolean).length
    return {
      sizeId,
      setSizeId,
      capacity,
      slots,
      picked,
      remaining: capacity - picked,
      isFull: picked === capacity,
      countOf: (id: string) => slots.filter((s) => s === id).length,
      add,
      removeOne,
      removeAt,
      surprise,
      reset,
      inView,
      setInView,
      justFilled,
    }
  }, [sizeId, setSizeId, capacity, slots, add, removeOne, removeAt, surprise, reset, inView, justFilled])

  return <BuilderContext value={value}>{children}</BuilderContext>
}

export function useBuilder() {
  const ctx = use(BuilderContext)
  if (!ctx) throw new Error('useBuilder must be used inside <BuilderProvider>')
  return ctx
}

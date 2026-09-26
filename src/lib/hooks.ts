import { useEffect, useState, type RefObject } from 'react'

/** True once the page has scrolled past `offset` px. */
export function useScrolled(offset = 8) {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > offset)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [offset])
  return scrolled
}

/** Reports whether an element is on screen. */
export function useInView<T extends Element>(ref: RefObject<T | null>, options: IntersectionObserverInit = {}) {
  const [inView, setInView] = useState(false)
  const { root = null, rootMargin = '0px', threshold = 0 } = options
  useEffect(() => {
    const el = ref.current
    if (!el || !('IntersectionObserver' in window)) return
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { root, rootMargin, threshold })
    io.observe(el)
    return () => io.disconnect()
  }, [ref, root, rootMargin, threshold])
  return inView
}

/** Scroll-spy: the id of the section currently under the navigation bar. */
export function useActiveSection(ids: string[]) {
  const [active, setActive] = useState<string>(ids[0] ?? '')
  const key = ids.join('|')
  useEffect(() => {
    const sections = key
      .split('|')
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => !!el)
    if (!sections.length || !('IntersectionObserver' in window)) return
    const visible = new Map<string, number>()
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) visible.set(e.target.id, e.isIntersecting ? e.intersectionRatio : 0)
        const best = [...visible.entries()].sort((a, b) => b[1] - a[1])[0]
        if (best && best[1] > 0) setActive(best[0])
      },
      { rootMargin: '-30% 0px -55% 0px', threshold: [0, 0.01, 0.25, 0.5, 1] },
    )
    sections.forEach((s) => io.observe(s))
    return () => io.disconnect()
  }, [key])
  return active
}

/** Smooth-scrolls to an element id, accounting for the sticky nav. */
export function scrollToId(id: string) {
  const el = document.getElementById(id)
  if (!el) return
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
}

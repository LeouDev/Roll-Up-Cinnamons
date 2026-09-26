import { useEffect, type CSSProperties, type ElementType, type ReactNode } from 'react'

type RevealProps = {
  as?: ElementType
  /** Stagger delay in ms. */
  delay?: number
  variant?: 'rise' | 'fade' | 'zoom'
  className?: string
  style?: CSSProperties
  children?: ReactNode
  id?: string
}

/** Fades/rises its content in the first time it scrolls into view. */
export function Reveal({ as: Tag = 'div', delay = 0, variant = 'rise', className, style, children, id }: RevealProps) {
  return (
    <Tag
      id={id}
      data-reveal={variant === 'rise' ? '' : variant}
      className={className}
      style={{ '--reveal-delay': `${delay}ms`, ...style } as CSSProperties}
    >
      {children}
    </Tag>
  )
}

/**
 * One shared IntersectionObserver for every [data-reveal] element. Marks them
 * with a data attribute React never manages, so re-renders can't undo it.
 */
export function useRevealObserver() {
  useEffect(() => {
    const show = (el: Element) => el.setAttribute('data-visible', '')
    const targets = document.querySelectorAll('[data-reveal]')
    if (!('IntersectionObserver' in window)) {
      targets.forEach(show)
      return
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            show(entry.target)
            io.unobserve(entry.target)
          }
        }
      },
      { rootMargin: '0px 0px -6% 0px', threshold: 0.1 },
    )
    targets.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])
}

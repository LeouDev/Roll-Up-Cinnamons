import { useEffect, useId, useRef, type CSSProperties } from 'react'
import { SwirlIcon } from './icons'

type StampProps = {
  text: string
  className?: string
  /** Rotate gently as the page scrolls (respects reduced motion). */
  scrollSpin?: boolean
  style?: CSSProperties
}

/** Circular text badge with the swirl in the middle — like a bakery stamp. */
export function Stamp({ text, className = '', scrollSpin = false, style }: StampProps) {
  const id = useId()
  const ringRef = useRef<SVGGElement>(null)

  useEffect(() => {
    if (!scrollSpin || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let frame = 0
    const update = () => {
      frame = 0
      ringRef.current?.setAttribute('transform', `rotate(${(window.scrollY * 0.08) % 360} 100 100)`)
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(frame)
    }
  }, [scrollSpin])

  return (
    // Positioning comes from the caller (e.g. `absolute …`); defaults to relative.
    <div className={`aspect-square ${/\b(absolute|fixed|sticky)\b/.test(className) ? '' : 'relative'} ${className}`} style={style} aria-hidden="true">
      <svg viewBox="0 0 200 200" className="absolute inset-0 size-full">
        <defs>
          <path id={`${id}-ring`} d="M100,100 m-74,0 a74,74 0 1,1 148,0 a74,74 0 1,1 -148,0" />
        </defs>
        <circle cx="100" cy="100" r="98" className="fill-apricot" />
        <circle cx="100" cy="100" r="92" fill="none" className="stroke-cinnamon/25" strokeWidth="1" strokeDasharray="2 5" />
        <g ref={ringRef}>
          <text className="fill-cinnamon font-sans text-[15.5px] font-bold uppercase" letterSpacing="3.4">
            <textPath href={`#${id}-ring`} textLength="462" lengthAdjust="spacing">
              {text}
            </textPath>
          </text>
        </g>
      </svg>
      <div className="absolute inset-[31%] grid place-items-center rounded-full bg-cinnamon text-cream">
        <SwirlIcon size="62%" strokeWidth={2.3} />
      </div>
    </div>
  )
}

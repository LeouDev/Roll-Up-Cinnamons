import { useEffect, useState } from 'react'
import { getFlavor } from '../../data/products'
import { scrollToId } from '../../lib/hooks'
import { itemCount } from '../../lib/order'
import { useBuilder } from '../../state/builder'
import { useOrder } from '../../state/order'
import { ArrowNudge, Button } from '../ui/Button'
import { SwirlIcon } from '../ui/icons'

/** Phones only: the order button within thumb reach, and box progress while building. */
export function MobileOrderBar() {
  const { lines, addBox, openOrder } = useOrder()
  const box = useBuilder()
  const count = itemCount(lines)
  const [hidden, setHidden] = useState(false)

  // Step aside for the final call to action and the footer.
  useEffect(() => {
    const targets = ['final-cta', 'footer'].map((id) => document.getElementById(id)).filter((el): el is HTMLElement => !!el)
    const onScreen = new Set<Element>()
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) onScreen.add(e.target)
        else onScreen.delete(e.target)
      }
      setHidden(onScreen.size > 0)
    })
    targets.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])

  return (
    <div
      inert={hidden}
      className={`fixed inset-x-0 bottom-0 z-30 border-t border-chocolate/10 bg-cream/90 px-(--gutter) pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-md backdrop-saturate-150 transition-transform duration-500 ease-(--ease-soft) md:hidden ${
        hidden ? 'translate-y-full' : ''
      }`}
    >
      {box.inView ? (
        <div className="flex h-14 items-center gap-3">
          <span className="flex gap-1.5" aria-hidden="true">
            {box.slots.map((id, i) => (
              <span key={i} className="size-3.5 rounded-full ring-1 ring-chocolate/25" style={{ background: id ? getFlavor(id)?.swatch : undefined }} />
            ))}
          </span>
          <span className="text-sm font-bold tabular-nums">
            {box.picked} of {box.capacity}
          </span>
          <Button
            className="ml-auto"
            disabled={!box.isFull}
            onClick={() => {
              addBox(box.sizeId, box.slots as string[])
              box.reset()
              openOrder()
            }}
          >
            Add to order <ArrowNudge />
          </Button>
        </div>
      ) : (
        <Button size="lg" className="w-full" onClick={count ? openOrder : () => scrollToId('build-your-box')}>
          {count ? (
            <>
              Review order · {count}
              <span className="sr-only"> {count === 1 ? 'item' : 'items'}</span>
            </>
          ) : (
            <>
              <SwirlIcon size={18} strokeWidth={2.4} /> Order now
            </>
          )}
        </Button>
      )}
    </div>
  )
}

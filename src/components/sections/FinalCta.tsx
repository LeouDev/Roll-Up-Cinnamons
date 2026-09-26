import type { CSSProperties } from 'react'
import { finalCta } from '../../data/content'
import { flavors } from '../../data/products'
import { scrollToId } from '../../lib/hooks'
import { itemCount } from '../../lib/order'
import { useOrder } from '../../state/order'
import { ArrowNudge, Button } from '../ui/Button'
import { Picture } from '../ui/Picture'

// Where each flavor photo floats, and how far it drifts as the page scrolls.
const floats = [
  { at: 'top-[7%] left-[3%] w-24 -rotate-6 md:top-[13%] md:left-[7%] md:w-40 lg:w-48', drift: '80px' },
  { at: 'top-[5%] right-[4%] w-20 rotate-12 md:top-[9%] md:right-[11%] md:w-32', drift: '140px' },
  { at: 'bottom-[6%] right-[7%] w-28 rotate-3 md:bottom-[11%] md:right-[5%] md:w-44 lg:w-56', drift: '55px' },
]

export function FinalCta() {
  const { lines, openOrder } = useOrder()
  const words = finalCta.title.split(' ')
  const accent = words.pop()

  return (
    <section id="final-cta" aria-labelledby="cta-title" className="grain relative isolate overflow-hidden bg-cinnamon text-cream">
      {floats.slice(0, flavors.length).map((f, i) => {
        const flavor = flavors[i]
        return (
          <div key={i} aria-hidden="true" className={`animate-drift absolute -z-10 aspect-square ${f.at}`} style={{ '--drift': f.drift } as CSSProperties}>
            <div className="size-full overflow-hidden rounded-full bg-cinnamon-deep shadow-[0_28px_50px_-18px_rgb(0_0_0/0.6)] ring-4 ring-cream/10">
              <Picture image={flavor.image} alt="" sizes="(min-width: 1024px) 14rem, (min-width: 768px) 11rem, 7rem" className="size-full scale-110 object-cover" />
            </div>
          </div>
        )
      })}

      <div className="container-page py-36 text-center md:py-48">
        <h2 id="cta-title" className="text-[clamp(3.6rem,1.4rem+10vw,10rem)] leading-[0.88] tracking-[-0.035em]">
          {words.join(' ')} <span className="italic-accent text-apricot">{accent}</span>
        </h2>
        <p className="text-lead mx-auto mt-7 max-w-md text-cream/80">{finalCta.subtitle}</p>
        <Button variant="light" size="lg" className="mt-10" onClick={() => (itemCount(lines) > 0 ? openOrder() : scrollToId('build-your-box'))}>
          {finalCta.cta} <ArrowNudge />
        </Button>
      </div>
    </section>
  )
}

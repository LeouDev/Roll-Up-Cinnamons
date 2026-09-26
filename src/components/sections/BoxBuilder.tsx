import { RotateCcw, Shuffle, X } from 'lucide-react'
import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { builderIntro } from '../../data/content'
import { boxSizes, flavors, getFlavor, type Flavor } from '../../data/products'
import { useInView } from '../../lib/hooks'
import { flavorBreakdown, priceLabel } from '../../lib/order'
import { useBuilder } from '../../state/builder'
import { useOrder } from '../../state/order'
import { ArrowNudge, Button } from '../ui/Button'
import { Picture } from '../ui/Picture'
import { Reveal } from '../ui/Reveal'
import { SectionHeading } from '../ui/SectionHeading'
import { Stepper } from '../ui/Stepper'

const legend = 'mb-3 text-xs font-bold tracking-[0.16em] text-muted uppercase'

export function BoxBuilder() {
  const box = useBuilder()
  const { addBox, openOrder } = useOrder()
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref, { rootMargin: '-20% 0px -20% 0px' })
  const [status, setStatus] = useState('') // read out by screen readers
  // The "box is full" hint belongs to the box it was shown for; any change hides it.
  const [fullFor, setFullFor] = useState<typeof box.slots | null>(null)
  const [shake, setShake] = useState(false)

  const { setInView } = box
  useEffect(() => {
    setInView(inView)
  }, [inView, setInView])

  const size = boxSizes.find((s) => s.id === box.sizeId) ?? boxSizes[0]
  const cols = box.capacity <= 4 ? 2 : box.capacity <= 9 ? 3 : 4
  const breakdown = flavorBreakdown(box.slots)
  const tally = (n: number) => `${n} of ${box.capacity} picked.`

  const pick = (f: Flavor) => {
    if (box.add(f.id)) return setStatus(`${f.name} added — ${tally(box.picked + 1)}`)
    setFullFor(box.slots)
    setShake(true)
    setStatus('Your box is full — tap a roll to swap it.')
  }
  const removed = (f: Flavor) => setStatus(`${f.name} removed — ${tally(box.picked - 1)}`)
  const addToOrder = () => {
    addBox(box.sizeId, box.slots as string[])
    box.reset()
    openOrder()
  }

  return (
    <section ref={ref} id="build-your-box" aria-labelledby="builder-title" className="grain torn-edges bg-oat py-24 md:py-32">
      <div className="container-page">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <SectionHeading id="builder-title" eyebrow={builderIntro.eyebrow} title={builderIntro.title} subtitle={builderIntro.subtitle} />
          <Reveal as="p" delay={200} className="script rotate-[-4deg] text-[1.9rem] leading-tight text-rust md:mb-4">
            {builderIntro.note}
          </Reveal>
        </div>

        <div className="mt-10 grid gap-10 md:mt-16 lg:grid-cols-[minmax(0,1fr)_22rem] lg:grid-rows-[auto_1fr] lg:gap-x-14 lg:gap-y-8 xl:grid-cols-[minmax(0,1fr)_26rem] xl:gap-x-20">
          {/* The box, seen from above */}
          <Reveal className="lg:col-start-2 lg:row-start-1">
            <div
              className={`mx-auto w-full max-w-[20rem] sm:max-w-[24rem] ${shake ? 'animate-nudge' : ''}`}
              onAnimationEnd={(e) => e.target === e.currentTarget && setShake(false)}
            >
              <div className="kraft rounded-[1.4rem] p-[5%] shadow-lift">
                <div className="relative rounded-[0.9rem] bg-kraft-deep/40 p-[6%]">
                  <div aria-hidden="true" className="grain absolute inset-[3.5%] -rotate-2 rounded-[3px] bg-paper shadow-[0_1px_3px_rgb(84_42_14/0.35)]" />
                  {/* Wall shadow falls on the liner, under the rolls */}
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_0_18px_22px_-14px_rgb(84_42_14/0.6),inset_0_-10px_16px_-12px_rgb(84_42_14/0.35),inset_14px_0_18px_-14px_rgb(84_42_14/0.45),inset_-14px_0_18px_-14px_rgb(84_42_14/0.45)]"
                  />
                  <ol aria-label="Your box" className="relative grid gap-[7%]" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
                    {box.slots.map((id, i) => {
                      const flavor = id ? getFlavor(id) : undefined
                      const drop = box.justFilled.indexOf(i)
                      return (
                        <li key={i} className="aspect-square">
                          {flavor ? (
                            <button
                              type="button"
                              onClick={() => {
                                box.removeAt(i)
                                removed(flavor)
                              }}
                              aria-label={`${flavor.name}, slot ${i + 1}. Take it out`}
                              className={`group/slot relative block size-full overflow-hidden rounded-full bg-oat shadow-[0_10px_16px_-6px_rgb(60_30_10/0.6)] ring-1 ring-chocolate/10 ${drop > -1 ? 'animate-drop-in' : ''}`}
                              style={drop > -1 ? ({ animationDelay: `${drop * 90}ms` } as CSSProperties) : undefined}
                            >
                              <Picture image={flavor.image} alt="" sizes="(min-width: 1280px) 170px, (min-width: 1024px) 140px, 40vw" className="size-full scale-110 object-cover" />
                              <span className="absolute inset-0 grid place-items-center bg-chocolate/45 text-cream opacity-0 transition-opacity duration-200 group-hover/slot:opacity-100">
                                <X className="size-7" strokeWidth={2.2} aria-hidden="true" />
                              </span>
                            </button>
                          ) : (
                            <div className="grid size-full place-items-center rounded-full border-2 border-dashed border-kraft-deep/50 font-display text-2xl text-kraft-deep/80">
                              {i + 1}
                              <span className="sr-only">, empty</span>
                            </div>
                          )}
                        </li>
                      )
                    })}
                  </ol>
                </div>
              </div>
            </div>

            <div className="mx-auto mt-5 flex max-w-[24rem] flex-wrap items-center justify-between gap-x-4 gap-y-2 text-sm">
              <p className="flex items-center gap-2.5 font-bold">
                Selected
                <span className="flex gap-1.5" aria-hidden="true">
                  {box.slots.map((id, i) => (
                    <span key={i} className="size-3 rounded-full ring-1 ring-chocolate/25" style={{ background: id ? getFlavor(id)?.swatch : undefined }} />
                  ))}
                </span>
                <span className="sr-only">{tally(box.picked)}</span>
              </p>
              <p className={fullFor === box.slots ? 'font-semibold text-rust' : 'text-cocoa'}>
                {fullFor === box.slots
                  ? 'Your box is full — tap a roll to swap it.'
                  : box.isFull
                    ? 'Box full — ready to add!'
                    : `Remaining: ${box.remaining} ${box.remaining === 1 ? 'selection' : 'selections'}`}
              </p>
            </div>
          </Reveal>

          {/* Choices */}
          <Reveal delay={80} className="@container lg:col-start-1 lg:row-span-2 lg:row-start-1">
            <fieldset>
              <legend className={legend}>Box size</legend>
              <div className="flex flex-wrap gap-2">
                {boxSizes.map((s) => (
                  <label
                    key={s.id}
                    className="inline-flex h-11 cursor-pointer items-center rounded-full border border-chocolate/20 px-5 text-sm font-bold transition-colors has-checked:border-chocolate has-checked:bg-chocolate has-checked:text-cream has-focus-visible:outline-2 has-focus-visible:outline-offset-3 has-focus-visible:outline-rust"
                  >
                    <input type="radio" name="box-size" value={s.id} checked={s.id === box.sizeId} onChange={() => box.setSizeId(s.id)} className="sr-only" />
                    {s.rolls} rolls
                  </label>
                ))}
              </div>
            </fieldset>

            <fieldset className="mt-8">
              <legend className={legend}>Flavors</legend>
              <ul className="grid gap-3 @xl:grid-cols-3 @xl:gap-4">
                {flavors.map((f) => {
                  const count = box.countOf(f.id)
                  return (
                    <li
                      key={f.id}
                      className={`relative flex items-center gap-3 rounded-[1.25rem] border bg-paper p-3 transition-[border-color,box-shadow] duration-300 @xl:flex-col @xl:gap-3 @xl:px-4 @xl:pt-6 @xl:pb-4 @xl:text-center ${
                        count ? 'border-cinnamon shadow-[inset_0_0_0_1px_var(--color-cinnamon)]' : 'border-chocolate/10 hover:border-chocolate/30'
                      }`}
                    >
                      <span className="relative shrink-0">
                        <span className="block size-14 overflow-hidden rounded-full bg-oat shadow-soft @xl:size-28">
                          <Picture image={f.image} alt="" sizes="(min-width: 640px) 112px, 56px" className="size-full scale-110 object-cover" />
                        </span>
                        {count > 0 && (
                          <span
                            key={count}
                            aria-hidden="true"
                            className="animate-pop absolute -top-1 -right-1 grid h-6 min-w-6 place-items-center rounded-full bg-cinnamon px-1.5 text-[0.7rem] font-bold text-cream shadow-soft"
                          >
                            ×{count}
                          </span>
                        )}
                      </span>
                      <span className="min-w-0 flex-1">
                        {/* Stretched over the whole card: tap the photo or name to add one */}
                        <button
                          type="button"
                          onClick={() => pick(f)}
                          aria-label={`Add ${f.name} to your box`}
                          className="text-left font-display text-[1.2rem] leading-tight after:absolute after:inset-0 after:content-[''] @xl:text-center @xl:text-[1.4rem]"
                        >
                          {f.name}
                        </button>
                        <span className="mt-0.5 block text-sm leading-snug text-muted">{f.note}</span>
                      </span>
                      <Stepper
                        value={count}
                        label={f.name}
                        onIncrement={() => pick(f)}
                        onDecrement={() => {
                          box.removeOne(f.id)
                          removed(f)
                        }}
                        className="relative z-10"
                      />
                    </li>
                  )
                })}
              </ul>
            </fieldset>

            <div className="mt-6 flex flex-wrap gap-2">
              <Button
                variant="secondary"
                size="sm"
                disabled={box.isFull}
                onClick={() => {
                  box.surprise()
                  setStatus(`Mixed it up — ${tally(box.capacity)}`)
                }}
              >
                <Shuffle className="size-4" aria-hidden="true" /> Mix it up
              </Button>
              <Button
                variant="secondary"
                size="sm"
                disabled={!box.picked}
                onClick={() => {
                  box.reset()
                  setStatus('Box cleared.')
                }}
              >
                <RotateCcw className="size-4" aria-hidden="true" /> Start over
              </Button>
            </div>
          </Reveal>

          {/* Summary */}
          <Reveal delay={120} className="lg:col-start-2 lg:row-start-2">
            <div className="mx-auto max-w-[24rem] rounded-[1.5rem] bg-paper p-6 shadow-soft lg:max-w-none">
              <div className="flex items-baseline justify-between gap-4">
                <p className="text-xs font-bold tracking-[0.16em] text-muted uppercase">{size.label}</p>
                <p className={size.price == null ? 'text-right text-sm text-muted' : 'font-display text-2xl'}>
                  {priceLabel(size.price, 'Price confirmed in Messenger')}
                </p>
              </div>
              <p className="mt-3 text-cocoa">
                {breakdown.length ? breakdown.map(({ flavor, count }) => `${count} × ${flavor.name}`).join(' · ') : 'No rolls yet — pick your first flavor.'}
              </p>
              <Button size="lg" className="mt-6 w-full" disabled={!box.isFull} onClick={addToOrder}>
                {box.isFull ? (
                  <>
                    Add to order <ArrowNudge />
                  </>
                ) : (
                  `Pick ${box.remaining} more`
                )}
              </Button>
            </div>
          </Reveal>
        </div>

        <p className="sr-only" aria-live="polite">
          {status}
        </p>
      </div>
    </section>
  )
}

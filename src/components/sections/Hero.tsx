import type { CSSProperties } from 'react'
import { hero } from '../../data/content'
import { flavors } from '../../data/products'
import { scrollToId } from '../../lib/hooks'
import { itemCount } from '../../lib/order'
import { useOrder } from '../../state/order'
import { ArrowNudge, Button, ButtonLink } from '../ui/Button'
import { SwirlIcon } from '../ui/icons'
import { Picture } from '../ui/Picture'
import { Stamp } from '../ui/Stamp'

const delay = (ms: number) => ({ '--d': `${ms}ms` }) as CSSProperties

export function Hero() {
  const { lines, openOrder } = useOrder()
  const onOrder = () => (itemCount(lines) > 0 ? openOrder() : scrollToId('build-your-box'))

  return (
    <section id="top" aria-labelledby="hero-title" className="relative isolate overflow-x-clip">
      {/* Warm glow behind the photo */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-48 right-[-20%] -z-10 size-[52rem] rounded-full bg-[radial-gradient(closest-side,rgb(245_176_122/0.3),transparent)] md:right-[-8%]"
      />

      <div className="container-page grid grid-cols-1 gap-x-10 pt-4 pb-14 md:grid-cols-12 md:grid-rows-[1fr_auto_auto_1fr] md:pt-8 md:pb-20 lg:pb-28">
        {/* Title */}
        <div className="@container md:col-span-7 md:row-start-2 lg:col-span-6">
          <h1 id="hero-title">
            <span className="eyebrow animate-rise flex items-center gap-2">
              <SwirlIcon size={15} strokeWidth={2.6} />
              {hero.eyebrow}
            </span>
            <span className="mt-4 block text-[clamp(2.8rem,15.6cqi,4.75rem)] leading-[0.92] tracking-[-0.03em] md:mt-6 md:text-[clamp(3rem,12.6cqi,7.4rem)]">
              <span className="animate-rise block" style={delay(70)}>
                {hero.titleLead}
              </span>
              <span className="italic-accent animate-rise block text-cinnamon" style={delay(150)}>
                {hero.titleAccent}
              </span>
            </span>
          </h1>
        </div>

        {/* Photo */}
        <div className="relative mt-8 md:col-span-5 md:col-start-8 md:row-span-4 md:row-start-1 md:mt-0 lg:col-span-6 lg:col-start-7">
          <div className="animate-rise relative" style={delay(120)}>
            <div className="relative aspect-[4/5] overflow-hidden rounded-t-full rounded-b-[1.75rem] bg-oat shadow-lift md:aspect-auto md:h-[clamp(30rem,calc(100svh-var(--nav-h)-5rem),47rem)] lg:ml-[8%]">
              <Picture
                image={hero.image}
                alt={hero.imageAlt}
                priority
                sizes="(min-width: 1024px) 44vw, (min-width: 768px) 40vw, 92vw"
                position="50% 64%"
                className="animate-settle size-full object-cover"
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_0_0_0_1px_rgb(42_25_15/0.08)]"
              />
            </div>

            {/* Stamp */}
            <Stamp
              text={hero.stamp}
              scrollSpin
              className="animate-float-in absolute -top-3 -right-2 w-[5.75rem] rotate-12 drop-shadow-[0_10px_18px_rgb(42_25_15/0.18)] sm:w-28 md:top-10 md:-left-10 md:right-auto lg:top-14 lg:left-[1%] lg:w-32"
              style={delay(500)}
            />

            {/* Second photo, overlapping */}
            <figure
              className="animate-float-in absolute bottom-[-3.5rem] left-[-1.5rem] hidden w-[40%] -rotate-[5deg] overflow-hidden rounded-[1.25rem] border-[6px] border-cream bg-oat shadow-lift md:block lg:bottom-[-1rem] lg:left-[-0.5rem] lg:w-[33%]"
              style={delay(420)}
            >
              <div className="aspect-[3/4]">
                <Picture
                  image={hero.secondaryImage}
                  alt={hero.secondaryImageAlt}
                  sizes="(min-width: 1024px) 16vw, 18vw"
                  position="50% 72%"
                  className="size-full object-cover"
                />
              </div>
            </figure>

            {/* Handwritten note */}
            <p
              aria-hidden="true"
              className="script animate-float-in absolute top-[46%] right-[calc(100%-1rem)] hidden -rotate-6 text-[1.65rem] leading-none whitespace-nowrap text-rust xl:block"
              style={delay(650)}
            >
              three flavors,
              <br />
              one box!
              <svg viewBox="0 0 60 40" className="mt-1 ml-auto block w-12 -scale-x-100 rotate-12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M55 4C44 18 28 28 6 30M6 30l9-8M6 30l10 5" />
              </svg>
            </p>
          </div>
        </div>

        {/* Body */}
        <div className="mt-9 md:col-span-7 md:row-start-3 md:mt-7 lg:col-span-6">
          <p className="text-lead animate-rise max-w-[31ch] text-cocoa" style={delay(230)}>
            {hero.subtitle}
          </p>
          <div className="animate-rise mt-8 flex flex-wrap items-center gap-3" style={delay(300)}>
            <Button size="lg" onClick={onOrder}>
              {hero.primaryCta} <ArrowNudge />
            </Button>
            <ButtonLink href="#menu" variant="secondary" size="lg">
              {hero.secondaryCta}
            </ButtonLink>
          </div>

          <div className="animate-rise mt-10 flex items-center gap-4 border-t border-chocolate/10 pt-6" style={delay(380)}>
            <div className="flex -space-x-3">
              {flavors.map((f) => (
                <span key={f.id} className="size-12 overflow-hidden rounded-full border-[3px] border-cream bg-oat shadow-soft">
                  <Picture image={f.image} alt="" sizes="48px" className="size-full scale-110 object-cover" />
                </span>
              ))}
            </div>
            <p className="text-sm leading-snug text-cocoa">
              <span className="block font-bold text-chocolate">Box of 4</span>
              Choose your own flavors
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

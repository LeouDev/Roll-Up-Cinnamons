import { Clock, Mail, MapPin, Phone } from 'lucide-react'
import type { ReactNode } from 'react'
import { hero, locationIntro } from '../../data/content'
import { site } from '../../data/site'
import { ButtonLink } from '../ui/Button'
import { MessengerIcon } from '../ui/icons'
import { Reveal } from '../ui/Reveal'
import { SectionHeading } from '../ui/SectionHeading'
import { Stamp } from '../ui/Stamp'

export function Location() {
  const { address } = site
  return (
    <section id="contact" aria-labelledby="contact-title" className="overflow-x-clip py-24 md:py-32">
      <div className="container-page grid items-center gap-20 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
        <div>
          <SectionHeading id="contact-title" eyebrow={locationIntro.eyebrow} title={locationIntro.title} />

          <Reveal as="address" delay={160} className="mt-10 not-italic">
            <span className="block font-display text-[clamp(3.25rem,2rem+5vw,6rem)] leading-[0.92] tracking-[-0.03em] text-cinnamon">
              {address.area}
            </span>
            <span className="text-lead mt-3 block text-cocoa">
              {address.city}, {address.country} {address.postalCode}
            </span>
          </Reveal>

          <Reveal as="dl" delay={220} className="mt-10 grid gap-x-10 gap-y-7 border-t border-chocolate/12 pt-8 sm:grid-cols-2">
            <Detail icon={<MessengerIcon size={16} />} term="Orders">
              {locationIntro.orderNote}
            </Detail>
            <Detail icon={<Clock className="size-4" />} term="Hours">
              {site.hours.length
                ? site.hours.map((h) => (
                    <span key={h.days} className="block">
                      {h.days}: {h.time}
                    </span>
                  ))
                : locationIntro.hoursFallback}
            </Detail>
            {site.phone && (
              <Detail icon={<Phone className="size-4" />} term="Phone">
                <a href={`tel:${site.phone.replace(/\s/g, '')}`} className="link-underline">
                  {site.phone}
                </a>
              </Detail>
            )}
            {site.email && (
              <Detail icon={<Mail className="size-4" />} term="Email">
                <a href={`mailto:${site.email}`} className="link-underline">
                  {site.email}
                </a>
              </Detail>
            )}
          </Reveal>

          <Reveal delay={280} className="mt-10 flex flex-wrap gap-3">
            <ButtonLink href={site.links.directions} target="_blank" rel="noopener" size="lg">
              <MapPin className="size-4" aria-hidden="true" /> Get directions
            </ButtonLink>
            <ButtonLink href={site.links.messenger} target="_blank" rel="noopener" variant="secondary" size="lg">
              <MessengerIcon size={16} /> Message us
            </ButtonLink>
          </Reveal>
        </div>

        <Reveal variant="zoom" delay={120}>
          <ShippingLabel />
        </Reveal>
      </div>
    </section>
  )
}

function Detail({ icon, term, children }: { icon: ReactNode; term: string; children: ReactNode }) {
  return (
    <div>
      <dt className="flex items-center gap-2 text-xs font-bold tracking-[0.16em] text-muted uppercase [&_svg]:text-rust">
        <span aria-hidden="true">{icon}</span>
        {term}
      </dt>
      <dd className="mt-2 text-cocoa">{children}</dd>
    </div>
  )
}

/** Decorative kraft parcel label — the address is already given above. */
function ShippingLabel() {
  const { address } = site
  return (
    <div aria-hidden="true" className="relative mx-auto w-full max-w-[25rem] rotate-2 pt-6">
      <div className="kraft rounded-[1.25rem] p-3 shadow-lift">
        <div className="rounded-[0.85rem] border-2 border-dashed border-chocolate/30 px-7 pt-7 pb-6 text-chocolate">
          <p className="eyebrow text-cinnamon">Fresh from</p>
          <p className="mt-3 font-display text-[2rem] leading-none tracking-[-0.02em]">{site.name}</p>
          <p className="mt-3 leading-snug font-medium">
            {address.area}
            <br />
            {address.city} {address.postalCode}
            <br />
            {address.country}
          </p>
          <div className="my-6 border-t-2 border-dashed border-chocolate/25" />
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="eyebrow text-cinnamon">To</p>
              <p className="script mt-2 text-[2rem] leading-none">you, with love</p>
            </div>
            <div className="h-11 w-24 shrink-0 bg-[repeating-linear-gradient(90deg,var(--color-chocolate)_0_2px,transparent_2px_4px,var(--color-chocolate)_4px_5px,transparent_5px_8px,var(--color-chocolate)_8px_11px,transparent_11px_13px)] opacity-80" />
          </div>
          <p className="mt-6 text-[0.625rem] font-bold tracking-[0.24em] uppercase opacity-70">
            Handle with care · Est. {site.established}
          </p>
        </div>
      </div>
      <Stamp text={hero.stamp} className="absolute top-0 -right-3 w-24 rotate-12 drop-shadow-[0_10px_18px_rgb(42_25_15/0.2)] sm:-right-8 sm:w-28" />
    </div>
  )
}

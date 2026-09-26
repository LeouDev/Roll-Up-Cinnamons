import { Cookie, Heart, House, Sparkles } from 'lucide-react'
import { whyRollUp, type Benefit } from '../../data/content'
import { Reveal } from '../ui/Reveal'
import { SectionHeading } from '../ui/SectionHeading'

const icons: Record<Benefit['icon'], typeof House> = { home: House, fresh: Sparkles, flavor: Cookie, love: Heart }

export function WhyRollUp() {
  return (
    <section aria-labelledby="why-title" className="pt-28 pb-24 md:pt-36 md:pb-32">
      <div className="container-page">
        <SectionHeading id="why-title" eyebrow={whyRollUp.eyebrow} title={whyRollUp.title} />
        <ul className="mt-14 grid gap-y-10 sm:grid-cols-2 sm:gap-x-12 md:mt-20 lg:grid-cols-4 lg:gap-x-0 lg:divide-x lg:divide-chocolate/12">
          {whyRollUp.benefits.map((b, i) => {
            const Icon = icons[b.icon]
            return (
              <Reveal as="li" key={b.title} delay={i * 90} className="border-t border-chocolate/12 pt-6 lg:border-t-0 lg:px-6 lg:pt-2 xl:px-9 lg:first:pl-0 lg:last:pr-0">
                <div className="flex items-start justify-between gap-4">
                  <span className="font-display text-[2.25rem] leading-none text-rust italic-accent lg:text-[2.75rem]">0{i + 1}</span>
                  <Icon className="mt-1 size-6 text-cinnamon" strokeWidth={1.6} aria-hidden="true" />
                </div>
                <h3 className="mt-4 text-[1.75rem] leading-tight tracking-[-0.01em] lg:mt-7">{b.title}</h3>
                <p className="mt-2.5 max-w-[30ch] text-cocoa">{b.text}</p>
              </Reveal>
            )
          })}
        </ul>
      </div>
    </section>
  )
}

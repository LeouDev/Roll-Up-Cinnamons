import { ArrowUpRight, Star } from 'lucide-react'
import { testimonialsIntro } from '../../data/content'
import { site } from '../../data/site'
import { testimonials } from '../../data/testimonials'
import { ButtonLink } from '../ui/Button'
import { FacebookIcon } from '../ui/icons'
import { Reveal } from '../ui/Reveal'
import { SectionHeading } from '../ui/SectionHeading'

// 1 → one wide quote · 2 or 4 → two columns · 3, 5, 6 → three columns
const n = testimonials.length
const cols = n === 1 ? 'max-w-3xl' : n === 2 || n === 4 ? 'md:grid-cols-2' : 'md:grid-cols-2 lg:grid-cols-3'

export function Testimonials() {
  return (
    <section aria-labelledby="testimonials-title" className="grain torn-edges bg-oat py-24 md:py-32">
      <div className="container-page">
        <SectionHeading id="testimonials-title" eyebrow={testimonialsIntro.eyebrow} title={testimonialsIntro.title} />

        <ul className={`mt-12 grid gap-x-14 md:mt-16 ${cols}`}>
          {testimonials.map((t, i) => (
            <Reveal as="li" key={i} delay={(i % 3) * 90} className="border-t border-chocolate/15 pt-8 pb-12">
              <figure>
                <span aria-hidden="true" className="block h-10 font-display text-[5.5rem] leading-none text-caramel">
                  “
                </span>
                {t.rating && (
                  <p className="mt-5 flex gap-1 text-caramel">
                    {Array.from({ length: t.rating }, (_, s) => (
                      <Star key={s} className="size-4 fill-current" aria-hidden="true" />
                    ))}
                    <span className="sr-only">Rated {t.rating} out of 5</span>
                  </p>
                )}
                <blockquote className="mt-5 font-display text-[1.6rem] leading-snug italic-accent md:text-[1.85rem]">{t.quote}</blockquote>
                <figcaption className="mt-6 text-sm">
                  <span className="font-bold">{t.name}</span>
                  {t.source && <span className="text-muted"> · {t.source}</span>}
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </ul>

        <Reveal className="flex flex-col gap-6 rounded-[1.5rem] bg-paper p-7 shadow-soft md:p-9 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="font-display text-[1.9rem] leading-tight">Follow {site.name}</p>
            <p className="mt-1.5 text-cocoa">See our latest posts and photos on Facebook.</p>
          </div>
          <div className="flex flex-wrap items-center gap-x-7 gap-y-4">
            <ButtonLink href={site.links.facebook} target="_blank" rel="noopener">
              <FacebookIcon size={18} /> Follow on Facebook
            </ButtonLink>
            <a
              href={site.links.facebookReviews}
              target="_blank"
              rel="noopener"
              className="link-underline inline-flex items-center gap-1 text-sm font-bold text-chocolate"
            >
              Read our reviews on Facebook <ArrowUpRight className="size-4" aria-hidden="true" />
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

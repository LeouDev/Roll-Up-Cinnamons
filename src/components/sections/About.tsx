import { about } from '../../data/content'
import { site } from '../../data/site'
import { Picture } from '../ui/Picture'
import { Reveal } from '../ui/Reveal'
import { SectionHeading } from '../ui/SectionHeading'

export function About() {
  return (
    <section id="about" aria-labelledby="about-title" className="overflow-x-clip py-24 md:py-32">
      <div className="container-page grid items-center gap-16 md:grid-cols-2 lg:gap-24">
        {/* Photo stack: the original kraft logo, a real roll on top */}
        <div className="relative mx-auto w-full max-w-[34rem] pb-[22%] md:mx-0">
          <Reveal variant="zoom" className="w-[80%] -rotate-3 overflow-hidden rounded-[1.5rem] bg-oat shadow-lift">
            <Picture image={about.image} alt={about.imageAlt} sizes="(min-width: 768px) 36vw, 80vw" className="aspect-square w-full object-cover" />
          </Reveal>
          <Reveal
            delay={160}
            className="absolute right-0 bottom-0 w-[60%] rotate-[4deg] overflow-hidden rounded-[1.25rem] border-[6px] border-cream bg-oat shadow-lift"
          >
            <Picture image={about.photo} alt={about.photoAlt} sizes="(min-width: 768px) 28vw, 60vw" className="aspect-[4/3] w-full object-cover" />
          </Reveal>
        </div>

        <div>
          <SectionHeading id="about-title" eyebrow={about.eyebrow} title={about.title} />
          <div className="mt-7 max-w-xl space-y-5">
            {about.paragraphs.map((p, i) => (
              <Reveal as="p" key={i} delay={160 + i * 80} className="text-lead text-cocoa">
                {p}
              </Reveal>
            ))}
          </div>
          {about.founderNote && (
            <Reveal as="figure" className="mt-10 max-w-xl border-l-2 border-rust pl-6">
              <blockquote className="font-display text-[1.6rem] leading-snug italic-accent">“{about.founderNote}”</blockquote>
              {about.founderName && <figcaption className="mt-3 text-sm font-semibold text-muted">— {about.founderName}</figcaption>}
            </Reveal>
          )}
          <Reveal as="p" delay={320} className="script mt-10 -rotate-2 text-[1.75rem] leading-tight text-rust">
            {about.signOff} · {site.address.area}, <span className="whitespace-nowrap">{site.address.city}</span>
          </Reveal>
        </div>
      </div>
    </section>
  )
}

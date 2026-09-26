import { About } from '../components/sections/About'
import { BoxBuilder } from '../components/sections/BoxBuilder'
import { FinalCta } from '../components/sections/FinalCta'
import { Gallery } from '../components/sections/Gallery'
import { Hero } from '../components/sections/Hero'
import { Location } from '../components/sections/Location'
import { Marquee } from '../components/sections/Marquee'
import { ProductSection } from '../components/sections/ProductSection'
import { Testimonials } from '../components/sections/Testimonials'
import { WhyRollUp } from '../components/sections/WhyRollUp'

/** Homepage — sections in page order. */
export function HomePage() {
  return (
    <>
      <Hero />
      <Marquee />
      <ProductSection />
      <BoxBuilder />
      <WhyRollUp />
      <Gallery />
      <About />
      <Testimonials />
      <Location />
      <FinalCta />
    </>
  )
}

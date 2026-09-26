import { Hero } from '../components/sections/Hero'
import { Marquee } from '../components/sections/Marquee'
import { ProductSection } from '../components/sections/ProductSection'

/**
 * Homepage — sections in page order. Still to build (see HANDOFF.md):
 * BoxBuilder, WhyRollUp, Gallery, About, Testimonials, Location, CTA.
 */
export function HomePage() {
  return (
    <>
      <Hero />
      <Marquee />
      <ProductSection />
      {/* <BoxBuilder />   id="build-your-box" — Order buttons already scroll here */}
      {/* <WhyRollUp /> */}
      {/* <Gallery />      id="gallery" */}
      {/* <About />        id="about" */}
      {/* <Testimonials /> */}
      {/* <Location />     id="contact" */}
      {/* <CTA /> */}
    </>
  )
}

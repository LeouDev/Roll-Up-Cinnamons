import { MapPin } from 'lucide-react'
import { navigation, site } from '../../data/site'
import { Logo } from '../brand/Logo'
import { FacebookIcon, MessengerIcon } from '../ui/icons'

const link = 'link-underline inline-flex items-center gap-2.5 text-cream/85 transition-colors hover:text-cream'

export function Footer() {
  return (
    <footer id="footer" className="relative overflow-hidden bg-espresso text-cream/70">
      <div className="container-page grid gap-12 pt-20 pb-14 md:grid-cols-12 md:pt-24">
        <div className="md:col-span-6 lg:col-span-5">
          <Logo variant="full" sizes="(min-width: 768px) 256px, 224px" className="w-56 md:w-64" />
          <p className="mt-8 max-w-[32ch] text-lg leading-snug text-cream/85">{site.tagline}</p>
          <p className="mt-4 flex items-center gap-2 text-sm">
            <MapPin className="size-4 shrink-0 text-apricot" aria-hidden="true" />
            {site.address.area}, {site.address.city}, {site.address.country}
          </p>
        </div>

        <nav aria-label="Footer" className="md:col-span-3 lg:col-start-7">
          <p className="eyebrow text-apricot">Explore</p>
          <ul className="mt-5 space-y-3">
            {navigation.map((item) => (
              <li key={item.href}>
                <a href={item.href} className={link}>
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="md:col-span-3">
          <p className="eyebrow text-apricot">Say hello</p>
          <ul className="mt-5 space-y-3">
            <li>
              <a href={site.links.facebook} target="_blank" rel="noopener" className={link}>
                <FacebookIcon size={17} /> Facebook
              </a>
            </li>
            <li>
              <a href={site.links.messenger} target="_blank" rel="noopener" className={link}>
                <MessengerIcon size={17} /> Messenger
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="container-page flex flex-col gap-1.5 border-t border-cream/10 py-7 text-sm text-cream/50 sm:flex-row sm:justify-between">
        <p>
          © {site.established} {site.name}
        </p>
        <p>Homemade in {site.address.city}</p>
      </div>

      <p
        aria-hidden="true"
        className="pointer-events-none -mb-[0.18em] text-center font-display text-[19.5vw] leading-[0.8] whitespace-nowrap text-transparent select-none [-webkit-text-stroke:1px_rgb(251_245_236/0.13)]"
      >
        ROLL UP
      </p>
    </footer>
  )
}

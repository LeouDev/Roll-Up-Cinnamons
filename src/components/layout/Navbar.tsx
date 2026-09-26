import { Menu, X } from 'lucide-react'
import { useState, type CSSProperties, type MouseEvent } from 'react'
import { formatAddress, navigation, site } from '../../data/site'
import { scrollToId, useActiveSection, useScrolled } from '../../lib/hooks'
import { itemCount } from '../../lib/order'
import { useOrder } from '../../state/order'
import { Logo } from '../brand/Logo'
import { ArrowNudge, Button, ButtonLink } from '../ui/Button'
import { Dialog } from '../ui/Dialog'
import { FacebookIcon, MessengerIcon } from '../ui/icons'

const sectionIds = navigation.map((item) => item.href.slice(1))

export function Navbar() {
  const scrolled = useScrolled(12)
  const active = useActiveSection(sectionIds)
  const { lines, openOrder, addedTick } = useOrder()
  const [menuOpen, setMenuOpen] = useState(false)
  const count = itemCount(lines)

  const onOrder = () => (count > 0 ? openOrder() : scrollToId('build-your-box'))

  return (
    <header
      className={`sticky top-0 z-40 transition-[background-color,box-shadow] duration-500 ${
        scrolled
          ? 'bg-cream/88 shadow-[0_1px_0_rgb(42_25_15/0.07),0_10px_30px_-20px_rgb(42_25_15/0.35)] backdrop-blur-md backdrop-saturate-150'
          : 'bg-cream/0'
      }`}
    >
      <nav aria-label="Main" className="container-page flex h-(--nav-h) items-center justify-between gap-4">
        <a href="#top" aria-label="Roll Up Cinnamons — back to top" className="-ml-1 shrink-0 rounded-md p-1">
          <Logo
            variant="compact"
            priority
            sizes="(min-width: 1024px) 170px, 140px"
            className="w-[8.25rem] transition-transform duration-500 ease-(--ease-soft) hover:-rotate-2 lg:w-[9.75rem]"
          />
        </a>

        <ul className="hidden items-center gap-9 lg:flex">
          {navigation.map((item) => {
            const isActive = active === item.href.slice(1)
            return (
              <li key={item.href}>
                <a
                  href={item.href}
                  aria-current={isActive ? 'true' : undefined}
                  className="link-underline py-1.5 text-[0.9375rem] font-medium text-chocolate/70 transition-colors hover:text-chocolate aria-[current=true]:text-chocolate"
                >
                  {item.label}
                </a>
              </li>
            )
          })}
        </ul>

        <div className="flex items-center gap-1.5">
          <Button size="sm" onClick={onOrder} className="lg:h-11 lg:px-6 lg:text-[0.75rem]">
            {count > 0 ? (
              <>
                <span>
                  Your order<span className="sr-only"> ({count} {count === 1 ? 'item' : 'items'})</span>
                </span>
                <span
                  key={addedTick}
                  aria-hidden="true"
                  className="animate-pop -mr-1.5 grid size-6 place-items-center rounded-full bg-cream text-[0.7rem] tracking-normal text-cinnamon"
                >
                  {count}
                </span>
              </>
            ) : (
              'Order now'
            )}
          </Button>
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
            aria-expanded={menuOpen}
            aria-haspopup="dialog"
            className="-mr-2 grid size-11 place-items-center rounded-full text-chocolate transition-colors hover:bg-chocolate/5 lg:hidden"
          >
            <Menu className="size-6" strokeWidth={1.8} aria-hidden="true" />
          </button>
        </div>
      </nav>

      <MobileMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        onOrder={() => {
          setMenuOpen(false)
          window.setTimeout(onOrder, 300)
        }}
      />
    </header>
  )
}

function MobileMenu({ open, onClose, onOrder }: { open: boolean; onClose: () => void; onOrder: () => void }) {
  const go = (e: MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault()
    onClose()
    window.setTimeout(() => scrollToId(href.slice(1)), 300)
  }

  return (
    <Dialog open={open} onClose={onClose} variant="full" label="Menu">
      <div className="grain flex h-dvh flex-col bg-cream px-(--gutter) pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        <div className="flex h-(--nav-h) shrink-0 items-center justify-between">
          <Logo variant="compact" sizes="140px" className="w-[8.25rem]" />
          <button
            type="button"
            onClick={onClose}
            data-autofocus
            aria-label="Close menu"
            className="-mr-2 grid size-11 place-items-center rounded-full transition-colors hover:bg-chocolate/5"
          >
            <X className="size-6" strokeWidth={1.8} aria-hidden="true" />
          </button>
        </div>

        <nav aria-label="Mobile" className="mt-6 flex-1 overflow-y-auto">
          <ul className="space-y-1">
            {navigation.map((item, i) => (
              <li key={item.href} className="animate-rise" style={{ '--d': `${60 + i * 55}ms` } as CSSProperties}>
                <a
                  href={item.href}
                  onClick={(e) => go(e, item.href)}
                  className="group flex items-baseline justify-between border-b border-chocolate/10 py-3.5 font-display text-[2.6rem] leading-none tracking-[-0.02em]"
                >
                  <span className="transition-colors group-hover:text-rust">{item.label}</span>
                  <span className="font-sans text-xs font-semibold tracking-[0.2em] text-muted">0{i + 1}</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="animate-rise mt-6 space-y-5" style={{ '--d': '380ms' } as CSSProperties}>
          <Button size="lg" onClick={onOrder} className="w-full">
            Order now <ArrowNudge />
          </Button>
          <div className="flex items-center justify-between gap-4 text-sm text-cocoa">
            <p className="leading-snug">{formatAddress()}</p>
            <div className="flex shrink-0 gap-1">
              <ButtonLink
                href={site.links.messenger}
                target="_blank"
                rel="noopener"
                variant="secondary"
                size="sm"
                className="size-11 px-0"
                aria-label="Message us on Messenger"
              >
                <MessengerIcon size={18} />
              </ButtonLink>
              <ButtonLink
                href={site.links.facebook}
                target="_blank"
                rel="noopener"
                variant="secondary"
                size="sm"
                className="size-11 px-0"
                aria-label="Roll Up Cinnamons on Facebook"
              >
                <FacebookIcon size={18} />
              </ButtonLink>
            </div>
          </div>
        </div>
      </div>
    </Dialog>
  )
}

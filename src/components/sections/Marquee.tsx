import { marquee } from '../../data/content'
import { SwirlIcon } from '../ui/icons'

/** Slow kraft-paper ribbon. Decorative — the same facts appear elsewhere. */
export function Marquee() {
  const row = (
    <div className="flex shrink-0 items-center">
      {marquee.map((item) => (
        <span key={item} className="flex items-center">
          <span className="px-7 font-display text-[1.35rem] italic tracking-[-0.01em] whitespace-nowrap md:px-10 md:text-[1.75rem]">
            {item}
          </span>
          <SwirlIcon size={22} strokeWidth={2.4} className="shrink-0 text-cinnamon/70" />
        </span>
      ))}
    </div>
  )
  return (
    <div aria-hidden="true" className="kraft relative z-10 -mx-[4vw] -rotate-[1.2deg] overflow-hidden border-y border-kraft-deep/40 py-3.5 text-chocolate shadow-[0_14px_30px_-18px_rgb(42_25_15/0.5)] md:py-4">
      <div className="animate-marquee flex w-max hover:[animation-play-state:paused]">
        {row}
        {row}
      </div>
    </div>
  )
}

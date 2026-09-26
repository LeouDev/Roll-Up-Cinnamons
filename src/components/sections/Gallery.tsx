import { ChevronLeft, ChevronRight, Expand, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { galleryIntro } from '../../data/content'
import { gallery, type GalleryItem } from '../../data/gallery'
import { images } from '../../data/images.generated'
import { Dialog } from '../ui/Dialog'
import { Picture } from '../ui/Picture'
import { Reveal } from '../ui/Reveal'
import { SectionHeading } from '../ui/SectionHeading'

const tile: Record<GalleryItem['shape'], { span: string; sizes: string }> = {
  square: { span: '', sizes: '(min-width: 768px) 25vw, 50vw' },
  tall: { span: 'row-span-2', sizes: '(min-width: 768px) 25vw, 50vw' },
  wide: { span: 'col-span-2', sizes: '(min-width: 768px) 50vw, 100vw' },
  large: { span: 'col-span-2 row-span-2', sizes: '(min-width: 768px) 50vw, 100vw' },
}

export function Gallery() {
  const [open, setOpen] = useState(false)
  const [index, setIndex] = useState(0)

  return (
    <section id="gallery" aria-labelledby="gallery-title" className="py-24 md:py-32">
      <div className="container-page">
        <SectionHeading id="gallery-title" eyebrow={galleryIntro.eyebrow} title={galleryIntro.title} subtitle={galleryIntro.subtitle} />

        {/* Rows are as tall as a column is wide, so 1×1 tiles are square. */}
        <div className="@container mt-12 md:mt-16">
          <ul className="grid grid-flow-dense auto-rows-[calc((100cqw-0.75rem)/2)] grid-cols-2 gap-3 md:auto-rows-[calc((100cqw-3rem)/4)] md:grid-cols-4 md:gap-4">
            {gallery.map((item, i) => (
              <Reveal as="li" key={item.image} delay={(i % 4) * 70} variant="zoom" className={tile[item.shape].span}>
                <button
                  type="button"
                  onClick={() => {
                    setIndex(i)
                    setOpen(true)
                  }}
                  className="group relative block size-full overflow-hidden rounded-2xl bg-oat"
                >
                  <Picture
                    image={item.image}
                    alt={item.alt}
                    sizes={tile[item.shape].sizes}
                    position={item.position}
                    className="size-full object-cover transition-transform duration-700 ease-(--ease-soft) group-hover:scale-[1.04]"
                  />
                  <span className="absolute right-3 bottom-3 grid size-9 place-items-center rounded-full bg-cream/90 text-chocolate opacity-0 shadow-soft transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
                    <Expand className="size-4" strokeWidth={2} aria-hidden="true" />
                  </span>
                </button>
              </Reveal>
            ))}
          </ul>
        </div>
      </div>

      <Lightbox open={open} index={index} onIndex={setIndex} onClose={() => setOpen(false)} />
    </section>
  )
}

type LightboxProps = { open: boolean; index: number; onIndex: (i: number) => void; onClose: () => void }

function Lightbox({ open, index, onIndex, onClose }: LightboxProps) {
  const n = gallery.length
  const go = (step: number) => onIndex((index + step + n) % n)
  const goRef = useRef(go)
  goRef.current = go
  const touchX = useRef<number | null>(null)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') goRef.current(-1)
      if (e.key === 'ArrowRight') goRef.current(1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  // The current photo plus its neighbours: they load in the background, so
  // prev/next is instant and cross-fades.
  const shown = [...new Set([index - 1, index, index + 1].map((i) => (i + n) % n))]
  const item = gallery[index]
  const arrow =
    'absolute top-1/2 grid size-12 -translate-y-1/2 place-items-center rounded-full bg-cream/12 text-cream backdrop-blur-sm transition-colors hover:bg-cream hover:text-chocolate'

  return (
    <Dialog open={open} onClose={onClose} variant="full" label="Photo gallery">
      <div className="flex h-dvh flex-col bg-chocolate text-cream">
        <div className="flex h-16 shrink-0 items-center justify-between px-(--gutter)">
          <p className="text-sm font-bold tracking-[0.16em] tabular-nums" aria-live="polite">
            {index + 1} / {n}
          </p>
          <button
            type="button"
            onClick={onClose}
            data-autofocus
            aria-label="Close"
            className="-mr-2 grid size-11 place-items-center rounded-full transition-colors hover:bg-cream/10"
          >
            <X className="size-6" strokeWidth={1.8} aria-hidden="true" />
          </button>
        </div>

        <div
          className="relative min-h-0 flex-1"
          onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
          onTouchEnd={(e) => {
            const dx = e.changedTouches[0].clientX - (touchX.current ?? e.changedTouches[0].clientX)
            if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1)
            touchX.current = null
          }}
        >
          {/* Never shown larger than the photo itself, so small crops stay sharp */}
          <div className="absolute inset-x-2 inset-y-0 md:inset-x-24">
            {shown.map((i) => {
              const { image, alt } = gallery[i]
              return (
                <Picture
                  key={i}
                  image={image}
                  alt={i === index ? alt : ''}
                  sizes="100vw"
                  className={`absolute inset-0 m-auto size-full object-contain transition-opacity duration-300 ${i === index ? 'opacity-100' : 'opacity-0'}`}
                  style={{ backgroundImage: 'none', maxWidth: images[image].width, maxHeight: images[image].height }}
                />
              )
            })}
          </div>
          <button type="button" onClick={() => go(-1)} aria-label="Previous photo" className={`${arrow} left-3 md:left-6`}>
            <ChevronLeft className="size-6" aria-hidden="true" />
          </button>
          <button type="button" onClick={() => go(1)} aria-label="Next photo" className={`${arrow} right-3 md:right-6`}>
            <ChevronRight className="size-6" aria-hidden="true" />
          </button>
        </div>

        <p className="shrink-0 px-(--gutter) pt-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] text-center font-display text-xl italic-accent">
          {item.caption}
        </p>
      </div>
    </Dialog>
  )
}

import { logoData } from './logo-data'

const base = import.meta.env.BASE_URL

type LogoProps = {
  /** 'compact' (ROLL UP / Cinnamon) for the nav; 'full' adds est. 2026. */
  variant?: 'compact' | 'full'
  className?: string
  /** Rendered width hint so the right paper texture size is picked. */
  sizes?: string
  priority?: boolean
}

/**
 * The Roll Up logo: real kraft-paper texture with a torn edge, and the
 * lettering as crisp vector ink on top.
 */
export function Logo({ variant = 'compact', className = '', sizes = '180px', priority = false }: LogoProps) {
  const logo = logoData[variant]
  const paper = logo.paper
  return (
    <span
      role="img"
      aria-label="Roll Up Cinnamons"
      className={`relative block select-none ${className}`}
      style={{ aspectRatio: `${logo.width} / ${logo.height}` }}
    >
      <img
        src={base + 'brand/' + paper[1].file}
        srcSet={paper.map((p) => `${base}brand/${p.file} ${p.w}w`).join(', ')}
        sizes={sizes}
        alt=""
        width={logo.paperWidth}
        height={logo.height}
        decoding="async"
        loading={priority ? 'eager' : 'lazy'}
        className="absolute top-0 left-0 h-full max-w-none"
        style={{ width: `${(logo.paperWidth / logo.width) * 100}%` }}
        draggable={false}
      />
      <img
        src={base + logo.ink}
        alt=""
        width={logo.width}
        height={logo.height}
        decoding="async"
        loading={priority ? 'eager' : 'lazy'}
        className="absolute inset-0 h-full w-full"
        draggable={false}
      />
    </span>
  )
}

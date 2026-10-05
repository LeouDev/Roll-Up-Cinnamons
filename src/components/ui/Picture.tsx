import type { CSSProperties } from 'react'
import { images, type ImageId } from '../../data/images.generated'
import { isUpload, type UploadId } from '../../data/products'
import { site } from '../../data/site'

const base = import.meta.env.BASE_URL
const withBase = (srcset: string) =>
  srcset
    .split(', ')
    .map((entry) => base + entry)
    .join(', ')

type PictureProps = {
  image: ImageId | UploadId
  alt: string
  /** Rendered width hint for the browser, e.g. "(min-width: 1024px) 40vw, 90vw". */
  sizes: string
  className?: string
  /** CSS object-position, also used for the blurred placeholder. */
  position?: string
  /** Above-the-fold images: load eagerly with high priority. */
  priority?: boolean
  style?: CSSProperties
}

/**
 * Responsive photo: AVIF → WebP, correct intrinsic size (no layout shift),
 * lazy by default, and a tiny blurred preview painted underneath while the
 * real image loads.
 */
export function Picture({ image, alt, sizes, className, position = '50% 50%', priority = false, style }: PictureProps) {
  // Uploaded from the admin: one JPEG in Supabase Storage, already cropped and
  // sized in the browser (the frames it sits in have a fixed shape).
  if (isUpload(image))
    return (
      <img
        src={`${site.menuPhotos}${image}.jpg`}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        fetchPriority={priority ? 'high' : undefined}
        className={className}
        style={{ objectPosition: position, ...style }}
      />
    )
  const img = images[image]
  return (
    <picture className="contents">
      <source type="image/avif" srcSet={withBase(img.avif)} sizes={sizes} />
      <source type="image/webp" srcSet={withBase(img.webp)} sizes={sizes} />
      <img
        src={base + img.src}
        alt={alt}
        width={img.width}
        height={img.height}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        fetchPriority={priority ? 'high' : undefined}
        className={className}
        style={{
          objectPosition: position,
          backgroundImage: `url(${img.lqip})`,
          backgroundSize: 'cover',
          backgroundPosition: position,
          ...style,
        }}
      />
    </picture>
  )
}

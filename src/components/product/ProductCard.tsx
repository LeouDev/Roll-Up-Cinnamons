import { flavors, type Product } from '../../data/products'
import { formatPrice, startingBoxPrice } from '../../lib/order'
import { ArrowNudge } from '../ui/Button'
import { Picture } from '../ui/Picture'
import { SoldOut } from '../ui/SoldOut'

type ProductCardProps = {
  product: Product
  onSelect: (product: Product) => void
  className?: string
}

function priceHint(product: Product): string | null {
  if (product.action === 'builder') {
    const from = startingBoxPrice()
    return from == null ? null : `From ${formatPrice(from)} / box`
  }
  const prices = (product.options ?? []).map((o) => o.price).filter((p): p is number => p != null)
  return prices.length ? `From ${formatPrice(Math.min(...prices))}` : null
}

/** Editorial product card — big photo, name, short line, one clear action. */
export function ProductCard({ product, onSelect, className = '' }: ProductCardProps) {
  const price = priceHint(product)
  const titleId = `product-${product.id}`
  return (
    <article aria-labelledby={titleId} className={`group relative ${className}`}>
      <div className="relative overflow-hidden rounded-[1.75rem] bg-oat shadow-soft">
        <div className="aspect-[4/5]">
          <Picture
            image={product.image}
            alt={product.imageAlt}
            sizes="(min-width: 768px) 46vw, 92vw"
            className="size-full object-cover transition-transform duration-[1.4s] ease-(--ease-soft) group-hover:scale-[1.045]"
          />
        </div>
        {!product.available ? (
          <SoldOut className="absolute top-4 left-4 shadow-soft md:top-5 md:left-5" />
        ) : (
          product.tag && (
            <span className="absolute top-4 left-4 rounded-full bg-cream/92 px-3.5 py-2 text-[0.6875rem] leading-none font-bold tracking-[0.14em] text-chocolate uppercase shadow-soft backdrop-blur-sm md:top-5 md:left-5">
              {product.tag}
            </span>
          )
        )}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_0_0_0_1px_rgb(42_25_15/0.07)]"
        />
      </div>

      <div className="mt-6 flex items-start justify-between gap-6 md:mt-7">
        <div>
          <h3 id={titleId} className="text-h3">
            {product.name}
          </h3>
          <p className="mt-2.5 max-w-[34ch] text-cocoa">{product.description}</p>
        </div>
        {price && <p className="mt-1.5 shrink-0 text-sm font-bold text-cinnamon">{price}</p>}
      </div>

      {product.action === 'builder' && (
        <ul className="mt-5 flex flex-wrap gap-2" aria-label="Flavors">
          {flavors.map((f) => (
            <li
              key={f.id}
              className="flex items-center gap-2 rounded-full border border-chocolate/12 py-1.5 pr-3.5 pl-2 text-[0.8125rem] font-medium text-cocoa"
            >
              <span className="size-3 rounded-full ring-1 ring-chocolate/10" style={{ background: f.swatch }} />
              <span className={f.available ? '' : 'line-through opacity-60'}>{f.name}</span>
              {!f.available && <span className="sr-only">(sold out)</span>}
            </li>
          ))}
        </ul>
      )}

      <button
        type="button"
        onClick={() => onSelect(product)}
        className="group/btn mt-6 inline-flex items-center gap-2.5 border-b-[1.5px] border-chocolate pb-1 text-[0.75rem] font-bold tracking-[0.16em] text-chocolate uppercase transition-colors after:absolute after:inset-0 after:content-[''] hover:border-rust hover:text-rust"
        aria-label={`View options for ${product.name}`}
      >
        View options <ArrowNudge />
      </button>
    </article>
  )
}

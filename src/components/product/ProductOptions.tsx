import { X } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { Product } from '../../data/products'
import { MAX_QTY, priceLabel } from '../../lib/order'
import { useOrder } from '../../state/order'
import { ArrowNudge, Button } from '../ui/Button'
import { Dialog } from '../ui/Dialog'
import { Picture } from '../ui/Picture'
import { Stepper } from '../ui/Stepper'

type ProductOptionsProps = {
  product: Product | null
  onClose: () => void
}

/** Options sheet for products ordered by the piece/pack (e.g. cheese rolls). */
export function ProductOptions({ product, onClose }: ProductOptionsProps) {
  const { addProduct, openOrder } = useOrder()
  const options = product?.options ?? []
  const [optionId, setOptionId] = useState(options[0]?.id ?? '')
  const [qty, setQty] = useState(1)

  useEffect(() => {
    if (product) {
      setOptionId(product.options?.[0]?.id ?? '')
      setQty(1)
    }
  }, [product])

  const option = options.find((o) => o.id === optionId) ?? options[0]

  const add = () => {
    if (!product || !option) return
    addProduct(product.id, option.id, qty)
    onClose()
    window.setTimeout(openOrder, 320)
  }

  return (
    <Dialog open={!!product} onClose={onClose} labelledBy="product-options-title">
      {product && (
        <div className="flex max-h-[inherit] flex-col md:h-full">
          <div className="relative shrink-0">
            <div className="aspect-[16/10] overflow-hidden bg-oat md:aspect-[4/3]">
              <Picture image={product.image} alt={product.imageAlt} sizes="(min-width: 768px) 31rem, 100vw" className="size-full object-cover" />
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="absolute top-4 right-4 grid size-11 place-items-center rounded-full bg-cream/90 shadow-soft backdrop-blur-sm transition-colors hover:bg-cream"
            >
              <X className="size-5" aria-hidden="true" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-6 pt-7 pb-6 md:px-8">
            <p className="eyebrow">{product.tag}</p>
            <h2 id="product-options-title" className="mt-3 text-[2.25rem] leading-none tracking-[-0.02em]">
              {product.name}
            </h2>
            <p className="mt-3 text-cocoa">{product.description}</p>

            <fieldset className="mt-7">
              <legend className="mb-3 text-xs font-bold tracking-[0.16em] text-muted uppercase">Options</legend>
              <div className="space-y-2.5">
                {options.map((o) => (
                  <label
                    key={o.id}
                    className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-chocolate/12 px-4 py-3.5 transition-colors has-checked:border-chocolate has-checked:bg-oat/60"
                  >
                    <span className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="product-option"
                        value={o.id}
                        checked={o.id === option?.id}
                        onChange={() => setOptionId(o.id)}
                        className="size-4 accent-cinnamon"
                      />
                      <span>
                        <span className="block font-semibold">{o.label}</span>
                        {o.detail && <span className="block text-sm text-muted">{o.detail}</span>}
                      </span>
                    </span>
                    <span className="shrink-0 text-sm font-bold text-cinnamon">{priceLabel(o.price)}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="mt-7 flex items-center justify-between">
              <span className="text-xs font-bold tracking-[0.16em] text-muted uppercase">Quantity</span>
              <Stepper
                value={qty}
                label={product.name}
                canDecrement={qty > 1}
                canIncrement={qty < MAX_QTY}
                onDecrement={() => setQty((q) => Math.max(1, q - 1))}
                onIncrement={() => setQty((q) => Math.min(MAX_QTY, q + 1))}
              />
            </div>
          </div>

          <div className="shrink-0 border-t border-chocolate/10 bg-paper px-6 pt-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] md:px-8">
            <Button size="lg" className="w-full" onClick={add} data-autofocus>
              Add to order <ArrowNudge />
            </Button>
          </div>
        </div>
      )}
    </Dialog>
  )
}

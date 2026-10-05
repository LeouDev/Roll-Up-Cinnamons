import { Check, X } from 'lucide-react'
import { useState } from 'react'
import { getProduct } from '../../data/products'
import { scrollToId } from '../../lib/hooks'
import {
  MAX_QTY,
  buildOrderMessage,
  flavorBreakdown,
  formatPrice,
  lineTitle,
  lineTotal,
  messengerUrl,
  orderReference,
  orderTotal,
} from '../../lib/order'
import { useOrder } from '../../state/order'
import { ArrowNudge, Button, ButtonLink } from '../ui/Button'
import { Dialog } from '../ui/Dialog'
import { MessengerIcon, SwirlIcon } from '../ui/icons'
import { Picture } from '../ui/Picture'
import { Stepper } from '../ui/Stepper'

export function OrderModal() {
  const { isOpen, closeOrder } = useOrder()
  return (
    <Dialog open={isOpen} onClose={closeOrder} labelledBy="order-title">
      <OrderSheet />
    </Dialog>
  )
}

/** Mounted fresh on every open, so each visit gets its own reference. */
function OrderSheet() {
  const { lines, setQty, remove, clear, closeOrder } = useOrder()
  const [reference] = useState(orderReference)
  const [sent, setSent] = useState<{ copied: boolean } | null>(null)
  const message = buildOrderMessage(lines, reference)
  const { total, complete } = orderTotal(lines)

  const toBuilder = () => {
    closeOrder()
    window.setTimeout(() => scrollToId('build-your-box'), 320)
  }
  // m.me may drop ?text=, so the order is also put on the clipboard to paste.
  const send = async () => {
    let copied = false
    try {
      await navigator.clipboard.writeText(message)
      copied = true
    } catch {
      /* clipboard blocked — the order text is shown instead */
    }
    setSent({ copied })
  }
  const messengerLink = (
    <ButtonLink href={messengerUrl(message)} target="_blank" rel="noopener" onClick={send} size="lg" className="w-full">
      <MessengerIcon size={18} /> {sent ? 'Open Messenger again' : 'Copy order & open Messenger'}
    </ButtonLink>
  )

  return (
    <div className="flex max-h-[inherit] flex-col md:h-full">
      <div className="flex shrink-0 items-center justify-between px-6 pt-6 pb-4 md:px-8 md:pt-8">
        <h2 id="order-title" className="text-[2rem] leading-none tracking-[-0.02em]">
          Your order
        </h2>
        <button
          type="button"
          onClick={closeOrder}
          aria-label="Close"
          className="-mr-2 grid size-11 place-items-center rounded-full transition-colors hover:bg-chocolate/5"
        >
          <X className="size-5" aria-hidden="true" />
        </button>
      </div>

      {sent ? (
        <div className="flex-1 overflow-y-auto px-6 pt-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] text-center md:px-8">
          <span className="animate-pop mx-auto grid size-18 place-items-center rounded-full bg-apricot text-cinnamon">
            <Check className="size-8" strokeWidth={2.4} aria-hidden="true" />
          </span>
          <p className="mt-5 font-display text-[2.4rem] leading-none" role="status">
            Salamat!
          </p>
          <p className="mx-auto mt-4 max-w-[32ch] text-cocoa">
            {sent.copied ? (
              <>
                Your order (<strong className="text-chocolate">{reference}</strong>) is copied. In the Messenger chat, paste it and
                press send.
              </>
            ) : (
              <>
                Your order is <strong className="text-chocolate">{reference}</strong>. Copy the message below, then paste it in the
                Messenger chat and press send.
              </>
            )}
          </p>
          {!sent.copied && (
            <pre className="mt-5 rounded-2xl bg-oat p-4 text-left font-sans text-sm whitespace-pre-wrap text-chocolate select-all">
              {message}
            </pre>
          )}
          <div className="mt-8 space-y-3">
            {messengerLink}
            <Button
              variant="secondary"
              size="lg"
              className="w-full"
              onClick={() => {
                clear()
                toBuilder()
              }}
            >
              Start a new order
            </Button>
          </div>
        </div>
      ) : lines.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center px-6 pt-10 pb-[max(3rem,env(safe-area-inset-bottom))] text-center">
          <span className="grid size-20 place-items-center rounded-full bg-oat text-cinnamon">
            <SwirlIcon size={40} strokeWidth={1.8} />
          </span>
          <p className="mt-5 font-display text-2xl">Your box is empty</p>
          <p className="mt-2 max-w-[28ch] text-cocoa">Pick four rolls you love and they’ll show up here.</p>
          <Button className="mt-7" onClick={toBuilder}>
            Build a box <ArrowNudge />
          </Button>
        </div>
      ) : (
        <>
          <ul className="flex-1 divide-y divide-chocolate/10 overflow-y-auto border-t border-chocolate/10 px-6 md:px-8">
            {lines.map((line) => {
              const title = lineTitle(line)
              const lineSum = lineTotal(line)
              const detail =
                line.kind === 'product' ? getProduct(line.productId)?.options?.find((o) => o.id === line.optionId)?.detail : undefined
              return (
                <li key={line.id} className="py-5">
                  <div className="flex items-baseline justify-between gap-4">
                    <p className="font-display text-xl leading-tight">{title}</p>
                    {lineSum != null && <p className="font-bold tabular-nums">{formatPrice(lineSum)}</p>}
                  </div>
                  {line.kind === 'box' ? (
                    <ul className="mt-2.5 space-y-1.5 text-sm text-cocoa">
                      {flavorBreakdown(line.flavors).map(({ flavor, count }) => (
                        <li key={flavor.id} className="flex items-center gap-2.5">
                          <span className="size-6 shrink-0 overflow-hidden rounded-full bg-oat ring-1 ring-chocolate/10">
                            <Picture image={flavor.image} alt="" sizes="24px" className="size-full scale-110 object-cover" />
                          </span>
                          {count} × {flavor.name}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    detail && <p className="mt-1 text-sm text-muted">{detail}</p>
                  )}
                  <div className="mt-3 flex items-center justify-between gap-4">
                    <Stepper
                      value={line.qty}
                      label={title}
                      size="sm"
                      canDecrement={line.qty > 1}
                      canIncrement={line.qty < MAX_QTY}
                      onDecrement={() => setQty(line.id, line.qty - 1)}
                      onIncrement={() => setQty(line.id, line.qty + 1)}
                    />
                    <button
                      type="button"
                      onClick={() => remove(line.id)}
                      className="rounded-full px-3 py-2 text-sm font-semibold text-muted underline decoration-chocolate/20 underline-offset-4 transition-colors hover:text-rust"
                    >
                      Remove<span className="sr-only"> {title}</span>
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>

          <div className="shrink-0 border-t border-chocolate/10 bg-paper px-6 pt-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] md:px-8">
            <div className="flex items-baseline justify-between gap-4">
              <span className="text-xs font-bold tracking-[0.16em] text-muted uppercase">Total</span>
              {complete ? (
                <span className="font-display text-3xl tabular-nums">{formatPrice(total)}</span>
              ) : (
                <span className="text-sm font-semibold text-cocoa">Total confirmed in Messenger</span>
              )}
            </div>
            <p className="mt-1.5 text-sm text-muted">The bakery will confirm your order details in Messenger.</p>
            <div className="mt-4">{messengerLink}</div>
            <button
              type="button"
              onClick={toBuilder}
              className="mx-auto mt-2 block rounded-full px-4 py-2.5 text-sm font-bold text-chocolate underline decoration-chocolate/25 underline-offset-4 transition-colors hover:text-rust"
            >
              Add another box
            </button>
          </div>
        </>
      )}
    </div>
  )
}

import { Minus, Plus } from 'lucide-react'

type StepperProps = {
  value: number
  onDecrement: () => void
  onIncrement: () => void
  canDecrement?: boolean
  canIncrement?: boolean
  /** Used in button labels, e.g. "Classic" → "Remove one Classic". */
  label: string
  size?: 'sm' | 'md'
  className?: string
}

/** Thumb-friendly [−] n [+] control. */
export function Stepper({
  value,
  onDecrement,
  onIncrement,
  canDecrement = value > 0,
  canIncrement = true,
  label,
  size = 'md',
  className = '',
}: StepperProps) {
  const btn =
    size === 'md'
      ? 'size-11 [&_svg]:size-4'
      : 'size-9 [&_svg]:size-3.5'
  const shared = `${btn} grid place-items-center rounded-full border border-chocolate/15 text-chocolate transition-[background-color,border-color,color,scale] duration-200 hover:border-chocolate hover:bg-chocolate hover:text-cream active:scale-90 disabled:border-chocolate/10 disabled:text-chocolate/25 disabled:hover:bg-transparent`
  return (
    <div className={`inline-flex items-center gap-1 ${className}`}>
      <button type="button" className={shared} onClick={onDecrement} disabled={!canDecrement} aria-label={`Remove one ${label}`}>
        <Minus strokeWidth={2.4} aria-hidden="true" />
      </button>
      <output
        key={value}
        aria-live="polite"
        className={`animate-pop grid min-w-8 place-items-center font-sans font-bold tabular-nums ${size === 'md' ? 'text-lg' : 'text-base'}`}
      >
        {value}
      </output>
      <button type="button" className={shared} onClick={onIncrement} disabled={!canIncrement} aria-label={`Add one ${label}`}>
        <Plus strokeWidth={2.4} aria-hidden="true" />
      </button>
    </div>
  )
}

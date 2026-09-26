import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'secondary' | 'light' | 'outline-light' | 'kraft'
type Size = 'sm' | 'md' | 'lg'

const base =
  'group/btn relative inline-flex select-none items-center justify-center gap-2.5 whitespace-nowrap rounded-full font-sans font-bold uppercase tracking-[0.13em] transition-[background-color,color,border-color,box-shadow,translate,scale] duration-300 ease-(--ease-soft) active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40'

const variants: Record<Variant, string> = {
  primary:
    'bg-cinnamon text-cream shadow-[0_12px_26px_-14px_rgb(110_52_24/0.9)] hover:-translate-y-px hover:bg-cinnamon-deep hover:shadow-[0_18px_32px_-14px_rgb(84_39_17/0.9)]',
  secondary: 'border border-chocolate/25 text-chocolate hover:border-chocolate hover:bg-chocolate hover:text-cream',
  light: 'bg-cream text-cinnamon shadow-[0_12px_30px_-14px_rgb(0_0_0/0.5)] hover:-translate-y-px hover:bg-white',
  'outline-light': 'border border-cream/35 text-cream hover:border-cream hover:bg-cream hover:text-cinnamon',
  kraft: 'bg-apricot text-chocolate hover:-translate-y-px hover:bg-kraft',
}

const sizes: Record<Size, string> = {
  sm: 'h-10 px-5 text-[0.6875rem]',
  md: 'h-12 px-7 text-[0.75rem]',
  lg: 'h-14 px-8 text-[0.8125rem]',
}

type Common = { variant?: Variant; size?: Size; className?: string; children: ReactNode }

export function buttonClass({ variant = 'primary', size = 'md', className = '' }: Omit<Common, 'children'>) {
  return `${base} ${variants[variant]} ${sizes[size]} ${className}`
}

export function Button({ variant, size, className, ...props }: Common & ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button type="button" className={buttonClass({ variant, size, className })} {...props} />
}

export function ButtonLink({ variant, size, className, ...props }: Common & AnchorHTMLAttributes<HTMLAnchorElement>) {
  return <a className={buttonClass({ variant, size, className })} {...props} />
}

/** Arrow that slides on hover — pair with Button/ButtonLink children. */
export function ArrowNudge({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`size-4 shrink-0 transition-transform duration-300 ease-(--ease-soft) group-hover/btn:translate-x-1 ${className}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  )
}

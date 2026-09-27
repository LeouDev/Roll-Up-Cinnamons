/** Tag for anything that can't be ordered right now (set in the admin page). */
export function SoldOut({ className = '' }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full bg-chocolate px-2.5 py-1 text-[0.625rem] leading-none font-bold tracking-[0.14em] whitespace-nowrap text-cream uppercase ${className}`}
    >
      Sold out
    </span>
  )
}

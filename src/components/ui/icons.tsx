import type { SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement> & { size?: number | string }

/** Cinnamon-roll swirl — the brand's little mark. */
export function SwirlIcon({ size = 24, strokeWidth = 2, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M11.72 13.79C11.23 13.85 10.67 13.7 10.21 13.32C9.76 12.94 9.43 12.33 9.39 11.63C9.35 10.94 9.61 10.17 10.15 9.58C10.69 9 11.52 8.6 12.43 8.58C13.33 8.55 14.3 8.9 15.03 9.6C15.76 10.3 16.23 11.34 16.25 12.46C16.26 13.57 15.82 14.75 14.97 15.62C14.11 16.5 12.86 17.05 11.54 17.07C10.21 17.09 8.83 16.55 7.8 15.56C6.78 14.56 6.13 13.1 6.11 11.56C6.08 10.02 6.69 8.43 7.84 7.25C8.98 6.06 10.64 5.32 12.39 5.28C14.14 5.25 15.95 5.93 17.29 7.21C18.64 8.49 19.49 10.35 19.54 12.31C19.6 14.27 18.85 16.3 17.44 17.81C16.03 19.32 13.96 20.28 11.79 20.37C9.62 20.45 7.37 19.64 5.69 18.11C4.01 16.57 2.93 14.31 2.81 11.92C2.69 9.54 3.55 7.07 5.21 5.21" />
    </svg>
  )
}

export function FacebookIcon({ size = 20, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden="true" {...props}>
      <path d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07c0 6.02 4.39 11.02 10.13 11.93v-8.44H7.08v-3.49h3.05V9.41c0-3.03 1.79-4.7 4.53-4.7 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.96.93-1.96 1.89v2.26h3.33l-.53 3.49h-2.8V24C19.61 23.09 24 18.09 24 12.07Z" />
    </svg>
  )
}

export function MessengerIcon({ size = 20, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden="true" {...props}>
      <path d="M12 0C5.24 0 0 4.95 0 11.64c0 3.5 1.43 6.52 3.77 8.61.2.18.31.42.32.68l.06 2.13a.96.96 0 0 0 1.35.85l2.38-1.05a.96.96 0 0 1 .64-.05c1.09.3 2.26.46 3.48.46 6.76 0 12-4.95 12-11.64C24 4.95 18.76 0 12 0Zm7.2 8.96-3.52 5.59a1.8 1.8 0 0 1-2.6.48l-2.8-2.1a.72.72 0 0 0-.87 0l-3.78 2.87c-.5.38-1.16-.22-.83-.76l3.52-5.59a1.8 1.8 0 0 1 2.6-.48l2.8 2.1a.72.72 0 0 0 .87 0l3.78-2.87c.5-.38 1.16.22.83.76Z" />
    </svg>
  )
}

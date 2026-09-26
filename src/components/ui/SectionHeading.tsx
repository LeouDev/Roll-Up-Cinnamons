import type { ReactNode } from 'react'
import { Reveal } from './Reveal'

type SectionHeadingProps = {
  eyebrow?: string
  title: ReactNode
  subtitle?: ReactNode
  align?: 'left' | 'center'
  /** id for aria-labelledby on the parent section. */
  id?: string
  className?: string
  tone?: 'dark' | 'light'
}

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = 'left',
  id,
  className = '',
  tone = 'dark',
}: SectionHeadingProps) {
  const centered = align === 'center'
  return (
    <div className={`${centered ? 'mx-auto text-center' : ''} max-w-3xl ${className}`}>
      {eyebrow && (
        <Reveal
          as="p"
          className={`eyebrow mb-4 flex items-center gap-3 ${centered ? 'justify-center' : ''} ${tone === 'light' ? 'text-apricot' : ''}`}
        >
          <span aria-hidden="true" className="h-px w-8 bg-current opacity-60" />
          {eyebrow}
        </Reveal>
      )}
      <Reveal as="h2" id={id} delay={80} className={`text-h2 ${tone === 'light' ? 'text-cream' : 'text-chocolate'}`}>
        {title}
      </Reveal>
      {subtitle && (
        <Reveal
          as="p"
          delay={160}
          className={`text-lead mt-5 ${centered ? 'mx-auto' : ''} max-w-xl ${tone === 'light' ? 'text-cream/75' : 'text-cocoa'}`}
        >
          {subtitle}
        </Reveal>
      )}
    </div>
  )
}

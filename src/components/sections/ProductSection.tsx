import { useState } from 'react'
import { menuIntro } from '../../data/content'
import { useMenu, type Product } from '../../data/products'
import { scrollToId } from '../../lib/hooks'
import { ProductCard } from '../product/ProductCard'
import { ProductOptions } from '../product/ProductOptions'
import { Reveal } from '../ui/Reveal'
import { SectionHeading } from '../ui/SectionHeading'

export function ProductSection() {
  const { products } = useMenu()
  const [selected, setSelected] = useState<Product | null>(null)

  const onSelect = (product: Product) => {
    if (product.action === 'builder') scrollToId('build-your-box')
    else setSelected(product)
  }

  return (
    <section id="menu" aria-labelledby="menu-title" className="py-24 md:py-32 lg:py-36">
      <div className="container-page">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <SectionHeading id="menu-title" eyebrow={menuIntro.eyebrow} title={menuIntro.title} subtitle={menuIntro.subtitle} />
          <Reveal as="p" delay={200} className="script max-w-[16ch] rotate-[-4deg] text-[1.7rem] leading-tight text-rust md:mb-4 md:text-right">
            homemade in <span className="whitespace-nowrap">Lapu-Lapu City</span>
          </Reveal>
        </div>

        <div className="mt-14 grid gap-16 md:mt-20 md:grid-cols-2 md:gap-10 lg:gap-16">
          {products.map((product, i) => (
            <Reveal key={product.id} delay={i * 120} className={i % 2 === 1 ? 'md:mt-28' : ''}>
              <ProductCard product={product} onSelect={onSelect} />
            </Reveal>
          ))}
        </div>
      </div>

      <ProductOptions product={selected} onClose={() => setSelected(null)} />
    </section>
  )
}

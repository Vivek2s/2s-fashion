import Image from 'next/image';
import type { Product } from '@fashion-store/shared-types';
import { Reveal } from '@/components/Reveal';

export function FeaturedCollection({ products }: { products: Product[] }) {
  return (
    <section className="mx-auto max-w-site px-5 md:px-7 py-16 md:py-24" id="featured">
      <Reveal className="mb-11 flex flex-wrap items-end justify-between gap-4">
        <h2 className="font-serif font-normal text-[clamp(28px,4vw,52px)]">
          Featured collection
        </h2>
        <p className="text-muted max-w-sm">
          A tightly edited selection from the new season — quiet silhouettes,
          natural fibres, made to last.
        </p>
      </Reveal>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-5">
        {products.map((p, i) => (
          <Reveal key={p.id} delay={(i % 4) * 90}>
            <a href={`/product/${p.slug}`} className="group block">
              <div className="relative aspect-[3/4] overflow-hidden bg-neutral-100">
                {p.tag && (
                  <span className="absolute left-3 top-3 z-10 bg-white px-2 py-1
                    text-[10px] uppercase tracking-[0.14em]">{p.tag}</span>
                )}
                <Image
                  src={p.images[0]} alt={p.name} fill sizes="(max-width:768px) 50vw, 25vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
              </div>
              <div className="mt-3 flex justify-between text-sm">
                <span>{p.name}</span>
                <span className="text-muted">€{p.price}</span>
              </div>
            </a>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { SiteHeader } from '@/components/SiteHeader';
import { Reveal } from '@/components/Reveal';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Collection — 2S Fashion',
  description:
    'The 2S Fashion collection — modern contemporary silhouettes in georgette and satin.',
  alternates: { canonical: '/collection' },
});

/**
 * Collection cards, sourced from the repo `collection/` folder (mirrored to
 * /public/collection). Cards fade + rise in on scroll (staggered, via the
 * house Reveal component) with a slow image zoom on hover.
 */
const CARDS = [
  {
    number: '01',
    title: 'Draped Georgette Shirt',
    description:
      'An airy silhouette in sheer georgette, designed to evoke quiet confidence and understated allure.',
    colors: 'Available in 3 colours',
    image: '/collection/collection-1.png',
    href: '/product/scarf-neck-wrap-blouse-ivory',
  },
  {
    number: '02',
    title: 'Serein Satin Shirt',
    description:
      'A fluid satin shirt designed for modern elegance, effortless sensuality, and timeless evening dressing.',
    colors: 'Available in 2 colours',
    image: '/collection/collection-2.png',
    href: '/product/serein-satin-shirt',
  },
];

export default function CollectionPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-site px-5 pb-20 pt-24 md:px-10 md:pb-28 md:pt-32">
        <Reveal as="header" className="mb-12 md:mb-24">
          <p className="mb-4 text-[11px] uppercase tracking-[0.3em] text-muted">2S Fashion</p>
          <h1 className="font-serif text-[clamp(40px,7vw,96px)] font-normal leading-[0.95]">
            The Collection
          </h1>
          <p className="mt-6 max-w-md text-sm leading-relaxed text-muted">
            Modern contemporary silhouettes — cut in georgette and satin, made to move.
          </p>
        </Reveal>

        <div className="grid gap-14 md:grid-cols-2 md:gap-10 lg:gap-16">
          {CARDS.map((card, i) => {
            const inner = (
              <>
                {/* No zoom-crop here: the card artwork has swatch labels at its
                    edges, so the hover effect lifts the whole image instead. */}
                <div className="relative bg-neutral-100 transition-transform duration-700 ease-[cubic-bezier(0.165,0.84,0.44,1)] group-hover:-translate-y-2">
                  <Image
                    src={card.image}
                    alt={card.title}
                    width={1024}
                    height={1536}
                    priority={i === 0}
                    sizes="(max-width:768px) 100vw, 50vw"
                    className="h-auto w-full"
                  />
                  {!card.href && (
                    <span className="absolute left-4 top-4 bg-white/90 px-3 py-1.5 text-[10px] uppercase tracking-[0.24em]">
                      Coming soon
                    </span>
                  )}
                </div>
                <div className="mt-6 flex items-baseline gap-4">
                  <span className="font-serif text-sm text-muted">({card.number})</span>
                  <div>
                    <h2 className="font-serif text-2xl font-normal leading-tight md:text-3xl">
                      {card.title}
                    </h2>
                    <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted">
                      {card.description}
                    </p>
                    <p className="mt-4 text-[11px] uppercase tracking-[0.22em] text-muted">
                      {card.colors}
                    </p>
                    {card.href && (
                      <span className="mt-5 inline-block border-b border-ink pb-1 text-[11px] uppercase tracking-[0.22em] transition-opacity group-hover:opacity-60">
                        Discover
                      </span>
                    )}
                  </div>
                </div>
              </>
            );

            return (
              <Reveal key={card.number} as="article" delay={i * 150} className={i === 1 ? 'md:mt-24' : ''}>
                {card.href ? (
                  <Link href={card.href} className="group block">
                    {inner}
                  </Link>
                ) : (
                  <div className="group">{inner}</div>
                )}
              </Reveal>
            );
          })}
        </div>
      </main>
    </>
  );
}

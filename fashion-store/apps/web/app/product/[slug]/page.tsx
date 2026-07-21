import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SiteHeader } from '@/components/SiteHeader';
import { ProductGallery } from '@/components/ProductGallery';
import { ProductPurchase } from '@/components/ProductPurchase';
import { getProductBySlug } from '@/lib/products';
import { formatPrice } from '@/lib/format';
import { buildMetadata, productJsonLd, breadcrumbJsonLd } from '@/lib/seo';

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return buildMetadata({ title: 'Product not found — 2S Fashion' });
  return buildMetadata({
    title: `${product.name}${product.color ? ` — ${product.color}` : ''} — 2S Fashion`,
    description: product.description,
    alternates: { canonical: `/product/${product.slug}` },
    openGraph: { images: product.images.slice(0, 1) },
  });
}

export default async function ProductPage({ params }: Params) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const colorways = product.colorways ?? [];

  return (
    <>
      <SiteHeader />
      <main className="pt-14">
        <div className="lg:flex lg:items-start">
          {/* Gallery — swipe slider on mobile/tablet, stacked column on desktop */}
          <div className="lg:w-[58%]">
            <ProductGallery images={product.images} name={product.name} />
          </div>

          {/* Sticky info panel */}
          <aside className="px-5 py-8 md:px-6 md:py-10 lg:sticky lg:top-14 lg:flex lg:min-h-[calc(100vh-3.5rem)]
            lg:w-[42%] lg:flex-col lg:justify-center lg:px-14">
            <nav aria-label="Breadcrumb" className="mb-8 text-[11px] uppercase tracking-[0.18em] text-muted">
              <Link href="/" className="hover:text-ink">Home</Link>
              <span className="px-2">/</span>
              <Link href="/collection" className="hover:text-ink">Collection</Link>
              <span className="px-2">/</span>
              <span className="capitalize">{product.category}</span>
            </nav>

            <h1 className="font-serif text-[clamp(24px,3vw,38px)] font-normal leading-tight">
              {product.name}
            </h1>
            <p className="mt-2 text-lg">{formatPrice(product)}</p>
            <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-muted">
              MRP incl. of all taxes
            </p>

            {/* Colourways from DB */}
            {colorways.length > 0 && (
              <div className="mt-8 max-w-sm">
                <div className="mb-2 text-[11px] uppercase tracking-[0.2em] text-muted">
                  Colour
                  {product.color ? (
                    <span className="ml-2 normal-case tracking-normal text-ink">{product.color}</span>
                  ) : null}
                </div>
                <div className="flex flex-wrap gap-2">
                  {colorways.map((cw) => {
                    const selected = cw.slug === product.slug;
                    return (
                      <Link
                        key={cw.slug}
                        href={`/product/${cw.slug}`}
                        aria-current={selected ? 'page' : undefined}
                        className={`inline-flex h-11 items-center px-4 text-sm transition-colors
                          ${selected ? 'border border-ink bg-ink text-white' : 'border border-line hover:border-ink'}`}
                      >
                        {cw.color}
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Availability from DB */}
            <p className={`mt-6 text-[11px] uppercase tracking-[0.2em] ${product.inStock ? 'text-muted' : 'text-red-600'}`}>
              {product.inStock ? 'In stock — ready to ship' : 'Currently unavailable'}
            </p>

            <div className="mt-6 max-w-sm">
              <ProductPurchase product={product} />
            </div>

            <p className="mt-8 max-w-sm text-sm leading-relaxed text-muted">{product.description}</p>

            <div className="mt-8 max-w-sm divide-y divide-line border-y border-line text-sm">
              <details className="group">
                <summary className="flex cursor-pointer list-none items-center justify-between py-4
                  text-[11px] uppercase tracking-[0.18em]">
                  Composition &amp; care
                  <span className="text-muted transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="pb-4 text-muted">
                  Outer: 100% natural fibres. Dry clean only. Made responsibly.
                </p>
              </details>
              <details className="group">
                <summary className="flex cursor-pointer list-none items-center justify-between py-4
                  text-[11px] uppercase tracking-[0.18em]">
                  Shipping &amp; returns
                  <span className="text-muted transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="pb-4 text-muted">
                  Free shipping over €200. Free returns within 30 days.
                </p>
              </details>
            </div>
          </aside>
        </div>
      </main>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd(product)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd(product)) }}
      />
    </>
  );
}

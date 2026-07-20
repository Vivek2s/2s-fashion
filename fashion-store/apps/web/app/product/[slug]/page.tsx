import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SliderHeader } from '@/components/SliderHeader';
import { ProductGallery } from '@/components/ProductGallery';
import { ProductPurchase } from '@/components/ProductPurchase';
import { getProductBySlug } from '@/lib/products';
import { buildMetadata, productJsonLd, breadcrumbJsonLd } from '@/lib/seo';

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return buildMetadata({ title: 'Product not found — ATELIER' });
  return buildMetadata({
    title: `${product.name} — ATELIER`,
    description: product.description,
    alternates: { canonical: `/product/${product.slug}` },
    openGraph: { images: product.images.slice(0, 1) },
  });
}

export default async function ProductPage({ params }: Params) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  return (
    <>
      <SliderHeader />
      <main className="pt-14">
        <div className="lg:flex lg:items-start">
          {/* Gallery */}
          <div className="lg:w-[58%]">
            <ProductGallery images={product.images} name={product.name} />
          </div>

          {/* Sticky info panel */}
          <aside className="px-6 py-10 lg:sticky lg:top-14 lg:flex lg:min-h-[calc(100vh-3.5rem)]
            lg:w-[42%] lg:flex-col lg:justify-center lg:px-14">
            <nav aria-label="Breadcrumb" className="mb-8 text-[11px] uppercase tracking-[0.18em] text-muted">
              <Link href="/" className="hover:text-ink">Home</Link>
              <span className="px-2">/</span>
              <Link href="/shop" className="hover:text-ink capitalize">{product.category}</Link>
            </nav>

            <h1 className="font-serif text-[clamp(24px,3vw,38px)] font-normal leading-tight">
              {product.name}
            </h1>
            <p className="mt-2 text-lg">€{product.price}</p>
            <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-muted">
              MRP incl. of all taxes
            </p>

            <div className="mt-8 max-w-sm">
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
                  Outer: 100% natural fibres. Dry clean only. Made responsibly in Portugal.
                </p>
              </details>
              <details className="group">
                <summary className="flex cursor-pointer list-none items-center justify-between py-4
                  text-[11px] uppercase tracking-[0.18em]">
                  Shipping &amp; returns
                  <span className="text-muted transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="pb-4 text-muted">
                  Free carbon-neutral shipping over €200. Free returns within 30 days.
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

import { collectionJsonLd } from '@/lib/seo';
import { getFeaturedProducts } from '@/lib/products';

/**
 * Homepage — renders the ORIGINAL theme verbatim.
 *
 * `/public/lasse/index.html` is the old site's exact HTML, driven by its own
 * original stylesheet + script (loaded from lassepedersen.biz), so text, images
 * and every animation match 1:1 — nothing is re-implemented. To make it yours,
 * edit that file's slides (data-client / data-length / image URLs).
 *
 * Trade-off (deliberate, revisit before launch): the slider lives in an iframe,
 * so its content isn't crawlable and its internal nav links point at the old
 * site's routes. The React port (`components/EditorialSlider.tsx`) is kept as
 * the SEO-friendly replacement to swap back in once its motion is approved.
 */
export default async function HomePage() {
  const products = await getFeaturedProducts();

  return (
    <>
      <main>
        <h1 className="sr-only">ATELIER — Autumn / Winter 2026 collection lookbook</h1>
        <iframe
          src="/lasse/index.html"
          title="Editorial lookbook"
          className="fixed inset-0 h-full w-full border-0"
        />
      </main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd(products)) }}
      />
    </>
  );
}

import { collectionJsonLd } from '@/lib/seo';
import { getFeaturedProducts } from '@/lib/products';

/**
 * Homepage — the 2S Fashion editorial lookbook.
 *
 * Serves `/lasse-test/index.html`: the original theme engine rebranded to
 * 2S Fashion (local patched `/lasse-test/scripts.min.js`) with our own product
 * imagery. Edit that file to change slides/images. The untouched original is
 * archived at `/homepage` for reference.
 *
 * Trade-off (revisit before launch): iframe content isn't crawlable; the React
 * port (`components/EditorialSlider.tsx`) remains the SEO-friendly replacement.
 */
export default async function HomePage() {
  const products = await getFeaturedProducts();

  return (
    <>
      <main>
        <h1 className="sr-only">2S Fashion — Modern Contemporary</h1>
        <iframe
          src="/lasse-test/index.html"
          title="2S Fashion editorial lookbook"
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

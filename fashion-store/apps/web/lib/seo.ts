import type { Metadata } from 'next';
import type { Product } from '@fashion-store/shared-types';

export const SITE = {
  name: '2S Fashion',
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
  description:
    '2S Fashion is a modern contemporary menswear label from India. Shop draped georgette and satin shirts — fluid silhouettes, considered tailoring, made to move.',
  locale: 'en_IN',
};

/** Build per-page metadata with sane SEO defaults. */
export function buildMetadata(overrides: Partial<Metadata> = {}): Metadata {
  const title = (overrides.title as string) ?? `${SITE.name} — Modern Contemporary Menswear`;
  return {
    metadataBase: new URL(SITE.url),
    title,
    description: (overrides.description as string) ?? SITE.description,
    alternates: { canonical: '/' },
    openGraph: {
      title,
      description: (overrides.description as string) ?? SITE.description,
      url: SITE.url,
      siteName: SITE.name,
      locale: SITE.locale,
      type: 'website',
    },
    twitter: { card: 'summary_large_image', title, description: SITE.description },
    robots: { index: true, follow: true },
    ...overrides,
  };
}

/** JSON-LD for the brand. Inject in the root layout. */
export function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE.name,
    url: SITE.url,
    description: SITE.description,
  };
}

/** JSON-LD ItemList for the homepage lookbook (helps product carousels rank). */
export function collectionJsonLd(products: Product[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${SITE.name} — Autumn / Winter 2026`,
    itemListElement: products.slice(0, 6).map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: `${SITE.url}/product/${p.slug}`,
      name: p.name,
    })),
  };
}

/** JSON-LD breadcrumb trail for a product detail page. */
export function breadcrumbJsonLd(p: Product) {
  const crumbs = [
    { name: 'Home', url: SITE.url },
    { name: 'Shop', url: `${SITE.url}/shop` },
    { name: p.name, url: `${SITE.url}/product/${p.slug}` },
  ];
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      item: c.url,
    })),
  };
}

/** JSON-LD for a product (use on product detail pages). */
export function productJsonLd(p: Product) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: p.name,
    description: p.description,
    image: p.images,
    offers: {
      '@type': 'Offer',
      price: p.price,
      priceCurrency: p.currency,
      availability: p.inStock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
    },
  };
}

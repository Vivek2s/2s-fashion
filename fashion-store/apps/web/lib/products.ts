import type { Product } from '@fashion-store/shared-types';

const IMG = (p: string) => `https://images.unsplash.com/${p}?q=80&w=1200&auto=format&fit=crop`;
const API = process.env.NEXT_PUBLIC_API_URL;

const base = [
  { slug: 'wool-overcoat', name: 'Wool Overcoat', price: 480, category: 'womenswear', tag: 'New', photo: 'photo-1591047139829-d91aecb6caea' },
  { slug: 'silk-slip-dress', name: 'Silk Slip Dress', price: 260, category: 'womenswear', tag: undefined, photo: 'photo-1595777457583-95e059d581b8' },
  { slug: 'tailored-trouser', name: 'Tailored Trouser', price: 190, category: 'womenswear', tag: undefined, photo: 'photo-1594633312681-425c7b97ccd1' },
  { slug: 'cashmere-knit', name: 'Cashmere Knit', price: 220, category: 'womenswear', tag: 'Limited', photo: 'photo-1576566588028-4147f3842f27' },
  { slug: 'linen-shirt', name: 'Linen Shirt', price: 140, category: 'menswear', tag: undefined, photo: 'photo-1602810318383-e386cc2a3ccf' },
  { slug: 'leather-boot', name: 'Leather Boot', price: 340, category: 'accessories', tag: 'New', photo: 'photo-1608256246200-53e635b5b65f' },
  { slug: 'structured-bag', name: 'Structured Bag', price: 390, category: 'accessories', tag: undefined, photo: 'photo-1584917865442-de89df76afd3' },
  { slug: 'pleated-skirt', name: 'Pleated Skirt', price: 180, category: 'womenswear', tag: undefined, photo: 'photo-1583496661160-fb5886a0aaaa' },
] as const;

/** Local fallback so pages render even when the API/DB is down. */
export const SEED_PRODUCTS: Product[] = base.map((p, i) => ({
  id: p.slug,
  slug: p.slug,
  name: p.name,
  description: `${p.name} from the AW26 collection — quiet silhouettes in natural fibres, made to last.`,
  price: p.price,
  currency: 'EUR',
  images: [p.photo, base[(i + 1) % base.length].photo, base[(i + 3) % base.length].photo].map(IMG),
  category: p.category as Product['category'],
  tag: p.tag as Product['tag'],
  featured: true,
  sizes: ['XS', 'S', 'M', 'L'],
  inStock: true,
  createdAt: '2026-01-01T00:00:00.000Z',
}));

export async function getFeaturedProducts(): Promise<Product[]> {
  try {
    const res = await fetch(`${API}/api/products?featured=true`, { next: { revalidate: 300 } });
    if (!res.ok) throw new Error('bad response');
    const json = await res.json();
    const data = json.data as Product[];
    return data.length ? data : SEED_PRODUCTS;
  } catch {
    return SEED_PRODUCTS;
  }
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    const res = await fetch(`${API}/api/products/${slug}`, { next: { revalidate: 300 } });
    if (res.ok) {
      const json = await res.json();
      if (json.data) return json.data as Product;
    }
  } catch {
    // fall through to seed
  }
  return SEED_PRODUCTS.find((p) => p.slug === slug) ?? null;
}

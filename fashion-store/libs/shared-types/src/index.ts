// Shared contract used by BOTH apps/web and apps/api so types never drift.

export interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;        // in minor units? here: whole euros
  currency: 'EUR' | 'USD' | 'GBP';
  images: string[];
  category: 'womenswear' | 'menswear' | 'accessories';
  tag?: 'New' | 'Limited' | 'Sale';
  featured: boolean;
  sizes: string[];
  inStock: boolean;
  createdAt: string;
}

export interface Collection {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  heroImage: string;
  productIds: string[];
}

export interface ApiList<T> {
  data: T[];
  total: number;
}

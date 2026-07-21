import type { Product } from '@fashion-store/shared-types';

const CURRENCY_SYMBOL: Record<Product['currency'], string> = {
  INR: '₹',
  EUR: '€',
  USD: '$',
  GBP: '£',
};

/** "₹5,999" — symbol + Indian digit grouping. */
export function formatPrice(product: Pick<Product, 'price' | 'currency'>): string {
  return `${CURRENCY_SYMBOL[product.currency]}${product.price.toLocaleString('en-IN')}`;
}

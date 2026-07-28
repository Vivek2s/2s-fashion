// Shared contract used by BOTH apps/web and apps/api so types never drift.

export interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;        // in minor units? here: whole euros
  currency: 'EUR' | 'USD' | 'GBP' | 'INR';
  images: string[];
  category: 'womenswear' | 'menswear' | 'accessories';
  tag?: 'New' | 'Limited' | 'Sale';
  featured: boolean;
  /** This product's colourway, e.g. "Ivory". */
  color?: string;
  /** Sibling colourways of the same style (incl. self), for the PDP selector. */
  colorways?: { color: string; slug: string }[];
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

/** A signed-in customer, keyed by their Firebase Auth UID. */
export interface StoreUser {
  id: string;
  firebaseUid: string;
  email?: string;
  phone?: string;
  displayName?: string;
  photoURL?: string;
  /** Sign-in method used, e.g. "google.com", "facebook.com", "phone". */
  provider?: string;
  createdAt: string;
}

/** Result of submitting a "Get in touch" interest for a product. */
export interface InterestResult {
  /** "created" on first submit, "exists" if this user already submitted. */
  status: 'created' | 'exists';
}

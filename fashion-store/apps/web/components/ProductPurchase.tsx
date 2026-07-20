'use client';

import { useState } from 'react';
import type { Product } from '@fashion-store/shared-types';

export function ProductPurchase({ product }: { product: Product }) {
  const [size, setSize] = useState<string | null>(null);
  const [added, setAdded] = useState(false);
  const [error, setError] = useState(false);

  function addToCart() {
    if (!size) { setError(true); return; }
    setError(false);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 2200);
  }

  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between">
        <span className="text-[11px] uppercase tracking-[0.2em] text-muted">Size</span>
        <button type="button" className="text-[11px] uppercase tracking-[0.2em] text-muted underline underline-offset-4 hover:text-ink">
          Size guide
        </button>
      </div>

      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Select a size">
        {product.sizes.map((s) => {
          const selected = s === size;
          return (
            <button
              key={s}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => { setSize(s); setError(false); }}
              className={`h-11 min-w-[3rem] px-3 text-sm uppercase tracking-wide transition-colors
                ${selected ? 'border border-ink bg-ink text-white' : 'border border-line hover:border-ink'}`}
            >
              {s}
            </button>
          );
        })}
      </div>

      {error && (
        <p className="mt-3 text-[12px] text-red-600" role="alert">Please select a size.</p>
      )}

      <button
        type="button"
        onClick={addToCart}
        disabled={!product.inStock}
        aria-live="polite"
        className="mt-6 h-14 w-full bg-ink text-[12px] uppercase tracking-[0.22em] text-white
          transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {!product.inStock ? 'Out of stock' : added ? 'Added to bag ✓' : 'Add to bag'}
      </button>
    </div>
  );
}

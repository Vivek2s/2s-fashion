'use client';

import { useState } from 'react';
import type { Product } from '@fashion-store/shared-types';

/** Indian size chart (garment measurements, inches). */
const SIZE_GUIDE = [
  { size: 'S', chest: '38"', shoulder: '17"', length: '27"' },
  { size: 'M', chest: '40"', shoulder: '17.5"', length: '28"' },
  { size: 'L', chest: '42"', shoulder: '18"', length: '29"' },
];

export function ProductPurchase({ product }: { product: Product }) {
  const [size, setSize] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);

  function onInterested() {
    if (!size) { setError(true); return; }
    setError(false);
    setSent(true);
    window.setTimeout(() => setSent(false), 2200);
  }

  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between">
        <span className="text-[11px] uppercase tracking-[0.2em] text-muted">Size</span>
        <button
          type="button"
          onClick={() => setGuideOpen(true)}
          className="text-[11px] uppercase tracking-[0.2em] text-muted underline underline-offset-4 hover:text-ink"
        >
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
        onClick={onInterested}
        disabled={!product.inStock}
        aria-live="polite"
        className="mt-6 h-14 w-full bg-ink text-[12px] uppercase tracking-[0.22em] text-white
          transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {!product.inStock ? 'Out of stock' : sent ? 'Thank you ✓' : 'Interested'}
      </button>

      {/* Size guide modal — Indian sizes */}
      {guideOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-label="Size guide"
          onClick={() => setGuideOpen(false)}
        >
          <div
            className="w-full max-w-md bg-white p-6 sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-6 flex items-start justify-between">
              <div>
                <h2 className="font-serif text-xl">Size guide</h2>
                <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-muted">
                  Indian sizes — garment measurements
                </p>
              </div>
              <button
                type="button"
                onClick={() => setGuideOpen(false)}
                aria-label="Close size guide"
                className="-mr-1 -mt-1 p-2 text-xl leading-none transition-opacity hover:opacity-60"
              >
                ×
              </button>
            </div>

            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-line text-[11px] uppercase tracking-[0.18em] text-muted">
                  <th className="py-3 font-normal">Size</th>
                  <th className="py-3 font-normal">Chest</th>
                  <th className="py-3 font-normal">Shoulder</th>
                  <th className="py-3 font-normal">Length</th>
                </tr>
              </thead>
              <tbody>
                {SIZE_GUIDE.filter((r) => product.sizes.includes(r.size)).map((r) => (
                  <tr key={r.size} className="border-b border-line">
                    <td className="py-3 uppercase">{r.size}</td>
                    <td className="py-3">{r.chest}</td>
                    <td className="py-3">{r.shoulder}</td>
                    <td className="py-3">{r.length}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <p className="mt-5 text-[12px] leading-relaxed text-muted">
              Measurements are of the garment laid flat. If you are between sizes,
              we recommend sizing up for a relaxed drape.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

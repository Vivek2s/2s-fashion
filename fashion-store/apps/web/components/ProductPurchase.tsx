'use client';

import { useEffect, useState } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import type { Product } from '@fashion-store/shared-types';
import { firebaseAuth } from '@/lib/firebase';
import { submitInterest } from '@/lib/interests';
import { AuthModal } from './AuthModal';

/** Indian size chart (garment measurements, inches). */
const SIZE_GUIDE = [
  { size: 'S', chest: '38"', shoulder: '17"', length: '27"' },
  { size: 'M', chest: '40"', shoulder: '17.5"', length: '28"' },
  { size: 'L', chest: '42"', shoulder: '18"', length: '29"' },
];

type SubmitState = 'idle' | 'submitting' | 'submitted' | 'already';

export function ProductPurchase({ product }: { product: Product }) {
  const [size, setSize] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [guideOpen, setGuideOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [submitState, setSubmitState] = useState<SubmitState>('idle');

  useEffect(() => onAuthStateChanged(firebaseAuth, setUser), []);

  const flipped = submitState === 'submitted' || submitState === 'already';

  async function submit(signedInUser: User) {
    setSubmitState('submitting');
    try {
      const result = await submitInterest(signedInUser, product.slug, size ?? undefined);
      setSubmitState(result.status === 'exists' ? 'already' : 'submitted');
    } catch {
      setSubmitState('idle');
      setError('Could not submit right now. Please try again.');
    }
  }

  function onGetInTouch() {
    if (flipped || submitState === 'submitting') return;
    if (!size) { setError('Please select a size.'); return; }
    setError(null);
    if (user) {
      void submit(user);
    } else {
      setAuthOpen(true);
    }
  }

  function onAuthSuccess(signedInUser: User) {
    setAuthOpen(false);
    setUser(signedInUser);
    void submit(signedInUser);
  }

  const faceClass =
    'absolute inset-0 flex items-center justify-center text-[12px] uppercase tracking-[0.22em] [backface-visibility:hidden]';

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
              onClick={() => { setSize(s); setError(null); }}
              className={`h-11 min-w-[3rem] px-3 text-sm uppercase tracking-wide transition-colors
                ${selected ? 'border border-ink bg-ink text-white' : 'border border-line hover:border-ink'}`}
            >
              {s}
            </button>
          );
        })}
      </div>

      {error && (
        <p className="mt-3 text-[12px] text-red-600" role="alert">{error}</p>
      )}

      {/* Get in touch — flips over once the interest is recorded */}
      <div className="mt-6 [perspective:900px]">
        <button
          type="button"
          onClick={onGetInTouch}
          disabled={!product.inStock || submitState === 'submitting'}
          aria-live="polite"
          className={`relative h-14 w-full [transform-style:preserve-3d]
            transition-transform duration-700 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)]
            disabled:cursor-not-allowed
            ${flipped ? '[transform:rotateX(180deg)]' : ''}`}
        >
          <span className={`${faceClass} bg-ink text-white transition-opacity hover:opacity-90
            ${!product.inStock ? 'opacity-40' : ''}`}>
            {!product.inStock
              ? 'Out of stock'
              : submitState === 'submitting'
                ? 'Sending…'
                : 'Get in touch'}
          </span>
          <span className={`${faceClass} border border-ink bg-white text-ink [transform:rotateX(180deg)]`}>
            {submitState === 'already' ? 'Already Submitted' : 'Submitted ✓'}
          </span>
        </button>
      </div>

      {authOpen && (
        <AuthModal onClose={() => setAuthOpen(false)} onSuccess={onAuthSuccess} />
      )}

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

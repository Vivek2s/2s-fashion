'use client';

import { useState } from 'react';
import Link from 'next/link';
import { track } from '@/lib/analytics';

/** Indian size chart (garment measurements, inches). */
const SIZE_GUIDE = [
  { size: 'S', chest: '38"', shoulder: '17"', length: '27"' },
  { size: 'M', chest: '40"', shoulder: '17.5"', length: '28"' },
  { size: 'L', chest: '42"', shoulder: '18"', length: '29"' },
];

const MATERIALS = ['Luxury', 'Luxury Supreme'];

/** The storefront's WhatsApp line — orders are placed as a chat, not a cart. */
const WHATSAPP_NUMBER = '918264396542';

type Colorway = { slug: string; color?: string };

type PurchaseProduct = {
  name: string;
  sizes: string[];
  slug: string;
  color?: string;
};

export function ProductPurchase({
  product,
  colorways = [],
}: {
  product: PurchaseProduct;
  colorways?: Colorway[];
}) {
  const [material, setMaterial] = useState<string | null>(null);
  const [size, setSize] = useState<string | null>(null);
  const [guideOpen, setGuideOpen] = useState(false);

  const chipClass = (selected: boolean) =>
    selected ? 'border border-ink bg-ink text-white' : 'border border-line hover:border-ink';

  /**
   * There is no checkout — "Order Now" hands the selection to WhatsApp as a
   * prefilled message, so the customer only has to hit send.
   */
  function onOrderNow() {
    track('order_now', { product: product.name, slug: product.slug, material, size });

    const url = window.location.href;
    const lines = [
      'Hello 2S Fashion 👋',
      '',
      "I'd like to order this piece:",
      '',
      `*${product.name}*`,
      ...(material ? [`Material: ${material}`] : []),
      ...(size ? [`Size: ${size}`] : []),
      '',
      url,
    ];
    const href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lines.join('\n'))}`;
    window.open(href, '_blank', 'noopener,noreferrer');
  }

  return (
    <div>
      <div className="mb-2 text-[11px] uppercase tracking-[0.2em] text-muted">Material</div>
      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Select a material">
        {MATERIALS.map((m) => {
          const selected = m === material;
          return (
            <button
              key={m}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => {
                setMaterial(m);
                track('select_material', { product: product.name, slug: product.slug, material: m });
              }}
              className={`inline-flex h-11 items-center px-4 text-sm transition-colors
                ${chipClass(selected)}`}
            >
              {m}
            </button>
          );
        })}
      </div>

      {colorways.length > 0 && (
        <div className="mt-8">
          <div className="mb-2 text-[11px] uppercase tracking-[0.2em] text-muted">
            Colour
            {product.color ? (
              <span className="ml-2 normal-case tracking-normal text-ink">{product.color}</span>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-2">
            {colorways.map((cw) => {
              const selected = cw.slug === product.slug;
              return (
                <Link
                  key={cw.slug}
                  href={`/product/${cw.slug}`}
                  onClick={() =>
                    track('select_colorway', {
                      product: product.name,
                      from_slug: product.slug,
                      to_slug: cw.slug,
                      color: cw.color,
                    })
                  }
                  aria-current={selected ? 'page' : undefined}
                  className={`inline-flex h-11 items-center px-4 text-sm transition-colors
                    ${chipClass(selected)}`}
                >
                  {cw.color}
                </Link>
              );
            })}
          </div>
        </div>
      )}

      <div className="mb-2 mt-8 flex items-baseline justify-between">
        <span className="text-[11px] uppercase tracking-[0.2em] text-muted">Size</span>
        <button
          type="button"
          onClick={() => {
            setGuideOpen(true);
            track('size_guide_open', { product: product.name, slug: product.slug });
          }}
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
              onClick={() => {
                setSize(s);
                track('select_size', { product: product.name, slug: product.slug, size: s });
              }}
              className={`h-11 min-w-[3rem] px-3 text-sm uppercase tracking-wide transition-colors
                ${chipClass(selected)}`}
            >
              {s}
            </button>
          );
        })}
      </div>

      <div className="mt-6">
        <button
          type="button"
          onClick={onOrderNow}
          className="flex h-14 w-full items-center justify-center bg-ink text-[12px] uppercase
            tracking-[0.22em] text-white transition-opacity hover:opacity-90"
        >
          Order Now
        </button>
      </div>

      {/* Size guide modal — Indian sizes */}
      {guideOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-label="Size guide"
          onClick={() => setGuideOpen(false)}
        >
          <div className="w-full max-w-md bg-white p-6 sm:p-8" onClick={(e) => e.stopPropagation()}>
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

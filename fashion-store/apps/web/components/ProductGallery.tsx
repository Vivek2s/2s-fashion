'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

/**
 * Product gallery.
 * - Mobile / tablet (< lg): a swipeable slider — native scroll-snap with
 *   position dots and an "n / total" counter so the affordance is obvious.
 * - Desktop (lg+): a stacked column of large images.
 */
export function ProductGallery({ images, name }: { images: string[]; name: string }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  // Track which slide is in view (mobile slider only).
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const i = Math.round(track.scrollLeft / track.clientWidth);
        setActive((prev) => (prev === i ? prev : Math.max(0, Math.min(images.length - 1, i))));
      });
    };
    track.addEventListener('scroll', onScroll, { passive: true });
    return () => { track.removeEventListener('scroll', onScroll); cancelAnimationFrame(raf); };
  }, [images.length]);

  const goTo = (i: number) => {
    const track = trackRef.current;
    if (!track) return;
    track.scrollTo({ left: i * track.clientWidth, behavior: 'smooth' });
  };

  return (
    <div className="relative">
      <div
        ref={trackRef}
        className="slider-track flex snap-x snap-mandatory overflow-x-auto lg:block lg:overflow-visible"
        aria-roledescription="carousel"
        aria-label={`${name} images`}
      >
        {images.map((src, i) => (
          <div
            key={i}
            className="relative aspect-[3/4] w-full shrink-0 snap-center bg-neutral-100
              lg:aspect-[4/5] lg:w-auto"
          >
            <Image
              src={src}
              alt={`${name} — view ${i + 1}`}
              fill
              priority={i === 0}
              sizes="(max-width:1024px) 100vw, 58vw"
              className="object-cover"
            />
          </div>
        ))}
      </div>

      {images.length > 1 && (
        <>
          {/* Counter — mobile slider only */}
          <div className="pointer-events-none absolute right-4 top-4 bg-white/85 px-2.5 py-1 text-[11px] tabular-nums tracking-[0.18em] lg:hidden">
            {active + 1} / {images.length}
          </div>

          {/* Dots — mobile slider only */}
          <div className="absolute inset-x-0 bottom-4 flex justify-center gap-2 lg:hidden">
            {images.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Go to image ${i + 1}`}
                aria-current={i === active}
                onClick={() => goTo(i)}
                className={`h-2 w-2 rounded-full transition-all duration-300
                  ${i === active ? 'w-5 bg-ink' : 'bg-ink/25'}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

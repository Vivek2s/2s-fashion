import Image from 'next/image';

/**
 * Zara-style gallery: a full-width swipeable carousel on mobile (native
 * scroll-snap, no JS) and a stacked column of large images on desktop.
 */
export function ProductGallery({ images, name }: { images: string[]; name: string }) {
  return (
    <div className="slider-track flex snap-x snap-mandatory overflow-x-auto lg:block lg:overflow-visible">
      {images.map((src, i) => (
        <div
          key={i}
          className="relative aspect-[3/4] w-full shrink-0 snap-start bg-neutral-100
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
  );
}

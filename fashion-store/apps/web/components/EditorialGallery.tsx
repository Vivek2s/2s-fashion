'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import type { Product } from '@fashion-store/shared-types';

type Panel =
  | { kind: 'intro'; title: string; subtitle: string }
  | { kind: 'look'; product: Product }
  | { kind: 'outro'; title: string; email: string; links: { label: string; href: string }[] };

// Free editorial people/fashion photos (Unsplash) — swap for your own later.
const EDITORIAL = [
  'photo-1490481651871-ab68de25d43d', 'photo-1524504388940-b1c1722653e1',
  'photo-1519085360753-af0119f7cbe7', 'photo-1492691527719-9d1e07e534b4',
  'photo-1487412720507-e7ab37603c6f', 'photo-1509631179647-0177331693ae',
  'photo-1496747611176-843222e1e57c', 'photo-1488161628813-04466f872be2',
  'photo-1502823403499-6ccfcf4fb453', 'photo-1483985988355-763728e1935b',
  'photo-1441984904996-e0b6ba687e04', 'photo-1500648767791-00dcc994a43e',
];
const IMG = (id: string) => `https://images.unsplash.com/${id}?q=80&w=1200&auto=format&fit=crop`;
const pickImg = (i: number) => IMG(EDITORIAL[((i % EDITORIAL.length) + EDITORIAL.length) % EDITORIAL.length]);

export function EditorialGallery({
  products,
  brand = 'ATELIER',
  subtitle = 'Autumn / Winter 2026 — Copenhagen',
  firstImage,
}: {
  products: Product[];
  brand?: string;
  subtitle?: string;
  /** Optional override for the first look's hero image (e.g. a local /public asset). */
  firstImage?: string;
}) {
  const looks = products.slice(0, 6);
  const panels: Panel[] = [
    { kind: 'intro', title: brand, subtitle },
    ...looks.map((product): Panel => ({ kind: 'look', product })),
    {
      kind: 'outro',
      title: 'See the full collection.',
      email: 'studio@atelier.example',
      links: [
        { label: 'Shop', href: '/shop' },
        { label: 'Collections', href: '/collections' },
        { label: 'About', href: '/about' },
        { label: 'Contact', href: '/contact' },
      ],
    },
  ];
  const total = panels.length;

  const vpRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef(0);
  const currentRef = useRef(0);
  const [active, setActive] = useState(0);
  const [dragging, setDragging] = useState(false);

  // Inertia (lerp) scroll + drag + keyboard — fine pointers. Heavier feel to
  // match the reference (lower wheel gain, gentle lerp). Touch = native momentum.
  useEffect(() => {
    const vp = vpRef.current;
    if (!vp) return;
    const fine = window.matchMedia('(pointer: fine)').matches;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!fine || reduce) return;

    const max = () => vp.scrollWidth - vp.clientWidth;
    const clamp = (v: number) => Math.max(0, Math.min(max(), v));
    targetRef.current = currentRef.current = vp.scrollLeft;
    let raf = 0, down = false, startX = 0, startTarget = 0, lastX = 0, vel = 0;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = Math.abs(e.deltaY) >= Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
      targetRef.current = clamp(targetRef.current + delta * 0.62);
    };
    const onDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      down = true; setDragging(true);
      startX = lastX = e.clientX; startTarget = targetRef.current; vel = 0;
      try { vp.setPointerCapture(e.pointerId); } catch { /* ignore */ }
    };
    const onMove = (e: PointerEvent) => {
      if (!down) return;
      vel = e.clientX - lastX; lastX = e.clientX;
      targetRef.current = clamp(startTarget - (e.clientX - startX));
    };
    const onUp = () => {
      if (!down) return;
      down = false; setDragging(false);
      targetRef.current = clamp(targetRef.current - vel * 14);
    };
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
      if (e.key === 'ArrowRight') { e.preventDefault(); targetRef.current = clamp(targetRef.current + vp.clientWidth * 0.7); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); targetRef.current = clamp(targetRef.current - vp.clientWidth * 0.7); }
      else if (e.key === 'Home') { e.preventDefault(); targetRef.current = 0; }
      else if (e.key === 'End') { e.preventDefault(); targetRef.current = max(); }
    };
    const loop = () => {
      currentRef.current += (targetRef.current - currentRef.current) * 0.085;
      if (Math.abs(targetRef.current - currentRef.current) < 0.4) currentRef.current = targetRef.current;
      vp.scrollLeft = currentRef.current;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    vp.addEventListener('wheel', onWheel, { passive: false });
    vp.addEventListener('pointerdown', onDown);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('keydown', onKey);
    return () => {
      cancelAnimationFrame(raf);
      vp.removeEventListener('wheel', onWheel);
      vp.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('keydown', onKey);
    };
  }, []);

  // Native keyboard paging for touch / reduced-motion.
  useEffect(() => {
    const vp = vpRef.current;
    if (!vp) return;
    const fine = window.matchMedia('(pointer: fine)').matches;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (fine && !reduce) return;
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
      if (e.key === 'ArrowRight') { e.preventDefault(); vp.scrollBy({ left: vp.clientWidth * 0.7, behavior: 'smooth' }); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); vp.scrollBy({ left: -vp.clientWidth * 0.7, behavior: 'smooth' }); }
      else if (e.key === 'Home') { e.preventDefault(); vp.scrollTo({ left: 0, behavior: 'smooth' }); }
      else if (e.key === 'End') { e.preventDefault(); vp.scrollTo({ left: vp.scrollWidth, behavior: 'smooth' }); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Counter — the panel aligned to the left edge is "current".
  useEffect(() => {
    const vp = vpRef.current;
    if (!vp) return;
    let raf = 0;
    const update = () => {
      const els = Array.from(vp.querySelectorAll<HTMLElement>('[data-panel]'));
      const leftRef = vp.scrollLeft + vp.clientWidth * 0.5;
      let nearest = 0, best = Infinity;
      els.forEach((el, i) => {
        const center = el.offsetLeft + el.offsetWidth / 2;
        const d = Math.abs(center - leftRef);
        if (d < best) { best = d; nearest = i; }
      });
      const maxSL = vp.scrollWidth - vp.clientWidth;
      if (vp.scrollLeft >= maxSL - 2) nearest = els.length - 1;
      else if (vp.scrollLeft <= 2) nearest = 0;
      setActive((prev) => (prev === nearest ? prev : nearest));
    };
    const onScroll = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(update); };
    update();
    vp.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => { vp.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); cancelAnimationFrame(raf); };
  }, []);

  return (
    <div className={`gallery relative h-[100svh] w-full overflow-hidden ${dragging ? 'is-dragging' : ''}`}>
      <DragCursor dragging={dragging} />

      <div
        ref={vpRef}
        className="gallery-vp flex h-full w-full overflow-x-auto overflow-y-hidden"
        aria-roledescription="carousel"
        aria-label="Collection lookbook"
      >
        <div className="flex h-full items-center">
          {/* Left spacer so the intro brand sits centered at scroll 0 (desktop). */}
          <div className="hidden shrink-0 md:block md:w-[18vw]" aria-hidden />
          {panels.map((panel, i) => (
            <PanelView key={i} panel={panel} index={i} total={total} firstImage={firstImage} />
          ))}
          <div className="hidden shrink-0 md:block md:w-[12vw]" aria-hidden />
        </div>
      </div>

      <div className="sr-only" aria-live="polite" aria-atomic="true">{`Slide ${active + 1} of ${total}`}</div>

      <div className="ui-in u4 pointer-events-none absolute bottom-6 right-6 z-30 text-[11px] tracking-[0.24em] tabular-nums mix-blend-difference text-white md:bottom-8 md:right-10">
        {String(active + 1).padStart(2, '0')} <span className="opacity-50">/ {String(total).padStart(2, '0')}</span>
      </div>

      <div className="absolute bottom-0 left-0 z-30 h-px w-full bg-black/10">
        <div className="h-full bg-ink transition-[width] duration-300 ease-out" style={{ width: `${((active + 1) / total) * 100}%` }} />
      </div>
    </div>
  );
}

function PanelView({ panel, index, total, firstImage }: { panel: Panel; index: number; total: number; firstImage?: string }) {
  const num = String(index + 1).padStart(2, '0');

  if (panel.kind === 'intro') {
    return (
      <section data-panel className="panel relative flex h-full w-screen shrink-0 flex-col items-center justify-center px-6 text-center md:w-[64vw]">
        <p className="brand-in mb-5 text-[11px] uppercase tracking-[0.3em] text-muted">{panel.subtitle}</p>
        <h2 className="brand-in b2 font-serif font-normal leading-[0.84] tracking-tight text-[clamp(64px,13vw,240px)]">{panel.title}</h2>
        <div className="brand-in b3 mt-10 flex items-center gap-3 text-[11px] uppercase tracking-[0.26em] text-muted">
          Scroll <span className="block h-px w-14 bg-ink/40" aria-hidden />
        </div>
      </section>
    );
  }

  if (panel.kind === 'outro') {
    return (
      <section data-panel className="panel flex h-full w-screen shrink-0 flex-col justify-center px-8 md:w-[48vw] md:px-16">
        <p className="mb-4 text-[11px] uppercase tracking-[0.3em] text-muted">{num} — Index</p>
        <h2 className="font-serif font-normal leading-[0.95] text-[clamp(34px,5vw,88px)]">{panel.title}</h2>
        <nav className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-sm uppercase tracking-[0.18em]">
          {panel.links.map((l) => (
            <Link key={l.href} href={l.href} className="border-b border-transparent pb-1 transition-colors hover:border-ink">{l.label}</Link>
          ))}
        </nav>
        <a href={`mailto:${panel.email}`} className="mt-10 text-muted transition-colors hover:text-ink">{panel.email}</a>
      </section>
    );
  }

  // look — "bunk" composition: 3 images arranged per a template (types a–f),
  // with a big serif title + count and a counter. DOM order = [side, MAIN, side].
  const p = panel.product;
  const types = ['a', 'b', 'c', 'd', 'e', 'f'] as const;
  const bt = types[(index - 1 + types.length) % types.length];
  // First look uses the caller-supplied hero image (your own asset) if given.
  const main = index === 1 && firstImage ? firstImage : pickImg(index * 3);
  const side1 = pickImg(index * 3 + 1);
  const side3 = pickImg(index * 3 + 2);
  const count = String(p.images.length).padStart(2, '0');
  return (
    <figure data-panel className={`panel bunk bunk-${bt} relative h-full shrink-0`}>
      <Link href={`/product/${p.slug}`} className="relative block h-full w-full">
        <div className="bunk-elements">
          <div className="be"><Image src={side1} alt="" fill sizes="30vh" className="object-cover grayscale" /></div>
          <div className="be"><Image src={main} alt={p.name} fill priority={index <= 2} sizes="(max-width:768px) 74vw, 72vh" className="anim-img object-cover grayscale" /></div>
          <div className="be"><Image src={side3} alt="" fill sizes="30vh" className="object-cover grayscale" /></div>
        </div>
        <h2 className="bunk-title">
          {p.name}<sup>({count})</sup>
        </h2>
        <div className="bunk-meta">
          <span>{num}</span>
          <span className="sq" aria-hidden />
          <span className="opacity-70">{String(total).padStart(2, '0')}</span>
          <span className="ml-3 opacity-90">€{p.price} — View</span>
        </div>
      </Link>
    </figure>
  );
}

function DragCursor({ dragging }: { dragging: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    if (!window.matchMedia('(pointer: fine) and (min-width: 768px)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const dot = ref.current;
    if (!dot) return;
    setOn(true);
    let raf = 0;
    const move = (e: MouseEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => { dot.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`; });
    };
    window.addEventListener('mousemove', move);
    return () => { window.removeEventListener('mousemove', move); cancelAnimationFrame(raf); };
  }, []);
  if (!on) return null;
  return (
    <div ref={ref} aria-hidden className={`drag-cursor pointer-events-none fixed left-0 top-0 z-40 flex items-center justify-center rounded-full mix-blend-difference text-[9px] uppercase tracking-[0.16em] text-white ring-1 ring-white/70 ${dragging ? 'h-20 w-20' : 'h-16 w-16'}`}>Drag</div>
  );
}

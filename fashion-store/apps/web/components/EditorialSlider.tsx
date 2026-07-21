'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { EDITORIAL, type EditorialSlide } from '@/lib/editorial';

/**
 * EditorialSlider — a faithful port of the original `lassepedersen.biz` home.
 *
 * A JS-translated horizontal track of fixed-width "bunk" slots. Each project is
 * three images sized by aspect ratio (height in vh, width auto) and positioned
 * by translateX offsets in vh (see `.bunk-*` in globals.css — lifted 1:1 from
 * the original stylesheet). Motion is inertia (wheel / drag / keys). Chrome
 * matches the original: one fixed centred serif title whose words fade up on
 * each slide change, and a serif index/length counter with a square divider.
 *
 * Content lives in `lib/editorial.ts`. Swap those entries to make it yours.
 */

const pad = (n: number) => String(n).padStart(2, '0');

export function EditorialSlider({ slides = EDITORIAL }: { slides?: EditorialSlide[] } = {}) {
  const total = slides.length;

  const wrapRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef(0);
  const currentRef = useRef(0);
  const maxRef = useRef(0);
  const layoutRef = useRef<{ left: number; width: number }[]>([]);
  const [active, setActive] = useState(0);
  const [titleIn, setTitleIn] = useState(false);
  const [dragging, setDragging] = useState(false);

  // Lay the absolutely-positioned slides end-to-end (widths come from CSS, so
  // this is stable before images load) and size the track.
  useLayoutEffect(() => {
    const track = trackRef.current;
    const wrap = wrapRef.current;
    if (!track || !wrap) return;
    const measure = () => {
      const els = Array.from(track.querySelectorAll<HTMLElement>('.ed-slide'));
      let x = 0;
      const layout = els.map((el) => {
        const width = el.offsetWidth;
        el.style.left = `${x}px`;
        const rec = { left: x, width };
        x += width;
        return rec;
      });
      track.style.width = `${x}px`;
      layoutRef.current = layout;
      maxRef.current = Math.max(0, x - wrap.clientWidth);
      targetRef.current = Math.min(targetRef.current, maxRef.current);
      currentRef.current = Math.min(currentRef.current, maxRef.current);
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  // Inertia translate of the track + active tracking (wheel / drag / keyboard).
  useEffect(() => {
    const track = trackRef.current;
    const wrap = wrapRef.current;
    if (!track || !wrap) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const clamp = (v: number) => Math.max(0, Math.min(maxRef.current, v));
    let raf = 0, down = false, startX = 0, startTarget = 0, lastX = 0, vel = 0;

    const updateActive = () => {
      const ref = currentRef.current + wrap.clientWidth * 0.5;
      const layout = layoutRef.current;
      let nearest = 0, best = Infinity;
      layout.forEach((s, i) => {
        const centre = s.left + s.width / 2;
        const d = Math.abs(centre - ref);
        if (d < best) { best = d; nearest = i; }
      });
      setActive((prev) => (prev === nearest ? prev : nearest));
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = Math.abs(e.deltaY) >= Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
      targetRef.current = clamp(targetRef.current + delta * 0.62);
    };
    const onDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      down = true; setDragging(true);
      startX = lastX = e.clientX; startTarget = targetRef.current; vel = 0;
      try { wrap.setPointerCapture(e.pointerId); } catch { /* ignore */ }
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
      const page = wrap.clientWidth * 0.7;
      if (e.key === 'ArrowRight') { e.preventDefault(); targetRef.current = clamp(targetRef.current + page); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); targetRef.current = clamp(targetRef.current - page); }
      else if (e.key === 'Home') { e.preventDefault(); targetRef.current = 0; }
      else if (e.key === 'End') { e.preventDefault(); targetRef.current = maxRef.current; }
    };

    const loop = () => {
      const k = reduce ? 1 : 0.085;
      currentRef.current += (targetRef.current - currentRef.current) * k;
      if (Math.abs(targetRef.current - currentRef.current) < 0.4) currentRef.current = targetRef.current;
      track.style.transform = `translate3d(${-currentRef.current}px,0,0)`;
      updateActive();
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    wrap.addEventListener('wheel', onWheel, { passive: false });
    wrap.addEventListener('pointerdown', onDown);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('keydown', onKey);
    return () => {
      cancelAnimationFrame(raf);
      wrap.removeEventListener('wheel', onWheel);
      wrap.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('keydown', onKey);
    };
  }, []);

  // Replay the title word-reveal whenever the active project changes.
  useEffect(() => {
    setTitleIn(false);
    let r2 = 0;
    const r1 = requestAnimationFrame(() => { r2 = requestAnimationFrame(() => setTitleIn(true)); });
    return () => { cancelAnimationFrame(r1); cancelAnimationFrame(r2); };
  }, [active]);

  const current = slides[active];

  return (
    <div className={`ed ${dragging ? 'is-dragging' : ''}`} ref={wrapRef} style={{ touchAction: 'none' }}>
      <DragCursor dragging={dragging} />

      <div className="ed-track" ref={trackRef}>
        {slides.map((slide, i) => (
          <Slide key={`${slide.href}-${i}`} slide={slide} priority={i <= 1} />
        ))}
      </div>

      {/* Fixed centred title (original #slider-info). */}
      <h2 className={`ed-info ${titleIn ? 'in' : ''}`} aria-live="polite">
        {current.client.split(' ').map((w, i) => (
          <span className="word" key={i}>{w}</span>
        ))}
        <sup>({pad(current.length)})</sup>
        <span className="cat">{current.category}</span>
      </h2>

      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {`Slide ${active + 1} of ${total} — ${current.client}`}
      </div>

      {/* "Scroll / Swipe" hint (original hamburger-line labels). */}
      <div className="ui-in u3 pointer-events-none absolute bottom-6 right-6 z-40 flex items-center gap-3 text-[11px] uppercase tracking-[0.24em] text-ink md:bottom-8 md:right-12">
        <span className="hidden md:inline">Scroll</span>
        <span className="md:hidden">Swipe</span>
        <span className="block h-px w-10 bg-ink/40" aria-hidden />
      </div>

      {/* Index / length counter (original .slider-ui). */}
      <div className="ed-ui ui-in u4">
        <span>{pad(active + 1)}</span>
        <span className="box" aria-hidden />
        <span className="len">{pad(total)}</span>
      </div>
    </div>
  );
}

/** One project — a "bunk" of three images per template type. */
function Slide({ slide, priority }: { slide: EditorialSlide; priority: boolean }) {
  const reveal = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.parentElement?.classList.add('show');
  };
  const href = /^(https?:|\/)/.test(slide.href) ? slide.href : `https://lassepedersen.biz/${slide.href}`;
  return (
    <figure className={`ed-slide bunk bunk-${slide.type}`} data-slide>
      <Link href={href} className="block h-full w-full">
        <div className="bunk-elements">
          {slide.images.map((im, k) => (
            <div
              className="be"
              key={k}
              style={{ backgroundColor: '#f1f1f1' }}
            >
              <Image
                src={im.src}
                alt={k === 1 ? slide.client : ''}
                width={im.w}
                height={im.h}
                priority={priority && k === 1}
                sizes="72vh"
                style={{ height: '100%', width: 'auto' }}
                onLoad={reveal}
              />
            </div>
          ))}
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

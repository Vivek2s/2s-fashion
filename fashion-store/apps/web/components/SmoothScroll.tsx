'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';

/**
 * Lerp-based momentum scrolling (wheel + touch swipe), matching the reference
 * site's smooth editorial feel. Progressive enhancement only: the page scrolls
 * natively without this, and it self-disables when the user prefers reduced
 * motion. Renders nothing.
 */
export function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    // Pages with no vertical overflow (e.g. the full-screen horizontal slider
    // homepage) must keep native wheel events — don't let Lenis capture them.
    if (document.documentElement.scrollHeight <= window.innerHeight + 4) return;

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // expo-out
      smoothWheel: true,
      touchMultiplier: 1.6,
    });

    let raf = 0;
    const loop = (time: number) => {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
    };
  }, []);

  return null;
}

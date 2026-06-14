'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { useGallery } from '@/lib/store';
import { setLenis } from '@/lib/lenis';

/**
 * Owns smooth scrolling and input. One GSAP-ticker RAF drives Lenis; every
 * scroll publishes a normalized progress (0..1) to the store, and a global
 * pointer listener publishes normalized pointer (-1..1). The R3F loop reads
 * these — a single source of truth, so the camera/cards never fight the scroll.
 */
export function ScrollController({ children }: { children: React.ReactNode }) {
  const setScroll = useGallery((s) => s.setScroll);
  const setPointer = useGallery((s) => s.setPointer);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.3,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 0.85,
      touchMultiplier: 1.3,
      lerp: 0.08,
    });
    setLenis(lenis);

    lenis.on('scroll', ({ scroll, limit }: { scroll: number; limit: number }) => {
      setScroll(limit > 0 ? scroll / limit : 0);
    });

    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    const onPointer = (e: PointerEvent) => {
      setPointer((e.clientX / window.innerWidth) * 2 - 1, -((e.clientY / window.innerHeight) * 2 - 1));
    };
    window.addEventListener('pointermove', onPointer, { passive: true });

    return () => {
      gsap.ticker.remove(raf);
      window.removeEventListener('pointermove', onPointer);
      setLenis(null);
      lenis.destroy();
    };
  }, [setScroll, setPointer]);

  return <>{children}</>;
}

'use client';

import { useEffect } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { useGallery } from '@/lib/store';
import { useIsMobile } from '@/hooks/useIsMobile';

/** Spring-trailing white ring cursor; grows when hovering a card. Hidden on touch. */
export function Cursor() {
  const isMobile = useIsMobile();
  const hovered = useGallery((s) => s.hoveredId !== null);
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const sx = useSpring(x, { stiffness: 380, damping: 30, mass: 0.5 });
  const sy = useSpring(y, { stiffness: 380, damping: 30, mass: 0.5 });

  useEffect(() => {
    if (isMobile) return;
    const move = (e: PointerEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
    };
    window.addEventListener('pointermove', move, { passive: true });
    return () => window.removeEventListener('pointermove', move);
  }, [isMobile, x, y]);

  if (isMobile) return null;

  return (
    <motion.div className="pointer-events-none fixed left-0 top-0 z-50" style={{ x: sx, y: sy }}>
      <motion.div
        className="rounded-full border border-white/70"
        animate={{ width: hovered ? 46 : 22, height: hovered ? 46 : 22, opacity: hovered ? 1 : 0.7 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        style={{ transform: 'translate(-50%, -50%)' }}
      />
    </motion.div>
  );
}

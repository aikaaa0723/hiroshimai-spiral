'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useGallery } from '@/lib/store';
import { WORKS } from '@/data/works';

const pad2 = (n: number) => n.toString().padStart(2, '0');

/**
 * Bottom-left position indicator: which card the camera is nearest, the total
 * count, and a thin progress bar of overall travel. The bar width is written to
 * the DOM directly each frame (subscribed outside React's render).
 */
export function PositionIndicator() {
  const activeIndex = useGallery((s) => s.activeIndex);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsub = useGallery.subscribe((s) => {
      if (barRef.current) barRef.current.style.transform = `scaleX(${Math.max(0.02, s.scroll)})`;
    });
    return unsub;
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6, duration: 1 }}
      className="fixed bottom-12 left-7 z-30 md:left-10"
    >
      <div className="flex items-baseline gap-2 font-mono text-white">
        <span className="text-sm tracking-[0.2em]">{pad2(activeIndex + 1)}</span>
        <span className="text-[11px] text-haze">/ {pad2(WORKS.length)}</span>
      </div>
      <div className="mt-3 h-px w-28 bg-white/15">
        <div ref={barRef} className="h-full origin-left bg-white/80" style={{ transform: 'scaleX(0.02)' }} />
      </div>
    </motion.div>
  );
}

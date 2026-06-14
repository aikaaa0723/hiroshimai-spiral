'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useGallery } from '@/lib/store';
import { WORKS } from '@/data/works';

const ease = [0.16, 1, 0.3, 1] as const;

/**
 * Bottom-center readout of the hovered work. Fades in only on hover, so the
 * gallery stays quiet until the user reaches toward something. White, minimal.
 */
export function WorkOverlay() {
  const hoveredId = useGallery((s) => s.hoveredId);
  const work = WORKS.find((w) => w.id === hoveredId) ?? null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-14 z-20 flex justify-center">
      <AnimatePresence mode="wait">
        {work && (
          <motion.div
            key={work.id}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.5, ease }}
            className="text-center"
          >
            <div className="font-sans text-3xl font-medium tracking-[0.16em] text-white md:text-5xl">
              {work.title}
            </div>
            <div className="mt-3 font-jp text-sm tracking-[0.12em] text-haze md:text-base">
              {work.category}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

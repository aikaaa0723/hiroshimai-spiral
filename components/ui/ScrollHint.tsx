'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGallery } from '@/lib/store';

/** Bottom-right SCROLL hint with a drifting line. Fades once travel begins. */
export function ScrollHint() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const unsub = useGallery.subscribe((s) => setVisible(s.scroll < 0.02));
    return unsub;
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="fixed bottom-12 right-7 z-30 flex flex-col items-center gap-3 md:right-10"
        >
          <span className="font-mono text-[11px] uppercase tracking-[0.34em] text-white/80">Scroll</span>
          <div className="relative h-10 w-px overflow-hidden bg-white/15">
            <motion.div
              className="absolute left-0 top-0 h-3 w-px bg-white"
              animate={{ y: [-12, 40] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

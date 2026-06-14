'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useGallery } from '@/lib/store';

const ease = [0.16, 1, 0.3, 1] as const;
const MIN_MS = 2800; // give the heavy scene time to compile shaders & warm up
const HARD_MS = 9000; // absolute fallback — never hang on the veil
const AI_GRADIENT = 'linear-gradient(90deg,#3D5AAB 0%,#8C5A9C 50%,#D6336C 100%)';

/**
 * Intro veil. Holds over the canvas while WebGL compiles shaders, generates the
 * card textures, and the first frames render — so the visitor never sees the
 * blurry warm-up. Lifts once the first frame is ready AND a minimum time has
 * passed. Progress is in a ref so the rAF loop reads a live value.
 */
export function Loader() {
  const [display, setDisplay] = useState(0);
  const [done, setDone] = useState(false);
  const progress = useRef(0);

  useEffect(() => {
    let raf = 0;
    let finished = false;
    const start = performance.now();

    const finish = () => {
      if (finished) return;
      finished = true;
      progress.current = 100;
      setDisplay(100);
      cancelAnimationFrame(raf);
      setTimeout(() => setDone(true), 500);
    };

    const tick = (now: number) => {
      const elapsed = now - start;
      const ready = useGallery.getState().ready;
      const ceiling = ready ? 100 : 92;
      const timed = Math.min(ceiling, (elapsed / MIN_MS) * 100);
      progress.current += (timed - progress.current) * 0.1;
      setDisplay(progress.current);

      if ((ready && elapsed > MIN_MS && progress.current > 99) || elapsed > HARD_MS) {
        finish();
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    const hard = setTimeout(finish, HARD_MS);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(hard);
    };
  }, []);

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, filter: 'blur(10px)' }}
          transition={{ duration: 1, ease }}
          className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-ink"
        >
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease }}
            className="font-sans text-3xl font-semibold tracking-[0.1em] text-white"
          >
            Hiroshim
            <span style={{ backgroundImage: AI_GRADIENT, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>
              AI
            </span>
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 1, ease }}
            className="mt-4 font-jp text-sm tracking-[0.2em] text-white/60"
          >
            AIで広島から、未来を実装する。
          </motion.div>
          <div className="mt-8 h-px w-48 overflow-hidden bg-white/10">
            <div className="h-full" style={{ width: `${display}%`, backgroundImage: AI_GRADIENT }} />
          </div>
          <div className="mt-3 font-mono text-xs tracking-widest text-white/40">
            {Math.round(display).toString().padStart(3, '0')}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

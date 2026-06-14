'use client';

import { motion } from 'framer-motion';
import { scrollToProgress } from '@/lib/lenis';
import { scrollForCardIndex } from '@/lib/spiral';

const ease = [0.16, 1, 0.3, 1] as const;
const AI_GRADIENT = 'linear-gradient(90deg,#3D5AAB 0%,#8C5A9C 50%,#D6336C 100%)';

/** Top bar: HiroshimAI wordmark left, rounded "SERVICE — CONTACT" pill right. */
export function Navigation() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 1, ease }}
      className="fixed inset-x-0 top-0 z-30 flex items-center justify-between px-7 py-6 md:px-10"
    >
      <button
        onClick={() => scrollToProgress(0)}
        className="font-sans text-base font-semibold tracking-[0.14em] text-white transition-opacity hover:opacity-70"
      >
        Hiroshim
        <span style={{ backgroundImage: AI_GRADIENT, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>
          AI
        </span>
      </button>

      <nav className="flex items-center gap-4 rounded-full border border-white/25 bg-white/[0.03] px-6 py-2.5 backdrop-blur-sm">
        <button
          onClick={() => scrollToProgress(scrollForCardIndex(2))}
          className="font-mono text-[12px] uppercase tracking-[0.3em] text-white/85 transition-colors hover:text-white"
        >
          SERVICE
        </button>
        <span className="h-px w-8 bg-white/30 md:w-12" />
        <button
          onClick={() => scrollToProgress(scrollForCardIndex(13))}
          className="font-mono text-[12px] uppercase tracking-[0.3em] text-white/70 transition-colors hover:text-white"
        >
          CONTACT
        </button>
      </nav>
    </motion.header>
  );
}

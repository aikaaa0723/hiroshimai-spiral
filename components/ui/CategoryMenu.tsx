'use client';

import { motion } from 'framer-motion';
import { scrollToProgress } from '@/lib/lenis';
import { scrollForCardIndex } from '@/lib/spiral';

const ease = [0.16, 1, 0.3, 1] as const;

// Jump to the matching card index in the descent.
const ITEMS: { label: string; index: number }[] = [
  { label: 'AI顧問', index: 2 },
  { label: 'AI研修', index: 3 },
  { label: 'AIシステム開発', index: 4 },
  { label: 'IoT開発', index: 5 },
  { label: '理念・会社', index: 6 },
];

/**
 * Bottom-left navigation panel (reference style) — HiroshimAI's entry points.
 * Each flies the camera to that card; the pill jumps to the contact card.
 */
export function CategoryMenu() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.7, duration: 1, ease }}
      className="fixed bottom-10 left-7 z-30 md:left-10"
    >
      <p className="font-jp text-[12px] tracking-[0.18em] text-white/90">何をお探しですか？</p>

      <ul className="mt-5 space-y-2.5">
        {ITEMS.map((c) => (
          <li key={c.label}>
            <button
              onClick={() => scrollToProgress(scrollForCardIndex(c.index))}
              className="group flex items-center gap-2 font-jp text-[14px] tracking-[0.08em] text-white/55 transition-colors hover:text-white"
            >
              <span className="text-[#8b8fff] transition-transform duration-300 group-hover:translate-x-1">
                {'->'}
              </span>
              {c.label}
            </button>
          </li>
        ))}
      </ul>

      <button
        onClick={() => scrollToProgress(scrollForCardIndex(13))}
        className="mt-7 rounded-full border border-white/25 px-6 py-2.5 font-jp text-[12px] tracking-[0.14em] text-white/70 transition-colors hover:border-white/50 hover:text-white"
      >
        お問い合わせ →
      </button>
    </motion.div>
  );
}

'use client';

import { WORK_LAYOUT } from '@/lib/spiral';
import { WorkCard } from './WorkCard';

/** Instantiates every WorkCard, placed helically around the spine. */
export function WorkGallery() {
  return (
    <group>
      {WORK_LAYOUT.map((placement) => (
        <WorkCard key={placement.id} placement={placement} />
      ))}
    </group>
  );
}

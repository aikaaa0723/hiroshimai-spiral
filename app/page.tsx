'use client';

import dynamic from 'next/dynamic';
import { ScrollController } from '@/components/ScrollController';
import { Navigation } from '@/components/ui/Navigation';
import { WorkOverlay } from '@/components/ui/WorkOverlay';
import { CategoryMenu } from '@/components/ui/CategoryMenu';
import { ScrollHint } from '@/components/ui/ScrollHint';
import { Cursor } from '@/components/ui/Cursor';

// WebGL only on the client.
const Experience = dynamic(
  () => import('@/components/canvas/Experience').then((m) => m.Experience),
  { ssr: false },
);

export default function Home() {
  return (
    <ScrollController>
      {/* Fixed WebGL gallery */}
      <div className="canvas-fixed">
        <Experience />
      </div>

      {/* Tall invisible track gives Lenis its scroll distance (longer = slower descent) */}
      <div className="scroll-track" style={{ height: '1300vh' }} aria-hidden />

      {/* Minimal white UI */}
      <Navigation />
      <WorkOverlay />
      <CategoryMenu />
      <ScrollHint />
      <Cursor />
    </ScrollController>
  );
}

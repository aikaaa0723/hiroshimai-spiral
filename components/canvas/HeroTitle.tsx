'use client';

import { useRef } from 'react';
import { Html } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useGallery } from '@/lib/store';
import { smoothstep } from '@/lib/math';

/**
 * The big WORK title — placed in the 3D space (not a 2D overlay) so it has real
 * depth and parallax. drei's `center` prop anchors it on the 3D point correctly
 * under the transform scaling. Opacity is written straight to the DOM each frame
 * (no React re-renders); it fades as the camera moves into the gallery.
 */
export function HeroTitle() {
  const ref = useRef<HTMLDivElement>(null);

  useFrame(() => {
    if (!ref.current) return;
    const s = useGallery.getState().scroll;
    const o = 1 - smoothstep(0.0, 0.09, s);
    ref.current.style.opacity = String(o);
    ref.current.style.transform = `translateY(${(1 - o) * -28}px)`;
  });

  return (
    <Html position={[0, 0.15, -1]} transform center distanceFactor={2.6} style={{ pointerEvents: 'none' }}>
      <div ref={ref} style={{ textAlign: 'center', width: 'max-content' }}>
        <div
          style={{
            fontFamily: 'var(--font-inter), Helvetica, sans-serif',
            fontWeight: 600,
            fontSize: 118,
            letterSpacing: '-0.03em',
            lineHeight: 0.9,
            color: '#fff',
            textShadow: '0 0 60px rgba(120,150,255,0.25)',
          }}
        >
          WORK
        </div>
        <div
          style={{
            marginTop: 14,
            fontFamily: 'var(--font-mono), monospace',
            fontSize: 13,
            letterSpacing: '0.5em',
            textTransform: 'uppercase',
            color: 'rgba(200,210,230,0.7)',
            paddingLeft: '0.5em',
          }}
        >
          Selected Digital Experiences
        </div>
      </div>
    </Html>
  );
}

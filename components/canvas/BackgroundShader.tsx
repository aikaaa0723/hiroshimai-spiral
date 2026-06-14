'use client';

import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useGallery } from '@/lib/store';

/**
 * Fullscreen dark-atmosphere quad. The material writes clip-space directly, so
 * this [2,2] plane always fills the viewport behind everything (depthWrite/Test
 * off, renderOrder -1). Animated noise + faint cool glow + deep vignette.
 */
export function BackgroundShader() {
  const matRef = useRef<any>(null);
  const size = useThree((s) => s.size);

  useFrame((state) => {
    const m = matRef.current;
    if (!m) return;
    const { pointer } = useGallery.getState();
    m.uniforms.uTime.value = state.clock.elapsedTime;
    m.uniforms.uAspect.value = size.width / size.height;
    (m.uniforms.uPointer.value as THREE.Vector2).set(pointer.x, pointer.y);
  });

  return (
    <mesh frustumCulled={false} renderOrder={-1}>
      <planeGeometry args={[2, 2]} />
      <backgroundMaterial ref={matRef} depthTest={false} depthWrite={false} />
    </mesh>
  );
}

'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGallery } from '@/lib/store';
import { useQualitySettings } from '@/hooks/useQualitySettings';
import { DESCENT } from '@/lib/spiral';

/** Faint dust filling the vertical shaft. Count scales with the quality tier. */
export function Particles() {
  const matRef = useRef<any>(null);
  const { particleCount } = useQualitySettings();

  const geometry = useMemo(() => {
    const positions = new Float32Array(particleCount * 3);
    const seeds = new Float32Array(particleCount);
    const top = DESCENT.yTop + 3;
    const bottom = DESCENT.yTop - DESCENT.depth - 3;
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3 + 0] = (Math.random() - 0.5) * 28;
      positions[i * 3 + 1] = bottom + Math.random() * (top - bottom);
      positions[i * 3 + 2] = (Math.random() - 0.5) * 28;
      seeds[i] = Math.random();
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    g.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1));
    g.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, (top + bottom) / 2, 0), DESCENT.depth);
    return g;
  }, [particleCount]);

  useFrame((state) => {
    const m = matRef.current;
    if (!m) return;
    const { pointer } = useGallery.getState();
    m.uniforms.uTime.value = state.clock.elapsedTime;
    (m.uniforms.uPointer.value as THREE.Vector2).set(pointer.x, pointer.y);
  });

  return (
    <points geometry={geometry} frustumCulled={false}>
      <particlesMaterial ref={matRef} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  );
}

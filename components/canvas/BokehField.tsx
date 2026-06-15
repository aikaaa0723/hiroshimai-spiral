'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { DESCENT } from '@/lib/spiral';

const PALETTE = ['#ff5fb0', '#d6336c', '#4f7dff', '#8b5cf6', '#b06aff', '#3a78ff'].map(
  (c) => new THREE.Color(c),
);

/**
 * A sparse field of large, soft, defocused colour blobs spread (at a wider
 * radius) through the shaft — background bokeh that gives the space depth and
 * richness instead of a flat particle plane.
 */
export function BokehField({ count = 340 }: { count?: number }) {
  const matRef = useRef<any>(null);

  const geometry = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const scales = new Float32Array(count);
    const seeds = new Float32Array(count);
    const top = DESCENT.yTop + 4;
    const bottom = DESCENT.yTop - DESCENT.depth - 4;

    for (let i = 0; i < count; i++) {
      const ang = Math.random() * Math.PI * 2;
      const rad = 5 + Math.random() * 9; // wider than the cards → behind/around them
      positions[i * 3 + 0] = Math.cos(ang) * rad;
      positions[i * 3 + 1] = bottom + Math.random() * (top - bottom);
      positions[i * 3 + 2] = Math.sin(ang) * rad;
      const col = PALETTE[(Math.random() * PALETTE.length) | 0];
      colors[i * 3 + 0] = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;
      scales[i] = 0.35 + Math.random() * 0.85;
      seeds[i] = Math.random();
    }

    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    g.setAttribute('aColor', new THREE.BufferAttribute(colors, 3));
    g.setAttribute('aScale', new THREE.BufferAttribute(scales, 1));
    g.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1));
    g.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, (top + bottom) / 2, 0), DESCENT.depth);
    return g;
  }, [count]);

  useFrame((state) => {
    if (matRef.current) matRef.current.uniforms.uTime.value = state.clock.elapsedTime;
  });

  return (
    <points geometry={geometry} frustumCulled={false}>
      <bokehMaterial ref={matRef} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  );
}

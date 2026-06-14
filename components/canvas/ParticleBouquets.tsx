'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGallery } from '@/lib/store';
import { useQualitySettings } from '@/hooks/useQualitySettings';
import { DESCENT } from '@/lib/spiral';

// Vivid confetti palette (pink / magenta / blue / violet / cyan / white sparkle).
const PALETTE = ['#ff5fb0', '#d6336c', '#4f7dff', '#8b5cf6', '#34d3ee', '#eef2ff'].map(
  (c) => new THREE.Color(c),
);

// Bouquet cluster centres threaded helically down the shaft around the spine.
// [x, y, z, radius]
const CLUSTERS: [number, number, number, number][] = Array.from({ length: 14 }, (_, i) => {
  const tt = (i + 0.5) / 14;
  const y = DESCENT.yTop - tt * DESCENT.depth + (((i * 31) % 10) / 10 - 0.5) * 2.4;
  const ang = i * 2.39 + (i % 2) * 1.0;
  const rad = 3.2 + (i % 4) * 0.8;
  return [Math.cos(ang) * rad, y, Math.sin(ang) * rad, 1.3 + (i % 3) * 0.25];
});

/**
 * Clusters of colourful particles ("bouquets") floating in the space — the most
 * distinctive element of the reference frame. Each cluster is a soft Gaussian
 * blob of multi-colour confetti; the whole field drifts and leans with the pointer.
 */
export function ParticleBouquets() {
  const matRef = useRef<any>(null);
  const group = useRef<THREE.Group>(null);
  const { particleCount } = useQualitySettings();

  const geometry = useMemo(() => {
    const perCluster = Math.max(120, Math.round((particleCount * 0.5) / CLUSTERS.length));
    const total = perCluster * CLUSTERS.length;
    const positions = new Float32Array(total * 3);
    const colors = new Float32Array(total * 3);
    const scales = new Float32Array(total);
    const seeds = new Float32Array(total);

    // Cheap Gaussian via summed uniforms.
    const gauss = () => (Math.random() + Math.random() + Math.random() - 1.5) * 0.8;

    let i = 0;
    for (const [cx, cy, cz, cr] of CLUSTERS) {
      for (let p = 0; p < perCluster; p++) {
        positions[i * 3 + 0] = cx + gauss() * cr;
        positions[i * 3 + 1] = cy + gauss() * cr;
        positions[i * 3 + 2] = cz + gauss() * cr;
        const col = PALETTE[(Math.random() * PALETTE.length) | 0];
        colors[i * 3 + 0] = col.r;
        colors[i * 3 + 1] = col.g;
        colors[i * 3 + 2] = col.b;
        scales[i] = 0.4 + Math.random() * 1.3;
        seeds[i] = Math.random();
        i++;
      }
    }

    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    g.setAttribute('aColor', new THREE.BufferAttribute(colors, 3));
    g.setAttribute('aScale', new THREE.BufferAttribute(scales, 1));
    g.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1));
    g.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, DESCENT.yTop - DESCENT.depth / 2, 0), DESCENT.depth);
    return g;
  }, [particleCount]);

  useFrame((state, delta) => {
    if (matRef.current) matRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    if (group.current) {
      const { pointer } = useGallery.getState();
      // Very gentle parallax lean + slow drift.
      group.current.rotation.y = THREE.MathUtils.damp(
        group.current.rotation.y,
        pointer.x * 0.05,
        2,
        Math.min(delta, 1 / 30),
      );
      group.current.position.y = Math.sin(state.clock.elapsedTime * 0.15) * 0.2;
    }
  });

  return (
    <group ref={group}>
      <points geometry={geometry} frustumCulled>
        <bouquetMaterial ref={matRef} uSize={42} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
      </points>
    </group>
  );
}

'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGallery, type Quality } from '@/lib/store';
import { useIsMobile } from '@/hooks/useIsMobile';
import { DESCENT } from '@/lib/spiral';

const SHARDS = 300;
const TOP = DESCENT.yTop + 1;
const BOTTOM = DESCENT.yTop - DESCENT.depth - 1;

// Total points in the spire, by quality tier (halved on mobile).
const TOTAL_BY_TIER: Record<Quality, number> = { high: 13000, medium: 7500, low: 3000 };

/**
 * The central crystalline backbone — rebuilt as a POINT CLOUD (was solid
 * octahedra). The same shard layout (position / length / rotation) is kept, but
 * each crystal is now filled with points along a tapered spindle, so the column
 * reads as crystals dissolved into light points. The whole spire turns slowly.
 */
export function Crystals() {
  const ref = useRef<THREE.Points>(null);
  const matRef = useRef<any>(null);
  const quality = useGallery((s) => s.quality);
  const isMobile = useIsMobile();

  const total = useMemo(
    () => Math.round(TOTAL_BY_TIER[quality] * (isMobile ? 0.5 : 1)),
    [quality, isMobile],
  );

  const geometry = useMemo(() => {
    const rnd = (n: number) => {
      const x = Math.sin(n * 91.7) * 43758.5453;
      return x - Math.floor(x);
    };

    // Rebuild the same shard frames as the original solid crystals, but store an
    // orientation quaternion so we can scatter points inside each shard's spindle.
    const e = new THREE.Euler();
    const q = new THREE.Quaternion();
    const v = new THREE.Vector3();
    const shards = Array.from({ length: SHARDS }, (_, i) => {
      const ang = rnd(i) * Math.PI * 2;
      const big = rnd(i + 11) < 0.16;
      const rad = big ? 0.2 + rnd(i + 9) * 1.9 : 0.18 + rnd(i + 9) * 1.1;
      const y = TOP - (i / SHARDS) * (TOP - BOTTOM) + (rnd(i + 2) - 0.5) * 0.9;
      const len = big ? 1.2 + rnd(i + 5) * 1.6 : 0.3 + rnd(i + 5) * 0.9;
      const thick = big ? 0.1 + rnd(i + 6) * 0.16 : 0.04 + rnd(i + 6) * 0.1;
      e.set(rnd(i + 1) * Math.PI, rnd(i + 3) * Math.PI, rnd(i + 4) * Math.PI);
      q.setFromEuler(e);
      return {
        pos: new THREE.Vector3(Math.cos(ang) * rad, y, Math.sin(ang) * rad),
        q: q.clone(),
        len,
        thick,
      };
    });

    const positions = new Float32Array(total * 3);
    const seeds = new Float32Array(total);
    const hues = new Float32Array(total);

    for (let i = 0; i < total; i++) {
      const s = shards[i % SHARDS];
      // Sample along the shard's local Y axis; radius tapers to a point at each
      // tip (octahedron-like spindle) so clusters keep a crystal silhouette.
      const u = Math.random() * 2 - 1; // -1..1 along axis
      const sy = u * (s.len * 0.5);
      const taper = 1 - Math.abs(u);
      const rr = s.thick * taper * Math.sqrt(Math.random()) * 1.7;
      const ra = Math.random() * Math.PI * 2;
      v.set(Math.cos(ra) * rr, sy, Math.sin(ra) * rr).applyQuaternion(s.q).add(s.pos);
      positions[i * 3 + 0] = v.x;
      positions[i * 3 + 1] = v.y;
      positions[i * 3 + 2] = v.z;
      seeds[i] = Math.random();
      // Base hue from height + jitter; shader wraps with fract().
      hues[i] = s.pos.y * 0.04 + Math.random() * 0.3;
    }

    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    g.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1));
    g.setAttribute('aHue', new THREE.BufferAttribute(hues, 1));
    g.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, (TOP + BOTTOM) / 2, 0), DESCENT.depth);
    return g;
  }, [total]);

  useFrame((state, delta) => {
    if (matRef.current) matRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    if (ref.current) ref.current.rotation.y += Math.min(delta, 1 / 30) * 0.05;
  });

  return (
    <points ref={ref} geometry={geometry} frustumCulled={false}>
      <crystalPointsMaterial
        ref={matRef}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

'use client';

import { useLayoutEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { DESCENT } from '@/lib/spiral';

const COUNT = 300;
const TOP = DESCENT.yTop + 1;
const BOTTOM = DESCENT.yTop - DESCENT.depth - 1;

/**
 * Iridescent crystal shards distributed the full height of the central column —
 * the crystalline "backbone" the camera spirals around. Instanced octahedra with
 * the colour-shifting CrystalMaterial; the whole spire turns slowly.
 */
export function Crystals() {
  const ref = useRef<THREE.InstancedMesh>(null);
  const matRef = useRef<any>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const shards = useMemo(() => {
    const rnd = (n: number) => {
      const x = Math.sin(n * 91.7) * 43758.5453;
      return x - Math.floor(x);
    };
    return Array.from({ length: COUNT }, (_, i) => {
      const ang = rnd(i) * Math.PI * 2;
      // Denser core, with occasional larger feature crystals reaching out.
      const big = rnd(i + 11) < 0.16;
      const rad = (big ? 0.2 + rnd(i + 9) * 1.9 : 0.18 + rnd(i + 9) * 1.1);
      const y = TOP - (i / COUNT) * (TOP - BOTTOM) + (rnd(i + 2) - 0.5) * 0.9;
      return {
        pos: new THREE.Vector3(Math.cos(ang) * rad, y, Math.sin(ang) * rad),
        rot: new THREE.Euler(rnd(i + 1) * Math.PI, rnd(i + 3) * Math.PI, rnd(i + 4) * Math.PI),
        len: big ? 1.2 + rnd(i + 5) * 1.6 : 0.3 + rnd(i + 5) * 0.9,
        thick: big ? 0.1 + rnd(i + 6) * 0.16 : 0.04 + rnd(i + 6) * 0.1,
      };
    });
  }, []);

  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    shards.forEach((s, i) => {
      dummy.position.copy(s.pos);
      dummy.rotation.copy(s.rot);
      dummy.scale.set(s.thick, s.len, s.thick);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
  }, [shards, dummy]);

  useFrame((state, delta) => {
    if (matRef.current) matRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    if (ref.current) ref.current.rotation.y += Math.min(delta, 1 / 30) * 0.05;
  });

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, COUNT]} frustumCulled={false}>
      <octahedronGeometry args={[1, 0]} />
      <crystalMaterial ref={matRef} transparent depthWrite={false} side={THREE.DoubleSide} />
    </instancedMesh>
  );
}

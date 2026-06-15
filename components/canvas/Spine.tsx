'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { DESCENT } from '@/lib/spiral';

const TOP = DESCENT.yTop;
const BOTTOM = DESCENT.yTop - DESCENT.depth;
const MID = (TOP + BOTTOM) / 2;
const RIBBON_TURNS = DESCENT.depth / 5; // a wind every ~5 units
const RING_STEP = 6;

/** Build a point cloud along a helix (phase-offset), with slight radial jitter. */
function helixPoints(phase: number, n: number, radius: number, jitter: number) {
  const positions = new Float32Array(n * 3);
  const seeds = new Float32Array(n);
  const rnd = (k: number) => {
    const x = Math.sin((k + phase * 13.1) * 91.7) * 43758.5453;
    return x - Math.floor(x);
  };
  for (let i = 0; i < n; i++) {
    const f = i / (n - 1);
    const y = TOP - f * DESCENT.depth;
    const a = f * RIBBON_TURNS * Math.PI * 2 + phase;
    positions[i * 3 + 0] = Math.cos(a) * radius + (rnd(i) - 0.5) * jitter;
    positions[i * 3 + 1] = y + (rnd(i + 1) - 0.5) * jitter;
    positions[i * 3 + 2] = Math.sin(a) * radius + (rnd(i + 2) - 0.5) * jitter;
    seeds[i] = rnd(i + 3);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  g.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1));
  g.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, MID, 0), DESCENT.depth);
  return g;
}

/**
 * The central designed spine — entirely points. A point-stream energy core, two
 * double-helix ribbons rebuilt as strings of glowing points (were tube meshes),
 * and segment rings rebuilt as point rings (were torus meshes). The crystal
 * points (Crystals) cluster around this same axis.
 */
export function Spine() {
  const coreMat = useRef<any>(null);
  const ribbonAMat = useRef<any>(null);
  const ribbonBMat = useRef<any>(null);
  const ringsMat = useRef<any>(null);

  // Point-stream core (thin vertical column, denser on the axis).
  const coreGeo = useMemo(() => {
    const COUNT = 1600;
    const positions = new Float32Array(COUNT * 3);
    const seeds = new Float32Array(COUNT);
    const hues = new Float32Array(COUNT);
    for (let i = 0; i < COUNT; i++) {
      const y = TOP - Math.random() * DESCENT.depth;
      const r = 0.13 * Math.pow(Math.random(), 1.5);
      const a = Math.random() * Math.PI * 2;
      positions[i * 3 + 0] = Math.cos(a) * r;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = Math.sin(a) * r;
      seeds[i] = Math.random();
      hues[i] = y * 0.04 + Math.random() * 0.2;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    g.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1));
    g.setAttribute('aHue', new THREE.BufferAttribute(hues, 1));
    g.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, MID, 0), DESCENT.depth);
    return g;
  }, []);

  const ribbonA = useMemo(() => helixPoints(0, 1500, 0.5, 0.05), []);
  const ribbonB = useMemo(() => helixPoints(Math.PI, 1500, 0.5, 0.05), []);

  // Segment rings → point rings.
  const ringsGeo = useMemo(() => {
    const perRing = 64;
    const ys: number[] = [];
    for (let y = TOP - 2; y > BOTTOM; y -= RING_STEP) ys.push(y);
    const total = ys.length * perRing;
    const positions = new Float32Array(total * 3);
    const seeds = new Float32Array(total);
    let i = 0;
    for (const y of ys) {
      for (let k = 0; k < perRing; k++) {
        const a = (k / perRing) * Math.PI * 2;
        positions[i * 3 + 0] = Math.cos(a) * 0.42 + (Math.random() - 0.5) * 0.02;
        positions[i * 3 + 1] = y + (Math.random() - 0.5) * 0.02;
        positions[i * 3 + 2] = Math.sin(a) * 0.42 + (Math.random() - 0.5) * 0.02;
        seeds[i] = Math.random();
        i++;
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    g.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1));
    g.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, MID, 0), DESCENT.depth);
    return g;
  }, []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (coreMat.current) coreMat.current.uniforms.uTime.value = t;
    if (ribbonAMat.current) ribbonAMat.current.uniforms.uTime.value = t;
    if (ribbonBMat.current) ribbonBMat.current.uniforms.uTime.value = t;
    if (ringsMat.current) ringsMat.current.uniforms.uTime.value = t;
  });

  return (
    <group>
      {/* Point-stream energy core (was a solid faceted prism). */}
      <points geometry={coreGeo} frustumCulled={false}>
        <crystalPointsMaterial ref={coreMat} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
      </points>

      {/* Double-helix ribbons as point strings (were tube meshes). */}
      <points geometry={ribbonA} frustumCulled={false}>
        <glowPointsMaterial ref={ribbonAMat} uColor={new THREE.Color('#7fb0ff')} uSize={8} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
      </points>
      <points geometry={ribbonB} frustumCulled={false}>
        <glowPointsMaterial ref={ribbonBMat} uColor={new THREE.Color('#ff6ab0')} uSize={8} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
      </points>

      {/* Segment rings as point rings (were torus meshes). */}
      <points geometry={ringsGeo} frustumCulled={false}>
        <glowPointsMaterial ref={ringsMat} uColor={new THREE.Color('#cfe0ff')} uSize={6.5} uOpacity={0.7} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
      </points>
    </group>
  );
}

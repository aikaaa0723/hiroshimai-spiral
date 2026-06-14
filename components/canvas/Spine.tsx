'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { DESCENT } from '@/lib/spiral';

const TOP = DESCENT.yTop;
const BOTTOM = DESCENT.yTop - DESCENT.depth;
const MID = (TOP + BOTTOM) / 2;
const HEIGHT = DESCENT.depth + 4;
const PULSES = 10;
const RIBBON_TURNS = DESCENT.depth / 5; // a wind every ~5 units
const RING_STEP = 6;

/** A helix ribbon curve winding around the column, offset by `phase`. */
function ribbonCurve(phase: number) {
  const pts: THREE.Vector3[] = [];
  const N = 240;
  for (let i = 0; i <= N; i++) {
    const f = i / N;
    const y = TOP - f * DESCENT.depth;
    const a = f * RIBBON_TURNS * Math.PI * 2 + phase;
    pts.push(new THREE.Vector3(Math.cos(a) * 0.5, y, Math.sin(a) * 0.5));
  }
  return new THREE.CatmullRomCurve3(pts);
}

/**
 * The central designed spine — a gradient/energy-flow core (SpineMaterial), a
 * double-helix glowing ribbon winding down it, segment rings, and downward
 * pulses. The crystal shards (Crystals) cluster around this same axis.
 */
export function Spine() {
  const matRef = useRef<any>(null);
  const pulses = useRef<THREE.Group>(null);
  const ringsRef = useRef<THREE.Group>(null);

  const ribbonA = useMemo(() => new THREE.TubeGeometry(ribbonCurve(0), 240, 0.035, 8, false), []);
  const ribbonB = useMemo(() => new THREE.TubeGeometry(ribbonCurve(Math.PI), 240, 0.035, 8, false), []);
  const rings = useMemo(() => {
    const out: number[] = [];
    for (let y = TOP - 2; y > BOTTOM; y -= RING_STEP) out.push(y);
    return out;
  }, []);
  const pulseData = useMemo(
    () => Array.from({ length: PULSES }, (_, i) => ({ offset: i / PULSES, speed: 0.05 })),
    [],
  );

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (matRef.current) matRef.current.uniforms.uTime.value = t;

    const g = pulses.current;
    if (g) {
      g.children.forEach((child, i) => {
        const phase = (pulseData[i].offset + t * pulseData[i].speed) % 1;
        child.position.y = TOP - phase * DESCENT.depth;
        const m = (child as THREE.Mesh).material as THREE.MeshBasicMaterial;
        m.opacity = Math.sin(phase * Math.PI) * 0.85;
      });
    }

    // Rings light up in sequence as a "signal" travels down (bio heartbeat).
    const rg = ringsRef.current;
    if (rg) {
      rg.children.forEach((child) => {
        const f = (TOP - child.position.y) / DESCENT.depth;
        const wave = Math.pow(Math.max(0, Math.sin((f - t * 0.12) * Math.PI * 2)), 6);
        const m = (child as THREE.Mesh).material as THREE.MeshBasicMaterial;
        m.opacity = 0.35 + wave * 0.65;
        const s = 1 + wave * 0.25;
        child.scale.set(s, s, s);
      });
    }
  });

  return (
    <group>
      {/* Designed core — a faceted prism (catches light per face). */}
      <mesh position={[0, MID, 0]}>
        <cylinderGeometry args={[0.16, 0.16, HEIGHT, 7, 96, true]} />
        <spineMaterial ref={matRef} transparent depthWrite={false} side={THREE.DoubleSide} />
      </mesh>

      {/* Soft slim glow */}
      <mesh position={[0, MID, 0]}>
        <cylinderGeometry args={[0.22, 0.22, HEIGHT, 12, 1, true]} />
        <meshBasicMaterial color="#6a4fd0" toneMapped={false} transparent opacity={0.1} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>

      {/* Double-helix ribbon */}
      <mesh geometry={ribbonA}>
        <meshBasicMaterial color="#7fb0ff" toneMapped={false} transparent opacity={0.9} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <mesh geometry={ribbonB}>
        <meshBasicMaterial color="#ff6ab0" toneMapped={false} transparent opacity={0.9} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>

      {/* Segment rings (pulse in sequence as a signal travels down) */}
      <group ref={ringsRef}>
        {rings.map((y) => (
          <mesh key={y} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.42, 0.014, 8, 48]} />
            <meshBasicMaterial color="#cfe0ff" toneMapped={false} transparent opacity={0.55} />
          </mesh>
        ))}
      </group>

      {/* Downward pulses */}
      <group ref={pulses}>
        {pulseData.map((_, i) => (
          <mesh key={i} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.16, 0.025, 8, 24]} />
            <meshBasicMaterial color="#9b7bff" toneMapped={false} transparent opacity={0.6} blending={THREE.AdditiveBlending} depthWrite={false} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

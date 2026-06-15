'use client';

import { useMemo, useRef } from 'react';
import { useFrame, type ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import { useGallery } from '@/lib/store';
import { useIsMobile } from '@/hooks/useIsMobile';
import { sampleThumbnailPoints } from '@/lib/thumbnail';
import { clamp, smoothstep } from '@/lib/math';
import { cardTransform, type WorkPlacement } from '@/lib/spiral';

const BASE_W = 3.2;
const BASE_H = 1.8; // 16:9

// Points per card by quality tier (halved on mobile). The image is formed by
// this many particles — bright areas dense, dark areas sparse.
const POINTS_BY_TIER = { high: 6500, medium: 4000, low: 2000 } as const;

export function WorkCard({ placement }: { placement: WorkPlacement }) {
  const group = useRef<THREE.Group>(null);
  const matRef = useRef<any>(null);

  const hovered = useGallery((s) => s.hoveredId === placement.id);
  const setHovered = useGallery((s) => s.setHovered);
  const quality = useGallery((s) => s.quality);
  const isMobile = useIsMobile();

  // Point cloud sampled from the thumbnail (density = luminance).
  const geometry = useMemo(() => {
    const requested = Math.round(POINTS_BY_TIER[quality] * (isMobile ? 0.45 : 1));
    const { positions, colors, seeds, count } = sampleThumbnailPoints(
      placement.seed,
      placement.hue,
      placement.title,
      placement.category,
      requested,
    );
    // Bake the card size into the normalized (u,v) coords.
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3 + 0] = positions[i * 3 + 0] * BASE_W;
      pos[i * 3 + 1] = positions[i * 3 + 1] * BASE_H;
      pos[i * 3 + 2] = positions[i * 3 + 2];
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('aColor', new THREE.BufferAttribute(colors.subarray(0, count * 3), 3));
    g.setAttribute('aSeed', new THREE.BufferAttribute(seeds.subarray(0, count), 1));
    g.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 0, 0), Math.hypot(BASE_W, BASE_H) * 0.5);
    return g;
  }, [placement.seed, placement.hue, placement.title, placement.category, quality, isMobile]);

  const base = useMemo(() => {
    const { pos, rotY } = cardTransform(placement.t, placement.angleOffset, placement.radius, placement.yOffset);
    const outward = new THREE.Vector3(pos[0], 0, pos[2]).normalize();
    return { pos: new THREE.Vector3(...pos), rotY, outward };
  }, [placement]);

  const params = useMemo(() => {
    const r = (n: number) => {
      const x = Math.sin(placement.seed * 12.9898 + n * 78.233) * 43758.5453;
      return x - Math.floor(x);
    };
    return { phase: r(1) * Math.PI * 2, speed: 0.3 + r(2) * 0.4, amp: 0.05 + r(3) * 0.06 };
  }, [placement.seed]);

  const hoverAmt = useRef(0);
  const tmp = useMemo(() => new THREE.Vector3(), []);

  const onOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setHovered(placement.id);
    document.body.style.cursor = 'pointer';
  };
  const onOut = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setHovered(null);
    document.body.style.cursor = 'none';
  };

  useFrame((state, rawDt) => {
    const dt = Math.min(rawDt, 1 / 30);
    const t = state.clock.elapsedTime;
    const { pointer } = useGallery.getState();

    hoverAmt.current = THREE.MathUtils.damp(hoverAmt.current, hovered ? 1 : 0, 6, dt);

    if (group.current) {
      const floatY = Math.sin(t * params.speed + params.phase) * (params.amp * 0.5);
      tmp.copy(base.pos).addScaledVector(base.outward, hoverAmt.current * 0.9);
      tmp.y += floatY;
      group.current.position.copy(tmp);
      group.current.rotation.set(pointer.y * 0.03, base.rotY - pointer.x * 0.04, 0);
      group.current.scale.setScalar(placement.scale * 1.15 * (1 + hoverAmt.current * 0.08));
    }

    if (matRef.current) {
      matRef.current.uniforms.uTime.value = t;
      const dist = state.camera.position.distanceTo(group.current!.position);
      const fade = smoothstep(40, 7, dist);
      matRef.current.uniforms.uOpacity.value = clamp(Math.max(fade, hoverAmt.current * 0.9));
      // Points grow a touch on hover so the image firms up when focused.
      matRef.current.uniforms.uSize.value = 5.5 * (1 + hoverAmt.current * 0.5);
    }
  });

  return (
    <group ref={group}>
      {/* The image — a cloud of points. */}
      <points geometry={geometry} frustumCulled={false}>
        <cardPointsMaterial ref={matRef} transparent depthWrite={false} blending={THREE.NormalBlending} />
      </points>

      {/* Invisible proxy purely for hover raycasting (no visible surface). */}
      <mesh onPointerOver={onOver} onPointerOut={onOut}>
        <planeGeometry args={[BASE_W, BASE_H]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} colorWrite={false} />
      </mesh>
    </group>
  );
}

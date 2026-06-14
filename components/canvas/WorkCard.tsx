'use client';

import { useMemo, useRef } from 'react';
import { useFrame, type ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import { useGallery } from '@/lib/store';
import { makeThumbnail } from '@/lib/thumbnail';
import { clamp, smoothstep } from '@/lib/math';
import { cardTransform, type WorkPlacement } from '@/lib/spiral';

const BASE_W = 3.2;
const BASE_H = 1.8; // 16:9

export function WorkCard({ placement }: { placement: WorkPlacement }) {
  const group = useRef<THREE.Group>(null);
  const matRef = useRef<any>(null);

  const hovered = useGallery((s) => s.hoveredId === placement.id);
  const setHovered = useGallery((s) => s.setHovered);

  const texture = useMemo(
    () => makeThumbnail(placement.seed, placement.hue, placement.title, placement.category),
    [placement.seed, placement.hue, placement.title, placement.category],
  );

  // Fixed transform on the helix + the radial "outward" (toward the camera).
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
      // Gentle vertical float only — cards stay level and evenly placed.
      const floatY = Math.sin(t * params.speed + params.phase) * (params.amp * 0.5);
      tmp.copy(base.pos).addScaledVector(base.outward, hoverAmt.current * 0.9);
      tmp.y += floatY;
      group.current.position.copy(tmp);

      // Level: face outward (yaw) only, with a whisper of pointer parallax. No roll.
      group.current.rotation.set(pointer.y * 0.03, base.rotY - pointer.x * 0.04, 0);

      group.current.scale.setScalar(placement.scale * 1.15 * (1 + hoverAmt.current * 0.08));
    }

    if (matRef.current) {
      matRef.current.uniforms.uTime.value = t;
      matRef.current.uniforms.uHover.value = hoverAmt.current;
      // Fade with distance — near cards full, distant ones recede down the column.
      const dist = state.camera.position.distanceTo(group.current!.position);
      const fade = smoothstep(40, 7, dist);
      matRef.current.uniforms.uOpacity.value = clamp(Math.max(fade, hoverAmt.current));
    }
  });

  return (
    <group ref={group}>
      <mesh onPointerOver={onOver} onPointerOut={onOut}>
        <planeGeometry args={[BASE_W, BASE_H]} />
        <cardMaterial ref={matRef} uTex={texture} uSeed={placement.seed} transparent depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

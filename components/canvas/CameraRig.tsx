'use client';

import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useGallery } from '@/lib/store';
import { clamp, dampV3 } from '@/lib/math';
import { camPos, lookPos, nearestWork, warpToCard } from '@/lib/spiral';

/**
 * Spiral-descent camera. Scroll progress (0..1) winds the camera down around the
 * central spine (drifting toward the lower-right on screen). The look target is
 * the spine, a little below — a gentle downward gaze. Pointer adds parallax +
 * tilt. Everything is damped, so the descent has weight and never teleports.
 */
export function CameraRig() {
  const camera = useThree((s) => s.camera);
  const setActiveIndex = useGallery((s) => s.setActiveIndex);

  const curT = useRef(0);
  const pos = useRef(camPos(0));
  const look = useRef(lookPos(0));
  const targetPos = useRef(new THREE.Vector3());
  const targetLook = useRef(new THREE.Vector3());
  const parallax = useRef(new THREE.Vector3());
  const tilt = useRef(new THREE.Vector2());

  useFrame((state, rawDt) => {
    const dt = Math.min(rawDt, 1 / 30);
    const { scroll, pointer } = useGallery.getState();
    const t = state.clock.elapsedTime;

    // Dwell in front of each card (warp), then damp for weight.
    curT.current = THREE.MathUtils.damp(curT.current, warpToCard(clamp(scroll, 0, 1)), 3, dt);
    const p = curT.current;

    camPos(p, targetPos.current);
    lookPos(p, targetLook.current);

    // Idle breathing so a paused descent still feels alive.
    targetPos.current.y += Math.sin(t * 0.3) * 0.1;

    // Pointer parallax (tangential lean).
    parallax.current.x = THREE.MathUtils.damp(parallax.current.x, pointer.x * 0.7, 3, dt);
    parallax.current.y = THREE.MathUtils.damp(parallax.current.y, pointer.y * 0.5, 3, dt);
    targetPos.current.x += parallax.current.x;
    targetPos.current.y += parallax.current.y;

    dampV3(pos.current, targetPos.current, 3.2, dt);
    dampV3(look.current, targetLook.current, 4.2, dt);

    camera.position.copy(pos.current);
    camera.lookAt(look.current);

    // Micro pointer tilt after lookAt.
    tilt.current.x = THREE.MathUtils.damp(tilt.current.x, -pointer.y * 0.04, 3, dt);
    tilt.current.y = THREE.MathUtils.damp(tilt.current.y, pointer.x * 0.04, 3, dt);
    camera.rotation.x += tilt.current.x;
    camera.rotation.y += tilt.current.y;

    setActiveIndex(nearestWork(p));
  });

  return null;
}

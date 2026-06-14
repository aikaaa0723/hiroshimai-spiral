import * as THREE from 'three';
import { WORKS, type Work } from '@/data/works';

/**
 * Spiral-descent geometry. A central "spine" column stands on the Y axis; scroll
 * descends the camera around it (winding down — and, on screen, drifting toward
 * the lower-right). Work cards are placed helically around the spine so they
 * swing into view as the camera passes their depth.
 */
export const DESCENT = {
  yTop: 4,
  depth: 40, // total vertical drop (smaller = windows closer together + slower descent)
  turns: 1.8, // revolutions across the descent (fewer = windows closer angularly)
  camR: 11, // camera orbit radius (larger = camera further back, less "too close")
  lookDown: 0.8, // gentle downward gaze
};

// Orbit direction. With the camera facing the spine, the on-screen horizontal
// motion as you scroll is -R*DIR*turns*2π — so DIR = -1 drifts to the RIGHT
// (and y always descends), giving the requested down-to-the-right spiral.
const DIR = -1;

export const yAt = (t: number) => DESCENT.yTop - t * DESCENT.depth;
export const angAt = (t: number) => DIR * t * DESCENT.turns * Math.PI * 2;

/** Camera position on the descending orbit. */
export const camPos = (t: number, target = new THREE.Vector3()) => {
  const a = angAt(t);
  return target.set(Math.cos(a) * DESCENT.camR, yAt(t), Math.sin(a) * DESCENT.camR);
};

/** Camera look target: the spine, a touch below the current height. */
export const lookPos = (t: number, target = new THREE.Vector3()) =>
  target.set(0, yAt(t) - DESCENT.lookDown, 0);

/** Card radius — between the spine and the camera orbit (closer = larger cards). */
export const CARD_R = 5.2;

/** Transform for a card at parameter t (faces outward, toward the camera). */
export function cardTransform(t: number, angleOffset = 0, radius = CARD_R, yOffset = 0) {
  const a = angAt(t) + angleOffset;
  const pos: [number, number, number] = [Math.cos(a) * radius, yAt(t) + yOffset, Math.sin(a) * radius];
  const rotY = Math.PI / 2 - a; // +Z normal points outward along the radius
  return { pos, rotY };
}

export interface WorkPlacement extends Work {
  t: number;
  angleOffset: number;
  radius: number;
  yOffset: number;
  tilt: number;
}

// Place the works on a perfectly uniform helix: even spacing in both height and
// angle, constant radius, level (no tilt / no offset). Each card sits dead-centre
// on the camera's forward axis when reached.
export const WORK_LAYOUT: WorkPlacement[] = WORKS.map((w, i) => {
  const n = WORKS.length;
  const t = 0.05 + (i / (n - 1)) * 0.9;
  return { ...w, t, angleOffset: 0, radius: CARD_R, yOffset: 0, tilt: 0 };
});

/**
 * Remap linear scroll so the camera dwells (slows) in front of each card and
 * moves faster between them. Each inter-card segment uses smootherstep, whose
 * derivative is zero at both ends — so the descent eases to a near-stop at every
 * card, then accelerates to the next.
 */
export function warpToCard(scroll: number): number {
  const N = WORK_LAYOUT.length;
  const u = Math.min(1, Math.max(0, scroll)) * (N - 1);
  const k = Math.min(N - 2, Math.floor(u));
  const f = u - k;
  const smoother = f * f * f * (f * (f * 6 - 15) + 10); // 0 derivative at both ends
  // Blend with linear so the camera SLOWS at each card but never fully stops —
  // scrolling always produces motion (avoids a "stuck / can't scroll" feel).
  const e = f * 0.4 + smoother * 0.6;
  return THREE.MathUtils.lerp(WORK_LAYOUT[k].t, WORK_LAYOUT[k + 1].t, e);
}

/** Scroll progress (0..1) that lands on card `i` (scroll is linear; warp maps it). */
export const scrollForCardIndex = (i: number) =>
  WORK_LAYOUT.length > 1 ? i / (WORK_LAYOUT.length - 1) : 0;

export const nearestWork = (t: number) => {
  let idx = 0;
  let best = Infinity;
  for (let i = 0; i < WORK_LAYOUT.length; i++) {
    const d = Math.abs(WORK_LAYOUT[i].t - t);
    if (d < best) {
      best = d;
      idx = i;
    }
  }
  return idx;
};

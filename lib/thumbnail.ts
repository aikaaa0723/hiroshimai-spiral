import * as THREE from 'three';
import { mulberry32 } from './math';

/**
 * High-resolution procedural card texture. Built to read as a rich "video still":
 * layered glows, soft photographic shapes, dense generative structure, fine grain,
 * a chromatic edge fringe and a key-light gradient — plus the work's stacked EN
 * title, a glitched echo word, and a JP caption. Deterministic per seed.
 */
function makeThumbnailCanvas(seed: number, hue = 0.6, title = '', category = ''): HTMLCanvasElement {
  const W = 1024;
  const H = 576; // 16:9
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;
  const rnd = mulberry32(seed * 2654435761);
  const S = W / 512; // scale factor vs the old 512-wide design

  // Base.
  ctx.fillStyle = '#060709';
  ctx.fillRect(0, 0, W, H);

  // Brand-range hues (blue → violet → magenta → purple).
  const hues = [222, 270, 320, 296];
  const baseHue = hues[seed % hues.length];

  // Layered soft glows for depth.
  const glows = 3;
  for (let i = 0; i < glows; i++) {
    const gx = W * (0.25 + rnd() * 0.6);
    const gy = H * (0.2 + rnd() * 0.6);
    const gr = W * (0.25 + rnd() * 0.4);
    const gh = baseHue + (rnd() - 0.5) * 40;
    const g = ctx.createRadialGradient(gx, gy, 0, gx, gy, gr);
    g.addColorStop(0, `hsla(${gh}, 72%, 56%, ${0.22 + rnd() * 0.2})`);
    g.addColorStop(1, 'hsla(0,0%,0%,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
  }

  // Soft "photographic" blobs (organic depth).
  ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 5; i++) {
    const bx = rnd() * W;
    const by = rnd() * H;
    const br = W * (0.06 + rnd() * 0.14);
    const bh = baseHue + (rnd() - 0.5) * 50;
    const g = ctx.createRadialGradient(bx, by, 0, bx, by, br);
    g.addColorStop(0, `hsla(${bh}, 80%, 62%, ${0.06 + rnd() * 0.08})`);
    g.addColorStop(1, 'hsla(0,0%,0%,0)');
    ctx.fillStyle = g;
    ctx.fillRect(bx - br, by - br, br * 2, br * 2);
  }

  // Generative structure (denser at high res).
  const motif = seed % 3;
  if (motif === 0) {
    for (let i = 0; i < 16; i++) {
      ctx.strokeStyle = `rgba(255,255,255,${0.03 + rnd() * 0.09})`;
      ctx.lineWidth = (rnd() < 0.2 ? 1.6 : 0.7) * S;
      const x = W * 0.38 + rnd() * W * 0.62;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + (rnd() - 0.5) * 90, H);
      ctx.stroke();
    }
  } else if (motif === 1) {
    const cx = W * (0.55 + rnd() * 0.4);
    const cy = H * (0.6 + rnd() * 0.4);
    for (let r = 18 * S; r < W; r += 16 * S) {
      ctx.strokeStyle = `rgba(200,210,255,${0.025 + rnd() * 0.045})`;
      ctx.lineWidth = 0.8 * S;
      ctx.beginPath();
      ctx.arc(cx, cy, r + rnd() * 8 * S, Math.PI, Math.PI * 2);
      ctx.stroke();
    }
  } else {
    const pts: [number, number][] = [];
    for (let i = 0; i < 16; i++) pts.push([W * 0.38 + rnd() * W * 0.62, rnd() * H]);
    ctx.strokeStyle = 'rgba(170,190,255,0.05)';
    ctx.lineWidth = 0.7 * S;
    for (let i = 0; i < pts.length; i++)
      for (let j = i + 1; j < pts.length; j++)
        if (rnd() < 0.18) {
          ctx.beginPath();
          ctx.moveTo(pts[i][0], pts[i][1]);
          ctx.lineTo(pts[j][0], pts[j][1]);
          ctx.stroke();
        }
    for (const [x, y] of pts) {
      ctx.fillStyle = `rgba(255,255,255,${0.25 + rnd() * 0.5})`;
      ctx.beginPath();
      ctx.arc(x, y, (1 + rnd() * 1.8) * S, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.globalCompositeOperation = 'source-over';

  // Glitched echo of the title (RGB-split + sliced).
  if (title) {
    const word = title.split(' ').sort((a, b) => b.length - a.length)[0];
    ctx.save();
    ctx.font = `700 ${Math.min(150 * S, (W * 0.9) / Math.max(4, word.length))}px Helvetica, Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const wx = W * 0.6;
    const wy = H * 0.5;
    ctx.globalAlpha = 0.12;
    ctx.fillStyle = '#ff2d6b';
    ctx.fillText(word, wx - 6 * S, wy);
    ctx.fillStyle = '#2de0ff';
    ctx.fillText(word, wx + 6 * S, wy);
    ctx.fillStyle = '#cdd6ff';
    ctx.fillText(word, wx, wy);
    ctx.globalAlpha = 0.08;
    for (let i = 0; i < 6; i++) {
      ctx.fillStyle = i % 2 ? '#ff2d6b' : '#2de0ff';
      ctx.fillRect(0, rnd() * H, W, (2 + rnd() * 9) * S);
    }
    ctx.restore();
  }

  // Key-light gradient (top-left) for a photographic feel.
  const key = ctx.createLinearGradient(0, 0, W * 0.7, H);
  key.addColorStop(0, 'rgba(255,255,255,0.06)');
  key.addColorStop(0.5, 'rgba(255,255,255,0)');
  ctx.fillStyle = key;
  ctx.fillRect(0, 0, W, H);

  // Left readability gradient.
  const lg = ctx.createLinearGradient(0, 0, W * 0.62, 0);
  lg.addColorStop(0, 'rgba(4,5,8,0.82)');
  lg.addColorStop(1, 'rgba(4,5,8,0)');
  ctx.fillStyle = lg;
  ctx.fillRect(0, 0, W, H);

  // Title stacked large on the left.
  if (title) {
    const words = title.split(' ');
    const size = (words.length > 2 ? 38 : 46) * S;
    ctx.font = `700 ${size}px Helvetica, Arial, sans-serif`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = '#f1f4fb';
    const lineH = size * 1.02;
    const startY = H * 0.5 - ((words.length - 1) * lineH) / 2 + size * 0.35;
    words.forEach((w, i) => ctx.fillText(w, 28 * S, startY + i * lineH));
  }

  // Category label.
  if (category) {
    ctx.font = `600 ${15 * S}px "Helvetica Neue", Helvetica, Arial, sans-serif`;
    ctx.fillStyle = 'rgba(170,196,255,0.85)';
    ctx.fillText(category, 28 * S, H - 26 * S);
  }

  // Fine multi-octave grain.
  const img = ctx.getImageData(0, 0, W, H);
  const d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    const g = (rnd() - 0.5) * 14;
    d[i] += g;
    d[i + 1] += g;
    d[i + 2] += g;
  }
  ctx.putImageData(img, 0, 0);

  // Subtle scanlines.
  ctx.fillStyle = 'rgba(0,0,0,0.12)';
  for (let y = 0; y < H; y += 3 * S) ctx.fillRect(0, y, W, 1 * S);

  // Vignette.
  const vg = ctx.createRadialGradient(W / 2, H / 2, H * 0.32, W / 2, H / 2, W * 0.74);
  vg.addColorStop(0, 'rgba(0,0,0,0)');
  vg.addColorStop(1, 'rgba(0,0,0,0.52)');
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, W, H);

  return canvas;
}

/** Texture variant (kept for any mesh use). */
export function makeThumbnail(seed: number, hue = 0.6, title = '', category = ''): THREE.Texture {
  const canvas = makeThumbnailCanvas(seed, hue, title, category);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 16; // crisp at the steep card angles
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.generateMipmaps = true;
  tex.needsUpdate = true;
  return tex;
}

const srgbToLinear = (c: number) =>
  c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);

/**
 * Sample the thumbnail into a POINT CLOUD whose density follows image luminance:
 * bright structure becomes dense clusters of points, dark areas stay sparse — so
 * the picture is "formed by particle density", not painted on a surface. Returns
 * normalized plane coords (u,v ∈ [-0.5,0.5]) + a small depth jitter, and linear
 * per-point colours. `count` is the achieved point count (≤ requested).
 */
export function sampleThumbnailPoints(
  seed: number,
  hue: number,
  title: string,
  category: string,
  requested: number,
): { positions: Float32Array; colors: Float32Array; seeds: Float32Array; count: number } {
  const canvas = makeThumbnailCanvas(seed, hue, title, category);
  const W = canvas.width;
  const H = canvas.height;
  const data = canvas.getContext('2d')!.getImageData(0, 0, W, H).data;
  const rnd = mulberry32(seed * 40503 + 7);

  const positions = new Float32Array(requested * 3);
  const colors = new Float32Array(requested * 3);
  const seeds = new Float32Array(requested);

  let i = 0;
  let guard = 0;
  const maxTries = requested * 48;
  while (i < requested && guard < maxTries) {
    guard++;
    const px = (rnd() * W) | 0;
    const py = (rnd() * H) | 0;
    const idx = (py * W + px) * 4;
    const r = data[idx] / 255;
    const g = data[idx + 1] / 255;
    const b = data[idx + 2] / 255;
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;
    // Accept ~ proportional to luminance → density forms the image.
    if (rnd() > lum * 1.15 + 0.015) continue;
    positions[i * 3 + 0] = px / W - 0.5;
    positions[i * 3 + 1] = 0.5 - py / H;
    positions[i * 3 + 2] = (rnd() - 0.5) * 0.06; // depth → volume up close
    colors[i * 3 + 0] = srgbToLinear(r);
    colors[i * 3 + 1] = srgbToLinear(g);
    colors[i * 3 + 2] = srgbToLinear(b);
    seeds[i] = rnd();
    i++;
  }
  return { positions, colors, seeds, count: i };
}

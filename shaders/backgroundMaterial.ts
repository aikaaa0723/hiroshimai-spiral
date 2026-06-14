import * as THREE from 'three';
import { shaderMaterial } from '@react-three/drei';
import { simplex3d } from './noise';

/**
 * Fullscreen background. The vertex shader writes clip-space directly (geometry
 * is a [2,2] plane), so it always covers the viewport regardless of camera —
 * a true screen-space quad. Dark digital atmosphere: animated fbm noise, a faint
 * cool central glow, deep vignette. Rendered first, depth-test off.
 */
export const BackgroundMaterial = shaderMaterial(
  {
    uTime: 0,
    uPointer: new THREE.Vector2(0, 0),
    uAspect: 1,
    uGlow: new THREE.Color('#2a3a66'),
  },
  /* glsl vertex */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = vec4(position.xy, 0.0, 1.0);
    }
  `,
  /* glsl fragment */ `
    varying vec2 vUv;
    uniform float uTime;
    uniform vec2 uPointer;
    uniform float uAspect;
    uniform vec3 uGlow;

    ${simplex3d}

    float fbm(vec3 p){
      float v = 0.0, a = 0.5;
      for(int i=0;i<4;i++){ v += a*snoise(p); p*=2.0; a*=0.5; }
      return v;
    }

    void main() {
      vec2 uv = vUv;
      vec2 p = (uv - 0.5);
      p.x *= uAspect;

      // Center of glow drifts gently toward the pointer.
      vec2 center = uPointer * 0.12;
      float d = length(p - center);

      // Base near-black.
      vec3 col = vec3(0.012, 0.014, 0.018);

      // Faint cool radial glow into the distance.
      float glow = exp(-d * 2.3);
      col += uGlow * glow * 0.5;

      // BIO: organic membrane-like noise (domain-warped fbm), faint.
      float warp = fbm(vec3(p * 2.0, uTime * 0.04));
      float organic = fbm(vec3(p * 3.0 + warp, uTime * 0.05));
      col += uGlow * (organic * 0.5 + 0.5) * 0.05;

      // TECH: a faint perspective grid that fades into the distance.
      vec2 gp = p * (3.0 + glow * 6.0);
      vec2 grid = abs(fract(gp) - 0.5);
      float line = smoothstep(0.48, 0.5, max(grid.x, grid.y));
      col += vec3(0.32, 0.42, 0.7) * line * glow * 0.18;

      // Deep vignette.
      col *= smoothstep(1.15, 0.2, d);

      gl_FragColor = vec4(col, 1.0);
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
    }
  `,
);

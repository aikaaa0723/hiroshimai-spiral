import * as THREE from 'three';
import { shaderMaterial } from '@react-three/drei';
import { simplex3d, fbm3d } from './noise';

/**
 * Fine atmospheric dust forming a living nebula. Points ride a divergence-free
 * CURL flow (swirling, fluid — plasma / ink in water) and their brightness +
 * size are driven by a multi-octave FBM density field, so the volume is not a
 * uniform haze but clumps, filaments and voids that drift and morph over time —
 * large structure with finer structure inside. Tiny, additive, soft.
 */
export const ParticlesMaterial = shaderMaterial(
  {
    uTime: 0,
    uPointer: new THREE.Vector2(0, 0),
    uSize: 6.5,
  },
  simplex3d +
    fbm3d +
    /* glsl vertex */ `
    attribute float aSeed;
    uniform float uTime;
    uniform float uSize;
    uniform vec2 uPointer;
    varying float vAlpha;
    varying float vTint;

    void main() {
      vTint = aSeed;
      vec3 pos = position;

      // Fluid curl flow — swirling, divergence-free → plasma/ink motion.
      float t = uTime * 0.05;
      vec3 fl = curl(pos * 0.06 + vec3(0.0, 0.0, t));
      pos += fl * 1.7;
      pos.x += uPointer.x * 0.6;
      pos.y += uPointer.y * 0.4;

      // Multi-scale density: nebula clumps / filaments / voids, slowly drifting.
      float den = fbm(pos * 0.09 + vec3(0.0, -t * 0.6, 0.0));
      float dens = smoothstep(-0.15, 0.55, den);

      vec4 mv = modelViewMatrix * vec4(pos, 1.0);
      float dist = -mv.z;
      vAlpha = smoothstep(0.5, 6.0, dist) * smoothstep(60.0, 10.0, dist);
      vAlpha *= mix(0.04, 1.0, dens); // density forms the shape
      gl_PointSize = uSize * (1.0 / dist) * 12.0 * (0.4 + aSeed * 0.8) * (0.7 + dens * 0.7);
      gl_Position = projectionMatrix * mv;
    }
  `,
  /* glsl fragment */ `
    varying float vAlpha;
    varying float vTint;
    void main() {
      float d = length(gl_PointCoord - 0.5);
      float a = smoothstep(0.5, 0.42, d);
      vec3 col = mix(vec3(0.8, 0.86, 1.0), vec3(1.0), fract(vTint));
      gl_FragColor = vec4(col, a * vAlpha * 0.6);
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
    }
  `,
);

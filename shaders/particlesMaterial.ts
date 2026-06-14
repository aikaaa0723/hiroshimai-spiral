import * as THREE from 'three';
import { shaderMaterial } from '@react-three/drei';

/**
 * Dust particles. Tiny, white-to-pale-blue, distributed through the gallery's
 * depth. They drift slowly and lean with the pointer; far particles fade out so
 * the field reads as atmospheric density, never as stars. Additive, soft.
 */
export const ParticlesMaterial = shaderMaterial(
  {
    uTime: 0,
    uPointer: new THREE.Vector2(0, 0),
    uSize: 9.0,
  },
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

      // Slow drift + pointer lean.
      float t = uTime * 0.04 + aSeed * 6.2831;
      pos.x += sin(t) * 0.5 + uPointer.x * 0.6;
      pos.y += cos(t * 0.8) * 0.4 + uPointer.y * 0.4;

      vec4 mv = modelViewMatrix * vec4(pos, 1.0);
      float dist = -mv.z;
      // Fade by depth — close + very-far particles dim.
      vAlpha = smoothstep(0.5, 6.0, dist) * smoothstep(60.0, 12.0, dist);
      gl_PointSize = uSize * (1.0 / dist) * 24.0;
      gl_Position = projectionMatrix * mv;
    }
  `,
  /* glsl fragment */ `
    varying float vAlpha;
    varying float vTint;
    void main() {
      float d = length(gl_PointCoord - 0.5);
      // Crisp dot with a defined edge (sharp outline) instead of a soft blob.
      float a = smoothstep(0.5, 0.42, d);
      vec3 col = mix(vec3(0.8, 0.86, 1.0), vec3(1.0), fract(vTint));
      gl_FragColor = vec4(col, a * vAlpha * 0.7);
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
    }
  `,
);

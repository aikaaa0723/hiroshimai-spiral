import * as THREE from 'three';
import { shaderMaterial } from '@react-three/drei';

/**
 * Generic single-colour additive point material — used to rebuild thin "line"
 * elements (the spine's helix ribbons, segment rings) as strings of glowing
 * points instead of tube/torus surfaces. Crisp round dots, depth-faded.
 */
export const GlowPointsMaterial = shaderMaterial(
  {
    uTime: 0,
    uSize: 9.0,
    uColor: new THREE.Color('#9bbcff'),
    uOpacity: 1.0,
  },
  /* glsl vertex */ `
    attribute float aSeed;
    uniform float uTime;
    uniform float uSize;
    varying float vAlpha;
    void main() {
      vec3 pos = position;
      float t = uTime * 0.6 + aSeed * 6.2831;
      pos += 0.012 * vec3(sin(t), cos(t * 1.2), sin(t * 0.8));
      vec4 mv = modelViewMatrix * vec4(pos, 1.0);
      float dist = -mv.z;
      vAlpha = smoothstep(0.3, 3.0, dist) * smoothstep(52.0, 7.0, dist);
      gl_PointSize = uSize * (1.0 / dist) * 14.0 * (0.45 + aSeed * 0.8);
      gl_Position = projectionMatrix * mv;
    }
  `,
  /* glsl fragment */ `
    uniform vec3 uColor;
    uniform float uOpacity;
    varying float vAlpha;
    void main() {
      float d = length(gl_PointCoord - 0.5);
      float a = smoothstep(0.5, 0.32, d);
      gl_FragColor = vec4(uColor, a * vAlpha * uOpacity);
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
    }
  `,
);

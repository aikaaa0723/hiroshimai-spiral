import * as THREE from 'three';
import { shaderMaterial } from '@react-three/drei';
import { simplex3d } from './noise';

/**
 * WorkCard surface shader.
 *  - samples the procedural thumbnail texture
 *  - on hover: warps UVs with simplex noise, lifts brightness, draws a thin
 *    white frame, intensifies the edge glow
 *  - always: faint edge glow + interior vignette + depth darkening (far cards
 *    sink into the dark), and a global uOpacity for scroll fades
 */
export const CardMaterial = shaderMaterial(
  {
    // Real Texture default so the JSX prop type accepts the procedural CanvasTexture.
    uTex: new THREE.Texture(),
    uHover: 0,
    uTime: 0,
    uSeed: 0,
    uOpacity: 1,
    uColor: new THREE.Color('#aac4ff'),
  },
  /* glsl vertex */ `
    varying vec2 vUv;
    varying float vViewZ;
    void main() {
      vUv = uv;
      vec4 mv = modelViewMatrix * vec4(position, 1.0);
      vViewZ = -mv.z; // positive distance in front of camera
      gl_Position = projectionMatrix * mv;
    }
  `,
  /* glsl fragment */ `
    varying vec2 vUv;
    varying float vViewZ;
    uniform sampler2D uTex;
    uniform float uHover;
    uniform float uTime;
    uniform float uSeed;
    uniform float uOpacity;
    uniform vec3 uColor;

    ${simplex3d}

    void main() {
      vec2 uv = vUv;

      // Hover UV warp — subtle liquid wobble.
      float n = snoise(vec3(uv * 3.0, uTime * 0.3 + uSeed));
      uv += (n * 0.012) * uHover * vec2(1.0, 0.6);

      // Slight zoom-in on hover.
      uv = (uv - 0.5) * (1.0 - 0.05 * uHover) + 0.5;

      vec3 col = texture2D(uTex, uv).rgb;

      // Hover lifts brightness + a touch of cool tint.
      col *= mix(1.0, 1.28, uHover);
      col += uColor * 0.06 * uHover;

      // Interior vignette.
      vec2 q = abs(uv - 0.5);
      float vig = smoothstep(0.62, 0.2, max(q.x, q.y));
      col *= mix(0.72, 1.0, vig);

      // Moving glass sheen — a soft diagonal highlight sweeping across.
      float sweep = fract((vUv.x + vUv.y) * 0.5 - uTime * 0.05);
      float sheen = smoothstep(0.06, 0.0, abs(sweep - 0.5));
      col += vec3(1.0) * sheen * (0.05 + 0.12 * uHover);

      // Rounded-rectangle card silhouette (aspect-corrected SDF).
      float aspect = 16.0 / 9.0;
      vec2 pp = (vUv - 0.5) * vec2(aspect, 1.0);
      vec2 he = vec2(0.5 * aspect, 0.5);
      float radius = 0.07;
      vec2 dd = abs(pp) - (he - radius);
      float sdf = length(max(dd, 0.0)) + min(max(dd.x, dd.y), 0.0) - radius;
      float mask = 1.0 - smoothstep(0.0, 0.006, sdf);

      // Defined edge rim along the rounded border (brighter on hover).
      float rim = 1.0 - smoothstep(0.0, 0.018, abs(sdf));
      col += uColor * rim * (0.18 + 0.6 * uHover);

      // Depth darkening — far cards fall into the void.
      float depth = smoothstep(40.0, 4.0, vViewZ);
      col *= mix(0.25, 1.0, depth);

      gl_FragColor = vec4(col, uOpacity * mask);

      #include <tonemapping_fragment>
      #include <colorspace_fragment>
    }
  `,
);

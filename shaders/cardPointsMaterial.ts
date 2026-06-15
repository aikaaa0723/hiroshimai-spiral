import { shaderMaterial } from '@react-three/drei';

/**
 * Work "card" rendered as a POINT CLOUD sampled from the procedural thumbnail.
 * Each point carries the image colour at its source pixel (linear), and the
 * point DENSITY follows the image luminance (sampled in lib/thumbnail), so the
 * picture is formed by the accumulation of particles — bright structure = dense,
 * dark = sparse. A small per-point depth jitter gives volume up close.
 */
export const CardPointsMaterial = shaderMaterial(
  {
    uTime: 0,
    uOpacity: 1.0,
    uSize: 7.5,
  },
  /* glsl vertex */ `
    attribute vec3 aColor;
    attribute float aSeed;
    uniform float uTime;
    uniform float uSize;
    varying vec3 vColor;
    varying float vAlpha;
    void main() {
      vColor = aColor;
      vec3 pos = position;
      // micro shimmer so the image "breathes" as a particle field
      float t = uTime * 0.5 + aSeed * 6.2831;
      pos += 0.004 * vec3(sin(t), cos(t * 1.3), 0.0);
      vec4 mv = modelViewMatrix * vec4(pos, 1.0);
      float dist = -mv.z;
      vAlpha = smoothstep(46.0, 5.0, dist);
      gl_PointSize = uSize * (1.0 / dist) * 13.0 * (0.6 + aSeed * 0.6);
      gl_Position = projectionMatrix * mv;
    }
  `,
  /* glsl fragment */ `
    uniform float uOpacity;
    varying vec3 vColor;
    varying float vAlpha;
    void main() {
      float d = length(gl_PointCoord - 0.5);
      float a = smoothstep(0.5, 0.34, d);
      gl_FragColor = vec4(vColor, a * vAlpha * uOpacity);
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
    }
  `,
);

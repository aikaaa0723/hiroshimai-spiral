import { shaderMaterial } from '@react-three/drei';

/**
 * Large, very soft, out-of-focus colour blobs for background depth — the
 * defocused bokeh that makes the space feel volumetric rather than flat.
 * Per-vertex colour, gaussian falloff, low opacity, additive.
 */
export const BokehMaterial = shaderMaterial(
  {
    uTime: 0,
    uSize: 28,
  },
  /* glsl vertex */ `
    attribute vec3 aColor;
    attribute float aScale;
    attribute float aSeed;
    uniform float uTime;
    uniform float uSize;
    varying vec3 vColor;
    varying float vAlpha;

    void main() {
      vColor = aColor;
      vec3 pos = position;
      float t = uTime * 0.03 + aSeed * 6.2831;
      pos.x += sin(t) * 0.8;
      pos.y += cos(t * 0.7) * 0.6;

      vec4 mv = modelViewMatrix * vec4(pos, 1.0);
      float dist = -mv.z;
      // Fade close blobs (so they don't smear the lens) and very far ones.
      vAlpha = smoothstep(3.0, 9.0, dist) * smoothstep(70.0, 18.0, dist);
      gl_PointSize = clamp(uSize * aScale * (1.0 / dist) * 16.0, 2.0, 110.0);
      gl_Position = projectionMatrix * mv;
    }
  `,
  /* glsl fragment */ `
    varying vec3 vColor;
    varying float vAlpha;
    void main() {
      float d = length(gl_PointCoord - 0.5);
      float a = smoothstep(0.5, 0.0, d); // very soft gaussian-ish
      a *= a;
      gl_FragColor = vec4(vColor, a * vAlpha * 0.16);
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
    }
  `,
);

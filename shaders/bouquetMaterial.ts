import { shaderMaterial } from '@react-three/drei';

/**
 * Colorful "bouquet" confetti points — clusters of pink/blue/purple/cyan dots
 * that read as the vivid particle bursts in the reference. Per-vertex colour,
 * soft round sprites, additive, with a gentle twinkle and depth fade.
 */
export const BouquetMaterial = shaderMaterial(
  {
    uTime: 0,
    uSize: 26,
  },
  /* glsl vertex */ `
    attribute vec3 aColor;
    attribute float aScale;
    attribute float aSeed;
    uniform float uTime;
    uniform float uSize;
    varying vec3 vColor;
    varying float vTwinkle;

    void main() {
      vColor = aColor;
      vTwinkle = 0.5 + 0.5 * sin(uTime * 1.6 + aSeed * 12.0);
      vec4 mv = modelViewMatrix * vec4(position, 1.0);
      float dist = -mv.z;
      gl_PointSize = uSize * aScale * (0.6 + vTwinkle * 0.5) * (1.0 / dist) * 14.0;
      gl_Position = projectionMatrix * mv;
    }
  `,
  /* glsl fragment */ `
    varying vec3 vColor;
    varying float vTwinkle;
    void main() {
      float d = length(gl_PointCoord - 0.5);
      if (d > 0.5) discard;
      // Cell-like sprite: soft interior + a crisp "membrane" outline ring.
      float fill = smoothstep(0.44, 0.28, d) * 0.4;
      float ring = max(smoothstep(0.5, 0.46, d) - smoothstep(0.44, 0.40, d), 0.0);
      float core = smoothstep(0.14, 0.0, d) * 0.5;
      float alpha = (fill + ring * 1.3 + core) * (0.7 + vTwinkle * 0.4);
      gl_FragColor = vec4(vColor * 1.35, alpha);
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
    }
  `,
);

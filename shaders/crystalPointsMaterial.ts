import { shaderMaterial } from '@react-three/drei';
import { simplex3d, fbm3d } from './noise';

/**
 * Point-cloud crystal material for the central totem — built from POINTS, not
 * surfaces. Each point carries an iridescent hue (purple → magenta → cyan),
 * sways on a slow simplex field (breathing tissue), and its brightness is driven
 * by a multi-octave FBM field so the spire has internal fine structure — dense
 * veins and sparser regions, not a uniform tube. Fine, crisp, additive dots.
 */
export const CrystalPointsMaterial = shaderMaterial(
  {
    uTime: 0,
    uSize: 8.0,
  },
  simplex3d +
    fbm3d +
    /* glsl vertex */ `
    attribute float aSeed;
    attribute float aHue;
    uniform float uTime;
    uniform float uSize;
    varying float vAlpha;
    varying float vHue;
    varying float vDens;

    void main() {
      vHue = aHue;
      vec3 pos = position;

      // Slow organic sway (keeps silhouette, adds life).
      float t = uTime * 0.08;
      vec3 q = pos * 0.13;
      vec3 sway = vec3(
        snoise(q + vec3(0.0, 0.0, t)),
        snoise(q + vec3(5.2, 2.1, t)),
        snoise(q + vec3(9.4, 4.3, t))
      );
      pos += sway * 0.14;

      // Internal multi-scale density (veins of brightness through the spire).
      float den = fbm(pos * 0.22 + vec3(0.0, 0.0, uTime * 0.05));
      vDens = smoothstep(-0.3, 0.5, den);

      vec4 mv = modelViewMatrix * vec4(pos, 1.0);
      float dist = -mv.z;
      vAlpha = smoothstep(0.3, 3.0, dist) * smoothstep(48.0, 7.0, dist);
      vAlpha *= (0.4 + vDens * 0.8);
      gl_PointSize = uSize * (1.0 / dist) * 13.0 * (0.5 + aSeed * 0.8) * (0.7 + vDens * 0.6);
      gl_Position = projectionMatrix * mv;
    }
  `,
  /* glsl fragment */ `
    varying float vAlpha;
    varying float vHue;
    varying float vDens;
    uniform float uTime;

    void main() {
      float d = length(gl_PointCoord - 0.5);
      float a = smoothstep(0.5, 0.32, d);

      float h = fract(vHue + uTime * 0.03);
      vec3 purple = vec3(0.45, 0.20, 0.75);
      vec3 magenta = vec3(0.85, 0.20, 0.55);
      vec3 cyan = vec3(0.20, 0.75, 0.85);
      vec3 col = mix(purple, magenta, smoothstep(0.0, 0.5, h));
      col = mix(col, cyan, smoothstep(0.5, 1.0, h));
      col += 0.22 + vDens * 0.18; // dense veins read brighter

      gl_FragColor = vec4(col, a * vAlpha);
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
    }
  `,
);

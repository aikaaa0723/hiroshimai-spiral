import { shaderMaterial } from '@react-three/drei';

/**
 * Iridescent crystal material for the central totem. A fresnel-driven hue shift
 * (deep purple → magenta → cyan) with bright edges, semi-transparent. Reads as
 * the glassy, colour-shifting shard column in the reference.
 */
export const CrystalMaterial = shaderMaterial(
  {
    uTime: 0,
  },
  /* glsl vertex */ `
    varying vec3 vNormalW;
    varying vec3 vViewDir;
    varying float vY;
    void main() {
      vec4 worldPos = modelMatrix * instanceMatrix * vec4(position, 1.0);
      mat3 nm = mat3(modelMatrix * instanceMatrix);
      vNormalW = normalize(nm * normal);
      vViewDir = normalize(cameraPosition - worldPos.xyz);
      vY = worldPos.y;
      gl_Position = projectionMatrix * viewMatrix * worldPos;
    }
  `,
  /* glsl fragment */ `
    varying vec3 vNormalW;
    varying vec3 vViewDir;
    varying float vY;
    uniform float uTime;

    void main() {
      float fres = pow(1.0 - clamp(dot(vNormalW, vViewDir), 0.0, 1.0), 2.0);

      // Iridescent ramp: purple -> magenta -> cyan, shifted by fresnel + height + time.
      float h = fract(fres * 1.1 + vY * 0.04 + uTime * 0.03);
      vec3 purple = vec3(0.45, 0.20, 0.75);
      vec3 magenta = vec3(0.85, 0.20, 0.55);
      vec3 cyan = vec3(0.20, 0.75, 0.85);
      vec3 col = mix(purple, magenta, smoothstep(0.0, 0.5, h));
      col = mix(col, cyan, smoothstep(0.5, 1.0, h));

      col += vec3(1.0) * pow(fres, 2.5) * 0.6; // bright edges
      float alpha = 0.18 + fres * 0.7;

      gl_FragColor = vec4(col, alpha);
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
    }
  `,
);

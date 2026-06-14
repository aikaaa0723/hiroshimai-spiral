import * as THREE from 'three';
import { shaderMaterial } from '@react-three/drei';

/**
 * The spine column surface: a vertical brand gradient (blue → violet → magenta)
 * with bright bands of energy flowing downward, fine "circuit" ticks, and a
 * fresnel edge. Reads as a designed, living backbone rather than a plain rod.
 */
export const SpineMaterial = shaderMaterial(
  {
    uTime: 0,
    uColorA: new THREE.Color('#3b6ddb'), // blue
    uColorB: new THREE.Color('#8b5cd6'), // violet
    uColorC: new THREE.Color('#d6336c'), // magenta
  },
  /* glsl vertex */ `
    varying vec2 vUv;
    varying vec3 vNormalW;
    varying vec3 vViewDir;
    void main() {
      vUv = uv;
      vec4 worldPos = modelMatrix * vec4(position, 1.0);
      vNormalW = normalize(mat3(modelMatrix) * normal);
      vViewDir = normalize(cameraPosition - worldPos.xyz);
      gl_Position = projectionMatrix * viewMatrix * worldPos;
    }
  `,
  /* glsl fragment */ `
    varying vec2 vUv;
    varying vec3 vNormalW;
    varying vec3 vViewDir;
    uniform float uTime;
    uniform vec3 uColorA;
    uniform vec3 uColorB;
    uniform vec3 uColorC;

    void main() {
      // Vertical gradient along the column height.
      vec3 grad = mix(uColorA, uColorB, smoothstep(0.0, 0.5, vUv.y));
      grad = mix(grad, uColorC, smoothstep(0.5, 1.0, vUv.y));

      // Energy bands flowing downward.
      float flow = sin(vUv.y * 60.0 + uTime * 2.2);
      float band = smoothstep(0.6, 1.0, flow);

      // TECH: fine circuit ticks + vertical data-stream lines that scroll.
      float ticks = step(0.92, fract(vUv.y * 120.0)) * step(0.5, fract(vUv.x * 8.0));
      float streams = step(0.93, fract(vUv.x * 10.0)) *
                      (0.4 + 0.6 * sin(vUv.y * 40.0 - uTime * 7.0));

      // BIO: bright "pulses" travelling down the spine like a heartbeat signal.
      float pw = fract(vUv.y * 3.0 + uTime * 0.5);
      float pulse = smoothstep(0.0, 0.04, pw) * smoothstep(0.14, 0.04, pw);

      // Fresnel edge glow.
      float fres = pow(1.0 - clamp(dot(vNormalW, vViewDir), 0.0, 1.0), 1.5);

      vec3 col = grad * (0.5 + fres * 0.8);
      col += grad * band * 0.9;
      col += vec3(1.0) * ticks * 0.5;
      col += vec3(0.7, 0.9, 1.0) * streams * 0.6;        // data streams
      col += mix(uColorC, vec3(1.0), 0.5) * pulse * 1.1; // heartbeat pulse
      col += vec3(0.8, 0.9, 1.0) * fres * 0.4;

      float alpha = clamp(0.32 + band * 0.45 + fres * 0.6 + ticks + streams * 0.5 + pulse, 0.0, 1.0);
      gl_FragColor = vec4(col, alpha);
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
    }
  `,
);

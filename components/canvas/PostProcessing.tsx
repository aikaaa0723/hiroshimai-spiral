'use client';

import { type ReactElement } from 'react';
import { useThree } from '@react-three/fiber';
import {
  EffectComposer,
  Bloom,
  DepthOfField,
  Vignette,
  Noise,
  ChromaticAberration,
  SMAA,
} from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import * as THREE from 'three';
import { useQualitySettings } from '@/hooks/useQualitySettings';

/**
 * Cinematic post stack — Depth of Field is the protagonist (per the brief): a
 * shallow focus a few metres ahead so near and far cards melt into bokeh. Bloom
 * is gentle, Chromatic Aberration barely there, plus a vignette and fine grain.
 */
export function PostProcessing() {
  const { enableDof, enableChromatic, bloomIntensity } = useQualitySettings();
  const size = useThree((s) => s.size);

  const effects = [
    enableDof ? (
      // Focus on the cards (~6 units ahead). Gentle bokeh so the content stays
      // sharp — only the far background softens. (focusDistance is normalized
      // over the camera depth range; ~0.06 ≈ the card distance.)
      <DepthOfField key="dof" focusDistance={0.06} focalLength={0.02} bokehScale={1.5} height={Math.min(size.height, 1080)} />
    ) : null,
    <Bloom key="bloom" intensity={bloomIntensity} luminanceThreshold={0.72} luminanceSmoothing={0.3} mipmapBlur radius={0.5} />,
    enableChromatic ? (
      <ChromaticAberration
        key="chroma"
        blendFunction={BlendFunction.NORMAL}
        offset={new THREE.Vector2(0.0005, 0.0005)}
        radialModulation
        modulationOffset={0.35}
      />
    ) : null,
    <Vignette key="vignette" eskil={false} offset={0.2} darkness={0.95} />,
    <Noise key="noise" premultiply blendFunction={BlendFunction.OVERLAY} opacity={0.045} />,
    <SMAA key="smaa" />,
  ].filter(Boolean) as ReactElement[];

  return (
    <EffectComposer multisampling={0} enableNormalPass={false}>
      {effects}
    </EffectComposer>
  );
}

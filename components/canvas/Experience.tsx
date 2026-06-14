'use client';

import { Suspense, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { AdaptiveEvents, PerformanceMonitor, Preload } from '@react-three/drei';
import * as THREE from 'three';

// Side-effect: registers custom shader materials with R3F.
import '@/shaders/materials';

import { useGallery, type Quality } from '@/lib/store';
import { useQualitySettings } from '@/hooks/useQualitySettings';
import { CameraRig } from './CameraRig';
import { BackgroundShader } from './BackgroundShader';
import { Particles } from './Particles';
import { ParticleBouquets } from './ParticleBouquets';
import { BokehField } from './BokehField';
import { Crystals } from './Crystals';
import { Spine } from './Spine';
import { WorkGallery } from './WorkGallery';
import { PostProcessing } from './PostProcessing';

export function Experience() {
  const setQuality = useGallery((s) => s.setQuality);
  const setReady = useGallery((s) => s.setReady);
  const { dpr } = useQualitySettings();

  const onIncline = useCallback(() => {
    const q = useGallery.getState().quality;
    setQuality((q === 'low' ? 'medium' : 'high') as Quality);
  }, [setQuality]);
  const onDecline = useCallback(() => {
    const q = useGallery.getState().quality;
    setQuality((q === 'high' ? 'medium' : 'low') as Quality);
  }, [setQuality]);

  return (
    <Canvas
      dpr={dpr}
      gl={{
        antialias: false,
        alpha: false,
        powerPreference: 'high-performance',
        stencil: false,
      }}
      camera={{ fov: 38, near: 0.1, far: 90, position: [0, 0, 6] }}
      onCreated={({ gl, scene }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.0;
        scene.fog = new THREE.FogExp2(new THREE.Color('#030304'), 0.034);
        requestAnimationFrame(() => setReady(true));
      }}
    >
      <PerformanceMonitor onIncline={onIncline} onDecline={onDecline} flipflops={3} onFallback={() => setQuality('low')}>
        <Suspense fallback={null}>
          <CameraRig />
          <BackgroundShader />
          <BokehField />
          <Particles />
          <ParticleBouquets />
          <Spine />
          <Crystals />
          <WorkGallery />
          <Preload all />
        </Suspense>
        <PostProcessing />
      </PerformanceMonitor>

      <AdaptiveEvents />
    </Canvas>
  );
}

'use client';

import { useMemo } from 'react';
import { useGallery, type Quality } from '@/lib/store';
import { useIsMobile } from './useIsMobile';

export interface QualitySettings {
  dpr: [number, number];
  particleCount: number;
  enableDof: boolean;
  enableChromatic: boolean;
  bloomIntensity: number;
}

const TIERS: Record<Quality, Omit<QualitySettings, 'dpr'>> = {
  high: { particleCount: 11000, enableDof: true, enableChromatic: true, bloomIntensity: 0.62 },
  medium: { particleCount: 6500, enableDof: true, enableChromatic: true, bloomIntensity: 0.5 },
  low: { particleCount: 2500, enableDof: false, enableChromatic: false, bloomIntensity: 0.35 },
};

export function useQualitySettings(): QualitySettings {
  const quality = useGallery((s) => s.quality);
  const isMobile = useIsMobile();
  return useMemo(() => {
    const base = TIERS[quality];
    const dpr: [number, number] = isMobile ? [1, 1.5] : [1, 2];
    const scale = isMobile ? 0.5 : 1;
    return {
      ...base,
      dpr,
      particleCount: Math.round(base.particleCount * scale),
      enableDof: base.enableDof && !isMobile,
    };
  }, [quality, isMobile]);
}

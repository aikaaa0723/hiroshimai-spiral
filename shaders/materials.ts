import { extend, type ThreeElement } from '@react-three/fiber';

import { CardPointsMaterial } from './cardPointsMaterial';
import { BackgroundMaterial } from './backgroundMaterial';
import { ParticlesMaterial } from './particlesMaterial';
import { BouquetMaterial } from './bouquetMaterial';
import { CrystalPointsMaterial } from './crystalPointsMaterial';
import { GlowPointsMaterial } from './glowPointsMaterial';
import { BokehMaterial } from './bokehMaterial';

extend({ CardPointsMaterial, BackgroundMaterial, ParticlesMaterial, BouquetMaterial, CrystalPointsMaterial, GlowPointsMaterial, BokehMaterial });

export { CardPointsMaterial, BackgroundMaterial, ParticlesMaterial, BouquetMaterial, CrystalPointsMaterial, GlowPointsMaterial, BokehMaterial };

declare module '@react-three/fiber' {
  interface ThreeElements {
    cardPointsMaterial: ThreeElement<typeof CardPointsMaterial>;
    backgroundMaterial: ThreeElement<typeof BackgroundMaterial>;
    particlesMaterial: ThreeElement<typeof ParticlesMaterial>;
    bouquetMaterial: ThreeElement<typeof BouquetMaterial>;
    crystalPointsMaterial: ThreeElement<typeof CrystalPointsMaterial>;
    glowPointsMaterial: ThreeElement<typeof GlowPointsMaterial>;
    bokehMaterial: ThreeElement<typeof BokehMaterial>;
  }
}

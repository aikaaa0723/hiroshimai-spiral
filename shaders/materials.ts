import { extend, type ThreeElement } from '@react-three/fiber';

import { CardMaterial } from './cardMaterial';
import { BackgroundMaterial } from './backgroundMaterial';
import { ParticlesMaterial } from './particlesMaterial';
import { BouquetMaterial } from './bouquetMaterial';
import { CrystalMaterial } from './crystalMaterial';
import { SpineMaterial } from './spineMaterial';
import { BokehMaterial } from './bokehMaterial';

extend({ CardMaterial, BackgroundMaterial, ParticlesMaterial, BouquetMaterial, CrystalMaterial, SpineMaterial, BokehMaterial });

export { CardMaterial, BackgroundMaterial, ParticlesMaterial, BouquetMaterial, CrystalMaterial, SpineMaterial, BokehMaterial };

declare module '@react-three/fiber' {
  interface ThreeElements {
    cardMaterial: ThreeElement<typeof CardMaterial>;
    backgroundMaterial: ThreeElement<typeof BackgroundMaterial>;
    particlesMaterial: ThreeElement<typeof ParticlesMaterial>;
    bouquetMaterial: ThreeElement<typeof BouquetMaterial>;
    crystalMaterial: ThreeElement<typeof CrystalMaterial>;
    spineMaterial: ThreeElement<typeof SpineMaterial>;
    bokehMaterial: ThreeElement<typeof BokehMaterial>;
  }
}

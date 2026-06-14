/**
 * The spiral cards, now carrying HiroshimAI's story (top → bottom of the
 * descent). Content is drawn only from the confirmed layer (Part A / Part D) of
 * 企画書 v0.1 — no pricing / metrics / legal name (C-6/C-7/C-1 要確認). Each card
 * bakes its EN title (stacked) + a JP caption into a procedural thumbnail.
 *
 * `position` / `rotation` are kept for the type but are ignored — the spiral
 * (lib/spiral.ts) computes each card's transform from its order. `scale` is used.
 */

export interface Work {
  id: string;
  title: string;
  category: string;
  /** Ignored (the spiral computes placement); kept for the type. */
  position: [number, number, number];
  rotation: [number, number, number];
  /** Scale multiplier on the base 16:9 plane. */
  scale: number;
  /** Seed for the procedural thumbnail. */
  seed: number;
  /** Legacy hue field (unused by the current thumbnail). */
  hue: number;
}

const z: [number, number, number] = [0, 0, 0];

export const WORKS: Work[] = [
  { id: 'hero', title: 'HiroshimAI', category: 'AIで広島から、未来を実装する。', position: z, rotation: z, scale: 1.1, seed: 11, hue: 0.6 },
  { id: 'implement', title: 'IMPLEMENT', category: '「導入」で終わらせない', position: z, rotation: z, scale: 1.05, seed: 23, hue: 0.6 },
  { id: 'advisor', title: 'AI ADVISOR', category: 'AI顧問 — 経営に伴走する', position: z, rotation: z, scale: 1.0, seed: 37, hue: 0.58 },
  { id: 'training', title: 'AI TRAINING', category: 'AI研修 — 業務に組み込む', position: z, rotation: z, scale: 1.0, seed: 41, hue: 0.62 },
  { id: 'development', title: 'DEVELOPMENT', category: 'AIシステム開発 — 業務に根付く', position: z, rotation: z, scale: 1.0, seed: 59, hue: 0.6 },
  { id: 'iot', title: 'IoT', category: 'IoT開発 — 現場をデータで可視化', position: z, rotation: z, scale: 0.95, seed: 67, hue: 0.64 },
  { id: 'purpose', title: 'PURPOSE', category: '創造的な仕事に没頭できる社会を', position: z, rotation: z, scale: 1.0, seed: 73, hue: 0.57 },
  { id: 'mission', title: 'MISSION', category: '広島から、中小企業の戦い方を変える', position: z, rotation: z, scale: 1.0, seed: 83, hue: 0.6 },
  { id: 'vision', title: 'VISION', category: '広島から、世界へ', position: z, rotation: z, scale: 1.0, seed: 97, hue: 0.63 },
  { id: 'values', title: 'VALUES', category: '素直・感謝・自責', position: z, rotation: z, scale: 0.95, seed: 101, hue: 0.59 },
  { id: 'process', title: 'PROCESS', category: '戦略 → 研修 → 開発 → 定着 → 実装', position: z, rotation: z, scale: 1.0, seed: 109, hue: 0.6 },
  { id: 'roadmap', title: 'ROADMAP', category: '構想 → 実証 → 実装 → 展開', position: z, rotation: z, scale: 0.95, seed: 127, hue: 0.61 },
  { id: 'founder', title: 'FOUNDER', category: '代表取締役 住田 隆真', position: z, rotation: z, scale: 0.95, seed: 131, hue: 0.6 },
  { id: 'contact', title: 'CONTACT', category: 'AI戦略から、まず話す', position: z, rotation: z, scale: 1.0, seed: 149, hue: 0.58 },
];

/** Retained for any importers; not used by the spiral. */
export const GALLERY_DEPTH = -6;

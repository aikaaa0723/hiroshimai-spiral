import { create } from 'zustand';

export type Quality = 'low' | 'medium' | 'high';

interface GalleryState {
  /** Smoothed scroll progress 0..1 across the whole gallery. */
  scroll: number;
  /** Normalized pointer -1..1 per axis, origin at viewport center. */
  pointer: { x: number; y: number };
  /** id of the currently hovered card, or null. */
  hoveredId: string | null;
  /** Index of the card the camera is currently closest to. */
  activeIndex: number;
  quality: Quality;
  ready: boolean;
  menuOpen: boolean;

  setScroll: (v: number) => void;
  setPointer: (x: number, y: number) => void;
  setHovered: (id: string | null) => void;
  setActiveIndex: (i: number) => void;
  setQuality: (q: Quality) => void;
  setReady: (v: boolean) => void;
  toggleMenu: (v?: boolean) => void;
}

export const useGallery = create<GalleryState>((set) => ({
  scroll: 0,
  pointer: { x: 0, y: 0 },
  hoveredId: null,
  activeIndex: 0,
  quality: 'high',
  ready: false,
  menuOpen: false,

  setScroll: (v) => set({ scroll: v }),
  setPointer: (x, y) => set({ pointer: { x, y } }),
  setHovered: (id) => set((s) => (s.hoveredId === id ? s : { hoveredId: id })),
  setActiveIndex: (i) => set((s) => (s.activeIndex === i ? s : { activeIndex: i })),
  setQuality: (q) => set((s) => (s.quality === q ? s : { quality: q })),
  setReady: (v) => set({ ready: v }),
  toggleMenu: (v) => set((s) => ({ menuOpen: v ?? !s.menuOpen })),
}));
